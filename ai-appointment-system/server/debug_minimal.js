require('dotenv').config();
const axios = require('axios');

async function test() {
    try {
        const url = `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
        await axios.post(url, {
            messaging_product: 'whatsapp',
            to: '905551234567',
            type: "text",
            text: { body: "Test" }
        }, {
            headers: { Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}` }
        });
        console.log('SUCCESS');
    } catch (e) {
        if (e.response) console.log(JSON.stringify(e.response.data));
        else console.log(e.message);
    }
}
test();
