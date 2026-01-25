const axios = require('axios');

const payload = {
    "object": "whatsapp_business_account",
    "entry": [
        {
            "id": "123456789",
            "changes": [
                {
                    "value": {
                        "messaging_product": "whatsapp",
                        "metadata": {
                            "display_phone_number": "1234567890",
                            "phone_number_id": "123456"
                        },
                        "contacts": [{ "profile": { "name": "Test User" }, "wa_id": "905551234567" }],
                        "messages": [
                            {
                                "from": "905551234567",
                                "id": "wamid.test",
                                "timestamp": "1701888888",
                                "text": { "body": "Merhaba, randevu almak istiyorum" },
                                "type": "text"
                            }
                        ]
                    },
                    "field": "messages"
                }
            ]
        }
    ]
};

async function test() {
    try {
        console.log('Sending webhook request...');
        const res = await axios.post('http://localhost:5000/api/whatsapp/webhook', payload);
        console.log('Status:', res.status);
        console.log('Data:', res.data);
    } catch (err) {
        console.error('Error:', err.message);
        if (err.response) {
            console.error('Response data:', err.response.data);
        }
    }
}

test();
