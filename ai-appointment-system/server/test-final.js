require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
    console.log('Testing API Key:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        console.log('Sending request to Gemini...');
        const result = await model.generateContent('Merhaba, nasılsın?');
        const response = await result.response;
        console.log('Response received:', response.text());
        console.log('SUCCESS: API Key is working!');
    } catch (error) {
        console.error('ERROR: API Key failed.');
        console.error(error.message);
    }
}

test();
