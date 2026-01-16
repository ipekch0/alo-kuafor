const axios = require('axios');

const API_KEY = "AIzaSyDSlPjk_qyUHQ5oI_XHLqixRSbgiPRZqxc";
// const MODEL = "gemma-3-4b-it";
const MODEL = "gemini-2.0-flash-exp"; // Fallback to a known model if gemma fails, but sticking to requested first.
// Actually let's test the requested one first.
const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
// const URL_GEMMA = `https://generativelanguage.googleapis.com/v1beta/models/gemma-2-9b-it:generateContent?key=${API_KEY}`; // Gemma 3 not always avail via API publicly same way?
// User said "gemma-3-4b-it". Let's try exactly that string.
const URL_USER_REQ = `https://generativelanguage.googleapis.com/v1beta/models/gemma-2-9b-it:generateContent?key=${API_KEY}`;
// Note: gemma-3-4b-it might be the wrong string, user might mean gemma-2. 
// Let's try the key with a STANDARD model (Gemini 1.5 Flash) to Verify functionality first.
// If the key works, the Issue is likely the Model Name.

async function testParam(url, name) {
    console.log(`Testing with ${name}...`);
    try {
        const response = await axios.post(url, {
            contents: [{ parts: [{ text: "Hello" }] }]
        }, { headers: { 'Content-Type': 'application/json' } });
        console.log(`✅ SUCCESS (${name}):`, response.data?.candidates?.[0]?.content?.parts?.[0]?.text);
    } catch (error) {
        console.error(`❌ FAILED (${name}):`, error.response?.data?.error?.message || error.message);
    }
}

async function run() {
    await testParam(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, "Gemini 1.5 Flash");
    // User asked for gemma. Let's try gemma-2-9b-it (common param) or checking if gemma-3 exists in their context
    // Assuming user meant "gemma-3-4b-it", let's try it.
    await testParam(`https://generativelanguage.googleapis.com/v1beta/models/gemma-3-4b-it:generateContent?key=${API_KEY}`, "Gemma 3 4b IT");
}

run();
