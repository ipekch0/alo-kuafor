const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const aiService = require('./src/services/aiService');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function verifyFlow() {
    try {
        console.log('🤖 Starting Selin Verification Chat...\n');
        const sessionId = "verify_" + Date.now();

        // 1. Greeting
        console.log('👤 User: Merhaba');
        let res = await aiService.chat("Merhaba", sessionId);
        console.log('🌸 Selin:', res.message.replace(/\n/g, ' '));
        console.log('--------------------------------------------------');
        await sleep(2000);

        // 2. Ask for Availability
        console.log('👤 User: Yarın saç kesimi istiyorum, müsaitlik var mı?');
        res = await aiService.chat("Yarın saç kesimi istiyorum, müsaitlik var mı?", sessionId);
        console.log('🌸 Selin:', res.message.replace(/\n/g, ' '));
        console.log('--------------------------------------------------');
        await sleep(2000);

        // 3. Negotiate Time (Try to book a slot)
        console.log('👤 User: Tamam, yarın saat 15:30 uygun mu?');
        res = await aiService.chat("Tamam, yarın saat 15:30 uygun mu?", sessionId);
        console.log('🌸 Selin:', res.message.replace(/\n/g, ' '));
        if (res.action) console.log('⚡ ACTION TRIGGERED:', res.action);
        console.log('--------------------------------------------------');

    } catch (error) {
        console.error('❌ Error during verification:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyFlow();
