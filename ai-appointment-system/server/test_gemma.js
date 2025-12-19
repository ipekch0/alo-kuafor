const axios = require('axios');
const apiKey = "AIzaSyAKuoa_PM9JddJTwULp3NRhm6wOgR_WctQ";
const url = "https://generativelanguage.googleapis.com/v1beta/models/gemma-2-9b-it:generateContent";

async function test() {
    try {
        console.log("Testing gemma-2-9b-it...");
        const response = await axios.post(`${url}?key=${apiKey}`, {
            contents: [{ parts: [{ text: "Hi" }] }]
        });
        console.log("SUCCESS code:", response.status);
    } catch (e) {
        console.log("FAILED code:", e.response?.status);
    }
}
test();
