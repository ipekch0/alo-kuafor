const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');

try {
    let content = fs.readFileSync(envPath, 'utf8');

    // Split by common delimiters that might have been mashed together
    // E.g. looking for "KEY=" patterns

    // First, normalize line endings
    content = content.replace(/\r\n/g, '\n');

    // Fix cases where a key starts immediately after a value without newline
    // Regex lookahead: Value...KEY=
    // We assume keys are UPPERCASE_WITH_UNDERSCORES
    content = content.replace(/([a-zA-Z0-9_]+)=([^\n]+?)([A-Z_]+=[^\n]+)/g, '$1=$2\n$3');

    // Also specifically fix the CLOUDINARY/WHATSAPP junction if predictable
    content = content.replace(/_IvjJsDHVXRa-_u2W3A8ImnovEMWHATSAPP/, '_IvjJsDHVXRa-_u2W3A8ImnovEM\nWHATSAPP');

    // Remove empty lines
    const lines = content.split('\n').filter(line => line.trim() !== '');

    // Write back properly
    fs.writeFileSync(envPath, lines.join('\n') + '\n');

    console.log('✅ .env fixed.');
} catch (e) {
    console.error('Error fixing .env:', e);
}
