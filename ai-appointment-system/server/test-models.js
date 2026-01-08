const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const modelsToTest = [
    "models/gemini-pro",
    "models/gemini-1.5-flash",
    "gemini-1.5-flash-8b",
    "gemini-2.0-flash-exp"
];

async function testModels() {
    console.log('Testing models with API Key ending in ...' + API_KEY.slice(-4));

    for (const modelName of modelsToTest) {
        console.log(`\nTesting model: ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hi");
            console.log(`✅ SUCCESS: ${modelName} is working!`);
            console.log(`Response: ${result.response.text()}`);
            return; // Stop after finding a working model
        } catch (error) {
            console.log(`❌ FAILED: ${modelName}`);
            console.log(`Error: ${error.message.split('\n')[0]}`); // Print first line of error
        }
    }
    console.log('\n❌ All models failed.');
}

testModels();
