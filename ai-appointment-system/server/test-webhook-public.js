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
                        "contacts": [{ "profile": { "name": "Tunnel Tester" }, "wa_id": "905559999999" }],
                        "messages": [
                            {
                                "from": "905559999999",
                                "id": "wamid.tunneltest",
                                "timestamp": "1701888888",
                                "text": { "body": "Tunel testi" },
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
    const url = 'https://fancy-symbols-stay.loca.lt/api/whatsapp/webhook';
    console.log('Testing Public URL:', url);
    try {
        const res = await axios.post(url, payload);
        console.log('Status:', res.status);
        console.log('Data:', res.data);
    } catch (err) {
        console.error('Error:', err.message);
        if (err.response) {
            console.error('Response status:', err.response.status);
            console.error('Response data:', err.response.data);
        }
    }
}

test();
