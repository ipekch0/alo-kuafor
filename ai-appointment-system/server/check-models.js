require('dotenv').config({ path: 'server/.env' });
const axios = require('axios');

async function checkModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API Key found in .env");
        return;
    }

    try {
        const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const fs = require('fs');
        const models = [];
        response.data.models.forEach(model => {
            if (model.supportedGenerationMethods.includes('generateContent')) {
                models.push(model.name.replace('models/', ''));
            }
        });
        fs.writeFileSync('server/models.txt', models.join('\n'));
        console.log("Models written to server/models.txt");
    } catch (error) {
        console.error("Error fetching models:", error.response ? error.response.data : error.message);
    }
}

checkModels();
