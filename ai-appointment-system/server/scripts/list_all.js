const axios = require('axios');
const API_KEY = "AIzaSyClNuFBQHmbWI_TTT5stSdZxflK0XpuAHo";

async function list() {
    const res = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
    res.data.models.forEach(m => {
        if (m.supportedGenerationMethods.includes('generateContent')) {
            console.log(m.name);
        }
    });
}
list();
