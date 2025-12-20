const axios = require('axios');
const API_KEY = "AIzaSyClNuFBQHmbWI_TTT5stSdZxflK0XpuAHo";
const MODEL = "models/gemma-3-1b-it";

async function test() {
    console.log(`Testing ${MODEL}...`);
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/${MODEL}:generateContent?key=${API_KEY}`;
        const res = await axios.post(url, {
            contents: [{ parts: [{ text: "Hi" }] }]
        });
        console.log("SUCCESS");
        console.log(res.data.candidates[0].content.parts[0].text);
    } catch (e) {
        console.error("FAILED");
        console.error(e.response?.data || e.message);
    }
}
test();
