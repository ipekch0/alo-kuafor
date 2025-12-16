require('dotenv').config();
const axios = require('axios');

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
const API_KEY = process.env.GEMINI_API_KEY;

console.log("--- GEMINI CONNECTION TEST ---");
console.log("API Key Exists:", !!API_KEY);
if (API_KEY) console.log("API Key Prefix:", API_KEY.substring(0, 5) + "...");

async function testConnection() {
    if (!API_KEY) {
        console.error("ERROR: GEMINI_API_KEY is missing in .env file");
        return;
    }

    try {
        console.log("Listing available models...");
        const response = await axios.get(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`,
            { timeout: 10000 }
        );


        console.log("Response Status:", response.status);
        console.log("Response Data:", JSON.stringify(response.data, null, 2));
        console.log("SUCCESS: Connection established!");

    } catch (error) {
        console.error("\n--- CONNECTION FAILED ---");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Error Data:", JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error("No Response Received (Network Issue):", error.message);
        } else {
            console.error("Error Message:", error.message);
        }
    }
}

testConnection();
