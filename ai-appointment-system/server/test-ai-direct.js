require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
    console.log('Testing Gemini API...');
    console.log('API Key present:', !!process.env.GEMINI_API_KEY);
    console.log('API Key length:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const result = await model.generateContent("Merhaba, nasılsın?");
        const response = await result.response;
        const text = response.text();

        console.log('✅ Gemini API Success!');
        console.log('Response:', text);
    } catch (error) {
        console.error('❌ Gemini API Failed!');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        if (error.response) {
            console.error('Error Response:', JSON.stringify(error.response, null, 2));
        }
    }
}

testGemini().then(() => {
    console.log('Test completed.');
}).catch(err => {
    console.error('Test failed with unhandled error:', err);
    process.exit(1);
});
