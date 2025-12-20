const axios = require('axios');

async function triggerWebhook() {
    try {
        const payload = {
            object: "whatsapp_business_account",
            entry: [{
                id: "123456789",
                changes: [{
                    value: {
                        messaging_product: "whatsapp",
                        metadata: {
                            display_phone_number: "1234567890",
                            phone_number_id: "PHONE_NUMBER_ID_HERE" // Need to find a valid ID from DB
                        },
                        contacts: [{
                            profile: { name: "Test User" },
                            wa_id: "905551234567"
                        }],
                        messages: [{
                            from: "905551234567",
                            id: "wamid.HBgL...",
                            timestamp: "1702234567",
                            text: { body: "Merhaba, deneme mesajı" },
                            type: "text"
                        }]
                    },
                    field: "messages"
                }]
            }]
        };

        // Need the secret to sign it, or we can temporarily disable signature verification in whatsappCloud.js
        // For now, let's try sending it. If it fails with 401, we know it reached.

        console.log("Sending mock webhook...");
        const res = await axios.post('http://localhost:5000/api/whatsapp/webhook', payload);
        console.log("Response:", res.status, res.data);

    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
    }
}

triggerWebhook();
