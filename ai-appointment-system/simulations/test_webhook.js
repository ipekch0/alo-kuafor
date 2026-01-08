const axios = require('axios');

const payload = {
    object: 'whatsapp_business_account',
    entry: [{
        id: '123456789',
        changes: [{
            value: {
                messaging_product: 'whatsapp',
                metadata: { display_phone_number: '123456789', phone_number_id: '12345' },
                contacts: [{ profile: { name: 'Test User' }, wa_id: '905551234567' }],
                messages: [{
                    from: '905551234567',
                    id: 'wamid.test',
                    timestamp: Date.now() / 1000,
                    text: { body: 'Merhaba, randevu almak istiyorum' },
                    type: 'text'
                }]
            },
            field: 'messages'
        }]
    }]
};

async function testWebhook() {
    try {
        console.log('Sending test webhook to localhost:5000...');
        const res = await axios.post('http://localhost:5000/api/whatsapp/webhook', payload);
        console.log('Status:', res.status);
        console.log('Response:', res.data);
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Data:', error.response.data);
        }
    }
}

testWebhook();
