const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const aiService = require('./aiService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class WhatsappManager {
    constructor() {
        this.sessions = new Map(); // salonId -> { client, qr, status, info }
    }

    async startSession(salonId) {
        // Check if session exists and is stuck or needs restart
        if (this.sessions.has(salonId)) {
            const oldSession = this.sessions.get(salonId);
            if (oldSession.status === 'READY') {
                console.log(`Session already active for salon ${salonId}`);
                return;
            }
            // Cleanup old/stuck session
            console.log(`Cleaning up old session for salon ${salonId}...`);
            if (oldSession.client) {
                try {
                    await oldSession.client.destroy();
                } catch (e) {
                    console.warn('Failed to destroy old client:', e.message);
                }
            }
            this.sessions.delete(salonId);
        }

        console.log(`Starting WhatsApp session for salon: ${salonId}`);

        // Initialize session state
        this.sessions.set(salonId, {
            client: null,
            qr: null,
            status: 'INITIALIZING',
            info: null
        });

        // Check for Render Persistent Disk
        const fs = require('fs');
        const PERISTENT_PATH = '/var/data/whatsapp';
        const authPath = fs.existsSync(PERISTENT_PATH) ? PERISTENT_PATH : './.wwebjs_auth';

        console.log(`Using WhatsApp Auth Path: ${authPath}`);

        const client = new Client({
            authStrategy: new LocalAuth({
                clientId: `salon-${salonId}`,
                dataPath: authPath
            }),
            authTimeoutMs: 60000, // Wait longer for auth on slow servers
            qrMaxRetries: 5,
            puppeteer: {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu',
                    '--disable-extensions',
                    '--disable-software-rasterizer',
                    '--disable-gl-drawing-for-tests',
                    '--window-size=1280,800',
                    '--disable-notifications'
                ]
            }
        });

        // Store client
        const session = this.sessions.get(salonId);
        session.client = client;

        // Event: QR Received
        client.on('qr', async (qr) => {
            console.log(`QR Received for salon ${salonId}`);
            try {
                // Convert QR to Data URL for frontend display
                const qrImage = await qrcode.toDataURL(qr);
                session.qr = qrImage;
                session.status = 'QR_READY';
            } catch (err) {
                console.error('QR Generation Error:', err);
            }
        });

        // Event: Ready
        client.on('ready', () => {
            console.log(`WhatsApp Client is ready for salon ${salonId}!`);
            session.status = 'READY';
            session.qr = null; // Clear QR once connected
            session.info = client.info;
        });

        // Event: Authenticated
        client.on('authenticated', () => {
            console.log(`Authenticated salon ${salonId}`);
            session.status = 'AUTHENTICATED';
        });

        // Event: Auth Failure
        client.on('auth_failure', (msg) => {
            console.error(`Auth failure for salon ${salonId}:`, msg);
            session.status = 'ERROR';
        });

        // Event: Message Received
        client.on('message', async (message) => {
            try {
                // Ignore status updates and extremely short messages
                if (message.body.length < 1 || message.isStatus) return;

                console.log(`Message received for salon ${salonId} from ${message.from}: ${message.body}`);

                // 1. Get Salon Context
                const salon = await prisma.salon.findUnique({
                    where: { id: salonId },
                    include: { services: true }
                });

                if (!salon) return;

                // 2. Find or Create User (for Chat History)
                const senderPhone = message.from.replace('@c.us', '');
                let user = await prisma.user.findFirst({
                    where: { phone: senderPhone }
                });

                if (!user) {
                    // Create a placeholder user for WhatsApp guest
                    const placeholderEmail = `${senderPhone}@whatsapp.guest`;
                    // Check if email exists (edge case)
                    const emailExists = await prisma.user.findUnique({ where: { email: placeholderEmail } });

                    if (emailExists) {
                        user = emailExists;
                    } else {
                        user = await prisma.user.create({
                            data: {
                                name: "WhatsApp Misafir",
                                phone: senderPhone,
                                email: placeholderEmail,
                                password: "wa_guest_auto_pwd", // Dummy password
                                role: "CUSTOMER",
                                isVerified: true
                            }
                        });
                    }
                }

                // 3. Find or Create Conversation
                let conversation = await prisma.conversation.findUnique({
                    where: {
                        salonId_userId: {
                            salonId: salon.id,
                            userId: user.id
                        }
                    }
                });

                if (!conversation) {
                    conversation = await prisma.conversation.create({
                        data: {
                            salonId: salon.id,
                            userId: user.id
                        }
                    });
                }

                // 4. Save USER Message
                await prisma.message.create({
                    data: {
                        conversationId: conversation.id,
                        senderType: 'USER',
                        content: message.body,
                        isRead: false
                    }
                });

                // 5. Fetch History (Last 10 messages)
                const historyRaw = await prisma.message.findMany({
                    where: { conversationId: conversation.id },
                    take: 10,
                    orderBy: { createdAt: 'desc' }
                });

                // Reverse to chronological order and format for AI
                const history = historyRaw.reverse().map(msg => ({
                    role: msg.senderType === 'USER' ? 'user' : 'assistant',
                    content: msg.content
                }));

                // 6. Call AI Service with History
                // Pass history in context
                const aiContext = {
                    ...salon,
                    history: history
                };

                const aiResponse = await aiService.chat(message.body, message.from, aiContext);

                // 7. Save AI Response
                await prisma.message.create({
                    data: {
                        conversationId: conversation.id,
                        senderType: 'SALON',
                        content: aiResponse.message,
                        isRead: true
                    }
                });

                // 8. Reply to user
                await client.sendMessage(message.from, aiResponse.message);

            } catch (error) {
                console.error('Error handling message:', error);
            }
        });

        // Event: Disconnected
        client.on('disconnected', async (reason) => {
            console.log(`Client disconnected for salon ${salonId}:`, reason);
            session.status = 'DISCONNECTED';

            // Clean up the client to prevent memory leaks
            try {
                await client.destroy();
            } catch (e) {
                console.warn('Error destroying client on disconnect:', e);
            }

            this.sessions.delete(salonId);

            // Auto-reconnect if not manually logged out (logic could be refined)
            // For now, always try to reconnect if it was an unexpected disconnect
            if (reason !== 'LOGOUT') {
                console.log(`Attempting auto-reconnect for salon ${salonId} in 5s...`);
                setTimeout(() => {
                    this.startSession(salonId).catch(e => console.error('Reconnection failed:', e));
                }, 5000);
            }
        });

        try {
            await client.initialize();
        } catch (err) {
            console.error(`Failed to initialize client for salon ${salonId}:`, err);
            session.status = 'ERROR';
        }
    }

    getSessionStatus(salonId) {
        const session = this.sessions.get(salonId);
        if (!session) return { status: 'DISCONNECTED', qr: null };
        return {
            status: session.status,
            qr: session.qr,
            phone: session.info?.wid?.user
        };
    }

    async logout(salonId) {
        const session = this.sessions.get(salonId);
        if (session && session.client) {
            try {
                await session.client.logout();
                await session.client.destroy();
            } catch (e) {
                console.error('Logout error:', e);
            }
        }
        this.sessions.delete(salonId);
        return { success: true };
    }
    async sendMessage(salonId, phone, message) {
        const session = this.sessions.get(salonId);
        if (!session || session.status !== 'READY' || !session.client) {
            console.warn(`WhatsApp not ready for salon ${salonId}`);
            return { success: false, error: 'WhatsApp not connected' };
        }

        try {
            // Whatsapp-web.js requires phone in specific format: 905551234567@c.us
            const cleanPhone = phone.replace(/\D/g, '');
            const chatId = `${cleanPhone}@c.us`;

            await session.client.sendMessage(chatId, message);
            return { success: true };
        } catch (error) {
            console.error(`Failed to send message to ${phone} for salon ${salonId}:`, error);
            return { success: false, error: error.message };
        }
    }
}

// Singleton instance
module.exports = new WhatsappManager();
