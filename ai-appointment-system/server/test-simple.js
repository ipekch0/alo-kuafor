// Simple test without any complexity
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = process.env.GEMINI_API_KEY;

console.log('Testing Gemini API...');
console.log('API Key:', API_KEY ? `${API_KEY.substring(0, 20)}...` : 'NOT SET');
console.log('API Key Length:', API_KEY ? API_KEY.length : 0);

const genAI = new GoogleGenerativeAI(API_KEY);
// List models
async function listModels() {
    try {
        // Note: The SDK doesn't expose listModels directly on the main class easily in some versions, 
        // but we can try to use the model to generate content and see if we can get a better error or just try a known working model.
        // Actually, let's try 'gemini-pro' again but with a different approach or just print the error fully.
        // Wait, the error message said "Call ListModels".
        // Let's try to use the model 'gemini-1.0-pro' which is the older stable one.
        const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
        const result = await model.generateContent("Test");
        console.log('gemini-1.0-pro works!');
        console.log(result.response.text());
    } catch (error) {
        console.log('gemini-1.0-pro failed:', error.message);

        try {
            console.log('Trying gemini-pro...');
            const model2 = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result2 = await model2.generateContent("Test");
            console.log('gemini-pro works!');
            console.log(result2.response.text());
        } catch (err2) {
            console.log('gemini-pro failed:', err2.message);
        }
    }
}

listModels();
