const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const axios = require('axios');

async function testCloudSend() {
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    // Testing with the business number itself or a specific number
    const to = '905387405669'; // Your number from history or safe test

    if (!token || !phoneId) {
        console.error('❌ Missing credentials in .env');
        return;
    }

    console.log(`Sending from ID: ${phoneId} to ${to}`);

    try {
        const res = await axios.post(
            `https://graph.facebook.com/v18.0/${phoneId}/messages`,
            {
                messaging_product: 'whatsapp',
                to: to,
                type: 'template',
                template: {
                    name: 'hello_world',
                    language: {
                        code: 'en_US'
                    }
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log('✅ Message Sent! ID:', res.data.messages[0].id);
    } catch (e) {
        console.error('❌ Send Failed:', e.response?.data || e.message);
    }
}

testCloudSend();
