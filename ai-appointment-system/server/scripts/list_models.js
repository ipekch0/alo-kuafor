require('dotenv').config();
const axios = require('axios');

const API_KEY = "AIzaSyClNuFBQHmbWI_TTT5stSdZxflK0XpuAHo";

async function listModels() {
    console.log("Listing models for key starting with:", API_KEY?.substring(0, 5));
    try {
        const res = await axios.get(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
        );
        res.data.models.forEach(m => {
            console.log(`- ${m.name}`);
        });
    } catch (e) {
        console.error("List failed:", JSON.stringify(e.response?.data || e.message, null, 2));
    }
}

listModels();
