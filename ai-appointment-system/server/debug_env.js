require('dotenv').config();
const axios = require('axios');
const aiService = require('./src/services/aiService');

const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

console.log('--- DEBUG START (via debug_env.js) ---');
console.log('Token Present:', !!WHATSAPP_TOKEN, 'Length:', WHATSAPP_TOKEN?.length);
console.log('Phone ID:', PHONE_NUMBER_ID);

async function runDebug() {
    const from = '905551234567';
    const msgBody = 'Merhaba';

    try {
        console.log('\n[1] Calling AI Service...');
        let aiResponse = await aiService.chat(msgBody, from);
        console.log('[1] AI Success. Message length:', aiResponse?.message?.length);

        console.log('\n[2] Sending to WhatsApp...');
        const url = `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`;

        try {
            const res = await axios.post(
                url,
                {
                    messaging_product: 'whatsapp',
                    to: from,
                    text: { body: aiResponse.message }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log('✅ WhatsApp API Success! Message ID:', res.data.messages[0].id);
        } catch (waError) {
            console.error('❌ WhatsApp API Error');
            if (waError.response) {
                console.error('Status:', waError.response.status);
                console.error('Data:', JSON.stringify(waError.response.data));
            } else {
                console.error('Message:', waError.message);
            }
        }

    } catch (error) {
        console.error('❌ General Error:', error.message);
        console.error(error);
    }
}

runDebug();
