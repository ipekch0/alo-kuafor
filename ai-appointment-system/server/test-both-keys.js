require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Try BOTH API keys from the screenshot
const API_KEYS = [
    'AIzaSyD0JfbB7a_6hNBMVBto8uIoGjRiXpKodu8', // Current one (Default Gemini Project)
    'AIzaSyCleng-client-0753370987'  // The other one (Generative Language API Key) - PLACEHOLDER, need real key
];

async function testBothKeys() {
    for (let i = 0; i < API_KEYS.length; i++) {
        const apiKey = API_KEYS[i];
        console.log(`\n${'='.repeat(60)}`);
        console.log(`Testing API Key ${i + 1}: ${apiKey.substring(0, 20)}...`);
        console.log('='.repeat(60));

        const genAI = new GoogleGenerativeAI(apiKey);

        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
            const result = await model.generateContent('Merhaba, nasılsın?');
            const text = result.response.text();

            console.log(`\n✅✅✅ SUCCESS with API Key ${i + 1}! ✅✅✅`);
            console.log(`Response: ${text}`);
            console.log(`\n🎉 USE THIS KEY: ${apiKey}`);
            return apiKey;
        } catch (error) {
            console.log(`❌ Failed with API Key ${i + 1}`);
            console.log(`Error: ${error.status} - ${error.message}`);
        }
    }

    console.log('\n⚠️ Neither key worked. Please check:');
    console.log('1. API is enabled in Google Cloud Console');
    console.log('2. Wait 2-3 minutes after enabling');
    console.log('3. Try creating a NEW API key');
}

testBothKeys();
