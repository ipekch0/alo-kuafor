const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const axios = require('axios');

async function simulateIncomingMessage() {
    const port = process.env.PORT || 5000;
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN; // Actually, signature matters more for POST

    // We can't easily sign the request without the app secret logic perfectly mocked,
    // BUT we can temporarily bypass signature verification in the router OR manually invoke the service.
    // However, the cleanest integration test is to comment out signature verification for a second or use a test route.

    // BETTER APPROACH:
    // Let's call the 'handleIncomingMessage' logic indirectly or assume the dev server is running locally.
    // If we send a POST to /api/whatsapp/webhook, it will fail signature check.

    // So, let's inject a "bypass" header or just mock it if we run this script IN the server context.
    // But running in server context is hard.

    // Let's try to hit the webhook but we need to generate a valid signature.
    const crypto = require('crypto');
    const secret = process.env.FACEBOOK_APP_SECRET;

    if (!secret) {
        console.error('❌ FACEBOOK_APP_SECRET missing. Cannot sign request.');
        return;
    }

    const body = {
        object: 'whatsapp_business_account',
        entry: [{
            id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
            changes: [{
                value: {
                    messaging_product: 'whatsapp',
                    metadata: {
                        display_phone_number: '1234567890',
                        phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID
                    },
                    messages: [{
                        from: '905387405669', // YOUR NUMBER
                        id: 'wamid.HBgLM...',
                        timestamp: '1702324...',
                        text: {
                            body: 'Merhaba, randevu almak istiyorum'
                        },
                        type: 'text'
                    }]
                },
                field: 'messages'
            }]
        }]
    };

    const payload = JSON.stringify(body);
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    try {
        console.log('Testing Webhook with: "Merhaba, randevu almak istiyorum"');
        const res = await axios.post(`http://localhost:${port}/api/whatsapp/webhook`, body, {
            headers: {
                'x-hub-signature-256': `sha256=${signature}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('✅ Webhook Accepted:', res.status);
        console.log('👉 Check your actual WhatsApp phone to see if you got a reply!');
    } catch (e) {
        console.error('❌ Webhook Rejected:', e.response?.data || e.message);
    }
}

simulateIncomingMessage();
