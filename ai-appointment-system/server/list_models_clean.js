const axios = require('axios');
const apiKey = "AIzaSyAKuoa_PM9JddJTwULp3NRhm6wOgR_WctQ";

async function listModels() {
    try {
        const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        console.log("--- AVAILABLE EXPERIMENTAL MODELS ---");
        response.data.models.forEach(m => {
            if (m.name.includes('gemini')) {
                console.log(m.name);
            }
        });
    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
    }
}

listModels();
