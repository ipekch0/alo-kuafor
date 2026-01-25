require('dotenv').config();
const axios = require('axios');

async function checkToken() {
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const id = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!token) { console.log('NO_TOKEN'); return; }

    try {
        const res = await axios.get(`https://graph.facebook.com/v17.0/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('VALID_TOKEN');
        console.log(JSON.stringify(res.data));
    } catch (error) {
        console.log('INVALID_TOKEN');
        if (error.response) console.log(JSON.stringify(error.response.data));
        else console.log(error.message);
    }
}

checkToken();
