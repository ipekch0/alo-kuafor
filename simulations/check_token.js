require('dotenv').config({ path: '../server/.env' });
const axios = require('axios');

async function checkToken() {
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const id = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!token) {
        console.error('❌ Token is MISSING in .env');
        return;
    }

    console.log('Checking token...');

    try {
        const url = `https://graph.facebook.com/v17.0/${id}`;
        const res = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Token Valid! Phone Info:', res.data);
    } catch (error) {
        console.error('❌ Token/ID Error:', error.response ? error.response.data : error.message);
    }
}

checkToken();
