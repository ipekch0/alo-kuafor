const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const apiKey = process.env.GEMINI_API_KEY;
const MODEL = "gemini-1.5-flash";
const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

async function testModel() {
    console.log(`Testing model: ${MODEL}`);
    try {
        const response = await axios.post(
            URL,
            {
                contents: [{ parts: [{ text: "Hello" }] }]
            },
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log("✅ Success!");
        console.log("Response:", response.data.candidates[0].content.parts[0].text);
    } catch (error) {
        console.error("❌ Failed");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Error:", error.message);
        }
    }
}

testModel();
