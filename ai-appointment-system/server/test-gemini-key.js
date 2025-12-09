const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testKey() {
    console.log('Testing Gemini Key...');
    const key = process.env.GEMINI_API_KEY;
    console.log('Key present:', !!key);
    if (!key) {
        console.error('No GEMINI_API_KEY found in .env');
        return;
    }
    
    console.log('Key prefix:', key.substring(0, 5));

    try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent('Hello, are you working?');
        const response = await result.response;
        console.log('Success! Response:', response.text());
    } catch (error) {
        console.error('Error testing key:', error.message);
        if (error.message.includes('403')) {
            console.error('Result: KEY IS INVALID or EXPIRED (403 Forbidden)');
        }
    }
}

testKey();
