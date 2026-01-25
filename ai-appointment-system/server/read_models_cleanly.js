const axios = require('axios');
const fs = require('fs');
const apiKey = "AIzaSyAKuoa_PM9JddJTwULp3NRhm6wOgR_WctQ";

async function run() {
    try {
        const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const names = response.data.models.map(m => m.name);
        fs.writeFileSync('model_names.json', JSON.stringify(names, null, 2));
        console.log("Saved to model_names.json");
    } catch (error) {
        console.error("Error:", error.message);
    }
}
run();
