require('dotenv').config();
const aiService = require('./src/services/aiService');
const fs = require('fs');

async function test() {
    console.log('Testing AI Service...');
    try {
        const response = await aiService.chat('Merhaba, randevu almak istiyorum.');
        fs.writeFileSync('server/test-output.txt', JSON.stringify(response, null, 2));
    } catch (error) {
        fs.writeFileSync('server/test-output.txt', 'Test Failed: ' + error.message);
    }
}

test();
