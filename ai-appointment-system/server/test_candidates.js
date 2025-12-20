const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const apiKey = process.env.GEMINI_API_KEY;
const models = ["gemini-flash-latest"];

async function test() {
    for (const model of models) {
        console.log(`Testing ${model}...`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        try {
            await axios.post(url, {
                contents: [{ parts: [{ text: "Hi" }] }]
            });
            console.log(`✅ ${model} WORKS!`);
            // Stop after first success
            return;
        } catch (e) {
            console.log(`❌ ${model} Failed: ${e.response?.status} - ${e.response?.data?.error?.message}`);
        }
    }
}

test();
