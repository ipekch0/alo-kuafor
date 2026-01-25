const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const aiService = require('./aiService');
const prisma = new PrismaClient();

class WhatsappCloudService {
    constructor() {
        this.apiUrl = 'https://graph.facebook.com/v18.0';
    }

    // Send text message
    async sendMessage(phoneNumberId, to, text, token) {
        try {
            if (!token) throw new Error('WhatsApp Access Token not provided');

            await axios.post(
                `${this.apiUrl}/${phoneNumberId}/messages`,
                {
                    messaging_product: 'whatsapp',
                    to: to,
                    text: { body: text }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return true;
        } catch (error) {
            console.error('WhatsApp API Send Error:', error.response?.data || error.message);
            return false;
        }
    }

    // Handle incoming webhook events
    async handleWebhook(body) {
        try {
            if (!body.object) return;

            const entry = body.entry?.[0];
            const changes = entry?.changes?.[0];
            const value = changes?.value;
            const message = value?.messages?.[0];

            if (message) {
                const from = message.from; // User's phone number
                const text = message.text?.body;
                const phoneNumberId = value.metadata?.phone_number_id;

                console.log(`Cloud API Message from ${from}: ${text}`);

                // Ignore if no text
                if (!text) return;

                // 1. Find Salon associated with this Phone Number ID
                // "SaaS" Mode: We look up the salon that claimed this Phone Number ID
                let salon = await prisma.salon.findUnique({
                    where: { whatsappPhoneId: phoneNumberId }
                });

                // Fallback: If not found (e.g. testing), try to find the "Main Demo Salon" 
                if (!salon) {
                    console.log(`⚠️ Salon not found for Phone ID ${phoneNumberId}. Trying main demo salon...`);
                    // Try to find the salon owned by demo_admin OR just the first verified one
                    salon = await prisma.salon.findFirst({
                        where: { isVerified: true }
                    });
                }

                if (salon) {
                    console.log(`✅ Routing message to salon: ${salon.name} (ID: ${salon.id})`);

                    // 2. Process with AI
                    const aiResponse = await aiService.chat(text, from, salon);

                    // 3. Reply via Cloud API
                    if (salon.whatsappAPIToken) {
                        await this.sendMessage(phoneNumberId, from, aiResponse.message, salon.whatsappAPIToken);
                    } else {
                        console.error('❌ Salon has no API Token configured.');
                    }
                } else {
                    console.error('❌ No salon found to handle this message.');
                }
            }
        } catch (error) {
            console.error('Webhook Handler Error:', error);
        }
    }
}

module.exports = new WhatsappCloudService();
