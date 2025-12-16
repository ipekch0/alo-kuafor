
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

async function check() {
    try {
        const salon = await prisma.salon.findFirst();
        if (!salon) { console.log('No salon found'); return; }

        console.log('--- TOKEN VALIDATION CHECK ---');
        console.log('Phone ID:', salon.whatsappPhoneId);

        // 1. Check Token Validity by fetching Phone Number details
        try {
            const url = `https://graph.facebook.com/v18.0/${salon.whatsappPhoneId}?access_token=${salon.whatsappAPIToken}`;
            const res = await axios.get(url);
            console.log('✅ Token & Phone ID Valid!');
            console.log('Status:', res.data.verified_name);
            console.log('Quality Rating:', res.data.quality_rating);
        } catch (e) {
            console.error('❌ Token/Phone ID Error:', e.response?.data || e.message);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
check();
