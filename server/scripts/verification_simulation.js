const axios = require('axios');

// Initialize Gemini (COPIED FROM SERVER)
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

async function callGemini(apiKey, prompt) {
    const response = await axios.post(
        `${GEMINI_API_URL}?key=${apiKey}`,
        { contents: [{ parts: [{ text: prompt }] }] },
        { headers: { 'Content-Type': 'application/json' } }
    );
    if (response.data?.candidates?.[0]?.content?.parts?.[0]) {
        return { text: response.data.candidates[0].content.parts[0].text };
    }
    throw new Error("No response candidates");
}

async function run() {
    // HARDCODED KEY (COPIED FROM SERVER)
    const apiKey = "AIzaSyClNuFBQHmbWI_TTT5stSdZxflK0XpuAHo";

    console.log("Simulating aiService...");
    try {
        const res = await callGemini(apiKey, "Hello, are you working?");
        console.log("SUCCESS:", res.text);
    } catch (e) {
        console.error("FAILURE:", e.message);
        if (e.response) {
            console.error("Status:", e.response.status);
            console.error("Data:", JSON.stringify(e.response.data, null, 2));
        }
    }
}

run();
