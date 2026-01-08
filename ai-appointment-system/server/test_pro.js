const axios = require('axios');
const apiKey = "AIzaSyAKuoa_PM9JddJTwULp3NRhm6wOgR_WctQ";
const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

async function test() {
    try {
        console.log("Testing gemini-pro...");
        const response = await axios.post(`${url}?key=${apiKey}`, {
            contents: [{ parts: [{ text: "Hi" }] }]
        });
        console.log("SUCCESS code:", response.status);
    } catch (e) {
        console.log("FAILED code:", e.response?.status);
        if (e.response?.status !== 404) console.log(JSON.stringify(e.response?.data));
    }
}
test();
