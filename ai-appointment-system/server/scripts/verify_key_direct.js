const axios = require('axios');

const API_KEY = "AIzaSyClNuFBQHmbWI_TTT5stSdZxflK0XpuAHo";
const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

async function verify() {
    console.log("Testing Key directly...");
    try {
        const response = await axios.post(URL, {
            contents: [{ parts: [{ text: "Hello" }] }]
        }, {
            headers: { 'Content-Type': 'application/json' }
        });
        console.log("SUCCESS! Key is valid.");
        console.log("Response:", response.data.candidates[0].content.parts[0].text);
    } catch (error) {
        console.error("FAILED.");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Error:", error.message);
        }
    }
}

verify();
