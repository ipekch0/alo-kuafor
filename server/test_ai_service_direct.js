const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { generateAIResponse } = require('./src/services/aiService');

async function test() {
    console.log('--- Testing Real AI Service ---');
    console.log('API Key present:', !!process.env.GEMINI_API_KEY);

    try {
        const response = await generateAIResponse("Merhaba, nasılsın?");
        console.log('AI Response:', response);
    } catch (error) {
        console.error('CRITICAL ERROR:', error);
    }
}

test();
