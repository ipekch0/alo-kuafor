const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');

const knownKeys = {
    'CLOUDINARY_CLOUD_NAME': 'dkwoldjf7',
    'CLOUDINARY_API_KEY': '797142311253717',
    'CLOUDINARY_API_SECRET': '_IvjJsDHVXRa-_u2W3A8ImnovEM',
    'WHATSAPP_ACCESS_TOKEN': 'EAAZAZAMaAliCIBQMZBSV7HovskK7UdHwjiaI0Xm86mHW5cXJ77hV2JjqaQBkWnqAZCLpLHxhGL5fFTjxOpbQZBZBXNRVr1UToGWOwbTJpR0HjgEXPvXzOrHhWdEH3cl7VfRZAR3Woj7MeqvLhOlQdHgrveqCTHURSfrj5sBynr5ZCZAsOVFHfcKhZBF6FcIxNzDZCPSbReeLaww1ijyOcq87PSwGzE0emAAYbknFpVYsokCKuBxIWSLdJfsDNjHEqXtET9e7H1CGky4hn4WDeZBbzoJa',
    'WHATSAPP_PHONE_NUMBER_ID': '822137460992821',
    'WHATSAPP_VERIFY_TOKEN': 'odakmanage_webhook_secret_2025'
};

try {
    let content = '';
    if (fs.existsSync(envPath)) {
        content = fs.readFileSync(envPath, 'utf8');
    }

    // Split into lines
    let lines = content.split(/\r?\n/);

    // Filter out lines that contain our known keys (to avoid duplicates or conflicts)
    lines = lines.filter(line => {
        for (const key of Object.keys(knownKeys)) {
            if (line.trim().startsWith(key + '=')) return false;
            // Also filter if line *contains* key (handling the mashed case)
            if (line.includes(key + '=')) return false;
        }
        return true;
    });

    // Remove empty lines at end
    while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
        lines.pop();
    }

    // Append known keys
    lines.push(''); // spacer
    for (const [key, value] of Object.entries(knownKeys)) {
        lines.push(`${key}=${value}`);
    }

    fs.writeFileSync(envPath, lines.join('\n') + '\n');
    console.log('✅ .env rewritten safely.');

} catch (e) {
    console.error('Error rewriting .env:', e);
}
