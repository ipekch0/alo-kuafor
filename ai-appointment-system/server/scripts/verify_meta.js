const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function verifyCredentials() {
    console.log('--- Verifying Meta Credentials ---');
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!token || !phoneId) {
        console.error('❌ Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID in .env');
        return;
    }

    console.log(`Token: ${token.substring(0, 10)}...`);
    console.log(`Phone ID: ${phoneId}`);

    try {
        // 1. Check Phone Number Details
        const url = `https://graph.facebook.com/v18.0/${phoneId}?access_token=${token}`;
        const res = await axios.get(url);

        console.log('✅ Credentials Valid!');
        console.log('Phone Status:', res.data);

        if (res.data.quality_rating) {
            console.log(`Quality Rating: ${res.data.quality_rating}`);
        }

    } catch (error) {
        console.error('❌ Verification Failed:', error.response?.data || error.message);
        if (error.response?.data?.error?.code === 190) {
            console.log('👉 Reason: The Access Token has expired or is invalid.');
        }
    }
}

verifyCredentials();
