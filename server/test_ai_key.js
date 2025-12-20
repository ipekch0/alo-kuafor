const axios = require('axios');
const fs = require('fs');

const apiKey = "AIzaSyAKuoa_PM9JddJTwULp3NRhm6wOgR_WctQ";

async function listModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models`;
    try {
        console.log(`Testing List Models...`);
        const response = await axios.get(`${url}?key=${apiKey}`);
        console.log(`✅ SUCCESS: Found ${response.data.models?.length} models.`);
        response.data.models.forEach(m => console.log(m.name));
    } catch (error) {
        const msg = `❌ FAILED List Models: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`;
        console.log(msg);
        fs.appendFileSync('error_log.txt', msg + '\n');
    }
}

listModels();
