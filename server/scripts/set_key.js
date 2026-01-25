const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '../.env');

try {
    let content = '';
    if (fs.existsSync(envPath)) {
        content = fs.readFileSync(envPath, 'utf8');
    }

    const newKey = 'GEMINI_API_KEY=AIzaSyCCeC9_3FqLCwM7GREMieyMYHz8W5oWCQU';

    if (content.includes('GEMINI_API_KEY=')) {
        content = content.replace(/GEMINI_API_KEY=.*/g, newKey);
    } else {
        content += `\n${newKey}\n`;
    }

    fs.writeFileSync(envPath, content);
    console.log('SUCCESS: .env updated with new API Key.');
} catch (error) {
    console.error('FAILED to update .env:', error);
}
