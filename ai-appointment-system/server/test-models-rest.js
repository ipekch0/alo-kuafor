const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const https = require('https');

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error('No API Key found');
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

console.log('Fetching models from:', url.replace(API_KEY, 'HIDDEN_KEY'));

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.error) {
                console.error('API Error:', JSON.stringify(json.error, null, 2));
            } else {
                console.log('Available Models:');
                if (json.models) {
                    json.models.forEach(m => console.log(`- ${m.name}`));
                } else {
                    console.log('No models found in response:', data);
                }
            }
        } catch (e) {
            console.error('Parse Error:', e);
            console.log('Raw Data:', data);
        }
    });
}).on('error', (e) => {
    console.error('Request Error:', e);
});
