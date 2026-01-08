const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function testGemini() {
    console.log('--- Gemini Connection Test ---');
    const key = process.env.GEMINI_API_KEY;

    if (!key) {
        console.error('❌ ERROR: GEMINI_API_KEY is missing in .env');
        return;
    }

    console.log(`✅ Key found: ${key.substring(0, 5)}...`);

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    try {
        console.log('Sending test prompt...');
        const result = await model.generateContent("Say hello in Turkish");
        const response = await result.response;
        const text = response.text();
        console.log('✅ Response received:', text);
    } catch (error) {
        console.error('❌ API Error:', error.message);
        if (error.response) {
            console.error('Details:', error.response);
        }
    }
}

testGemini();
