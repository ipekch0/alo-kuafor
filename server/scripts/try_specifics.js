const axios = require('axios');
const API_KEY = "AIzaSyClNuFBQHmbWI_TTT5stSdZxflK0XpuAHo";
const CANDIDATES = [
    "models/gemini-1.5-pro",
    "models/gemini-2.0-flash-exp",
    "models/gemini-1.5-flash-8b",
    "models/learnLM-1.5-pro-experimental"
];

async function test() {
    for (const m of CANDIDATES) {
        process.stdout.write(`Testing ${m} ... `);
        try {
            await axios.post(`https://generativelanguage.googleapis.com/v1beta/${m}:generateContent?key=${API_KEY}`, {
                contents: [{ parts: [{ text: "Hi" }] }]
            });
            console.log("SUCCESS");
        } catch (e) {
            console.log("FAILED " + e.response?.status);
        }
    }
}
test();
