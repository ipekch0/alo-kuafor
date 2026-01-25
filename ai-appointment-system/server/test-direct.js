require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testDirect() {
    try {
        console.log('API Key:', process.env.GEMINI_API_KEY ? `SET (${process.env.GEMINI_API_KEY.substring(0, 15)}...)` : 'NOT SET');

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // Try different model names
        const models = ['gemini-pro', 'gemini-1.0-pro', 'models/gemini-pro'];

        for (const modelName of models) {
            try {
                console.log(`\nTrying model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent('Say hello in Turkish');
                const response = await result.response;
                const text = response.text();
                console.log(`✅ SUCCESS with ${modelName}!`);
                console.log('Response:', text);
                break;
            } catch (err) {
                console.log(`❌ Failed with ${modelName}: ${err.message}`);
            }
        }
    } catch (error) {
        console.error('Fatal error:', error);
    }
}

testDirect();
