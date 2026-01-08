const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '.env');

const emailUser = 'yipek8055@gmail.com';
const emailPass = 'fixnzavpljbpaxzw'; // Spaces removed

try {
    let content = '';
    if (fs.existsSync(envPath)) {
        content = fs.readFileSync(envPath, 'utf8');
    } else {
        console.log('.env file not found, creating new one.');
    }

    // Update EMAIL_USER
    if (content.includes('EMAIL_USER=')) {
        content = content.replace(/EMAIL_USER=.*/g, `EMAIL_USER=${emailUser}`);
    } else {
        content += `\nEMAIL_USER=${emailUser}\n`;
    }

    // Update EMAIL_PASS
    if (content.includes('EMAIL_PASS=')) {
        content = content.replace(/EMAIL_PASS=.*/g, `EMAIL_PASS=${emailPass}`);
    } else {
        content += `\nEMAIL_PASS=${emailPass}\n`;
    }

    // Ensure EMAIL_HOST is present
    if (!content.includes('EMAIL_HOST=')) {
        content += `\nEMAIL_HOST=smtp.gmail.com\n`;
    }

    fs.writeFileSync(envPath, content);
    console.log('Successfully updated .env file with email credentials');
} catch (error) {
    console.error('Error updating .env:', error);
}
