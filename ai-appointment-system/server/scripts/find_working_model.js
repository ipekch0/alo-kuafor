const axios = require('axios');

const API_KEY = "AIzaSyClNuFBQHmbWI_TTT5stSdZxflK0XpuAHo";

async function findWorkingModel() {
    console.log("Fetching available models...");
    try {
        const listRes = await axios.get(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
        );

        const models = listRes.data.models
            .filter(m => m.supportedGenerationMethods.includes('generateContent'))
            .map(m => m.name); // e.g., "models/gemini-pro"

        console.log(`Found ${models.length} generation models. Testing each...`);

        for (const modelName of models) {
            console.log(`Testing ${modelName} ... `);
            try {
                // Determine URL (some models might need v1 or v1beta, assuming v1beta for all gemini)
                const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${API_KEY}`;

                await axios.post(url, {
                    contents: [{ parts: [{ text: "Hi" }] }]
                });

                console.log("✅ SUCCESS!");
                const fs = require('fs');
                fs.writeFileSync('server/success_model.txt', modelName);
                console.log(`\n*** WORKING MODEL FOUND: ${modelName} ***\n`);
                return; // Stop after first success
            } catch (err) {
                // console.log("❌ Failed (" + (err.response?.status || err.message) + ")");
            }
        }
        console.log("\nNo working models found.");

    } catch (e) {
        console.error("Fatal error listing models:", e.response?.data || e.message);
    }
}

findWorkingModel();
