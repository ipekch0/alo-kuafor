const axios = require('axios');
const apiKey = "AIzaSyAKuoa_PM9JddJTwULp3NRhm6wOgR_WctQ";

async function listModels() {
    try {
        const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

        const models = response.data.models.map(m => m.name);

        console.log("--- ALL MODELS ---");
        models.forEach(m => console.log(m));
    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
    }
}

listModels();
