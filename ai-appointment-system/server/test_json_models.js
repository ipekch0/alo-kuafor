const axios = require('axios');
const fs = require('fs');
const apiKey = "AIzaSyAKuoa_PM9JddJTwULp3NRhm6wOgR_WctQ";

async function run() {
    const data = fs.readFileSync('model_names.json', 'utf8');
    const models = JSON.parse(data);
    const results = [];

    // Filter mainly for gemini/gemma to save time, but try robustly
    const targets = models.filter(m => m.includes('gemini') || m.includes('gemma'));

    console.log(`Testing ${targets.length} models...`);

    for (const model of targets) {
        // model string is like "models/gemini-1.5-flash"
        // endpoint expects .../models/gemini-1.5-flash:generateContent
        // NO, wait. 
        // If I use v1beta/models/{modelId}:generateContent
        // And modelId is "gemini-1.5-flash"
        // The list returned "models/gemini-1.5-flash". 

        // So I must strip "models/" prefix.
        const cleanId = model.replace('models/', '');
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanId}:generateContent`;

        try {
            await axios.post(`${url}?key=${apiKey}`, {
                contents: [{ parts: [{ text: "Hello" }] }]
            });
            const msg = `PASS: ${cleanId}`;
            console.log(msg);
            fs.appendFileSync('json_test_results.txt', msg + '\n');
        } catch (e) {
            const msg = `FAIL: ${cleanId} (${e.response?.status})`;
            console.log(msg);
            fs.appendFileSync('json_test_results.txt', msg + '\n');
        }
    }
}

run();
