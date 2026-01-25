const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const aiService = require('./src/services/aiService');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function debugAI() {
    try {
        console.log('--- START DEBUG ---');
        console.log('Testing AI Service with key present:', !!process.env.GEMINI_API_KEY);

        // Mock a user message
        const response = await aiService.chat("Merhaba, randevu almak istiyorum", "debug_session_1");

        console.log('--- AI RESPONSE ---');
        console.log(response);

    } catch (error) {
        console.error('--- CAUGHT ERROR ---');
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

debugAI();
