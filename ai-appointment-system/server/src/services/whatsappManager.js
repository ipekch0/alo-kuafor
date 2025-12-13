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

        const client = new Client({
            authStrategy: new LocalAuth({
                clientId: `salon-${salonId}`,
                dataPath: './.wwebjs_auth'
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
                    '--single-process', // Critical for some containers
                    '--disable-gpu',
                    '--disable-extensions',
                    '--disable-software-rasterizer',
                    '--disable-gl-drawing-for-tests',
                    '--window-size=1280,800', // Define size to avoid issues
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
                if (message.body.length < 2 || message.isStatus) return;

                console.log(`Message received for salon ${salonId} from ${message.from}: ${message.body}`);

                // Get Salon Context for AI
                const salon = await prisma.salon.findUnique({
                    where: { id: salonId },
                    include: {
                        services: true,
                        appointments: {
                            take: 5,
                            where: { status: 'completed' } // Just to give AI some context on style if needed
                        }
                    }
                });

                if (!salon) return;

                // Call AI Service with Salon Context
                const aiResponse = await aiService.chat(message.body, message.from, salon);

                // Reply to user
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
