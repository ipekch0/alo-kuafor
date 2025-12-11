const https = require('https');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const API_KEY = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.models) {
                console.log('--- MODELS START ---');
                json.models.forEach(m => console.log(m.name));
                console.log('--- MODELS END ---');
            } else {
                console.log('ERROR:', JSON.stringify(json));
            }
        } catch (e) { console.error('Parse Error'); }
    });
});
