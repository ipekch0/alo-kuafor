const { GoogleGenerativeAI } = require('@google/generative-ai');

// Direct key from screenshot
const API_KEY = 'AIzaSyBhdzyUW1OueA2eqxLzyvAMeyArwBoibSE';

console.log('Testing Direct Key:', API_KEY);

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

async function run() {
    try {
        const result = await model.generateContent("Merhaba");
        console.log('✅ SUCCESS!');
        console.log('Response:', result.response.text());
    } catch (error) {
        console.log('❌ ERROR:', error.message);
    }
}

run();
