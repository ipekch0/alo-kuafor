const axios = require('axios');

// Using the key provided in the conversation history
const apiKey = "AIzaSyAKuoa_PM9JddJTwULp3NRhm6wOgR_WctQ";

const candidates = [
    "gemini-1.5-flash",
    "models/gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "models/gemini-1.5-flash-latest",
    "gemini-1.5-flash-001",
    "models/gemini-1.5-flash-001",
    "gemini-pro",
    "models/gemini-pro",
    "gemma-2-9b-it",
    "models/gemma-2-9b-it"
];

async function testModel(modelName) {
    // If the modelName already has 'models/' prefix, the URL construction needs to be careful.
    // The standard endpoint is .../models/{modelId}:generateContent

    // If we pass "models/gemini-1.5-flash", and put it in .../models/${modelName}...
    // It becomes .../models/models/gemini-1.5-flash... which is invalid.

    // So we should STRIP 'models/' from the input if we are hardcoding the base URL with /models/
    // OR we just use the cleaner ID.

    const cleanId = modelName.replace('models/', '');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanId}:generateContent`;

    try {
        process.stdout.write(`Testing: ${cleanId.padEnd(25)} `);
        const response = await axios.post(
            `${url}?key=${apiKey}`,
            { contents: [{ parts: [{ text: "Hello" }] }] },
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log(`✅ SUCCESS! (Status: ${response.status})`);
        return cleanId;
    } catch (error) {
        console.log(`❌ FAILED (${error.response?.status || error.message})`);
        // console.log(JSON.stringify(error.response?.data?.error, null, 2));
        return null;
    }
}

async function run() {
    console.log("--- STARTING MODEL CHECK ---");
    for (const model of candidates) {
        const result = await testModel(model);
        if (result) {
            console.log(`\n🎉 FOUND WORKING MODEL: ${result}`);
            console.log(`Use this URL: https://generativelanguage.googleapis.com/v1beta/models/${result}:generateContent`);
            break;
        }
    }
    console.log("--- CHECK COMPLETE ---");
}

run();
