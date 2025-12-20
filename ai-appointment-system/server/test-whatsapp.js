const axios = require('axios');

async function testWhatsAppWebhook() {
    try {
        console.log('Testing WhatsApp Webhook...');

        const payload = {
            object: 'whatsapp_business_account',
            entry: [{
                id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
                changes: [{
                    value: {
                        messaging_product: 'whatsapp',
                        metadata: {
                            display_phone_number: '1234567890',
                            phone_number_id: '1234567890'
                        },
                        contacts: [{
                            profile: {
                                name: 'Test User'
                            },
                            wa_id: '905387405669' // Using your number as sender
                        }],
                        messages: [{
                            from: '905387405669', // Using your number as sender
                            id: 'wamid.test',
                            timestamp: Date.now(),
                            text: {
                                body: 'Merhaba, yarın saat 14:00 için saç kesimi randevusu almak istiyorum.'
                            },
                            type: 'text'
                        }]
                    },
                    field: 'messages'
                }]
            }]
        };

        const response = await axios.post('http://localhost:5000/api/whatsapp/webhook', payload);
        console.log('Webhook Response Status:', response.status);
        console.log('✅ Webhook test sent successfully!');
        console.log('Check the server logs to see the AI response and if it tried to reply via Meta API.');

    } catch (error) {
        console.error('Error testing webhook:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

testWhatsAppWebhook();
