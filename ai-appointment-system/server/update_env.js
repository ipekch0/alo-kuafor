const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '.env');

try {
    let content = '';
    if (fs.existsSync(envPath)) {
        content = fs.readFileSync(envPath, 'utf8');
    }

    const whatsappToken = 'EAAZAZAMaAliCIBQCu4ufaHgILZAo1xCSqkqdArufsMxHz1pZAdrmxkRNHoK6Fvy7lVFhMrgHyS1AVCWsdkvwfMXZCSpsOnLvEt2D1XiPHCICnQ0qA5W4oJScaVUoTRzKx0XDR7l9pbz3BLntF42ZCDqzhyfFnkHChHTskewEdRzYpY0kaRHsrTFFAdZAZC7a5V5TjZAOwpf575fxyUTQ7Mc7oG9wXpQCbzbiuuYUlawATMhSi7J87ZAJzsESeyrfdzApYsxgvkr5dNasvOS14ZCuMZAU';
    const geminiKey = 'AIzaSyBhdzyUW10uEa2eqxLzyvAMeyArwBoibSE';

    // Update WhatsApp Token
    if (content.includes('WHATSAPP_ACCESS_TOKEN=')) {
        content = content.replace(/WHATSAPP_ACCESS_TOKEN=.*/g, `WHATSAPP_ACCESS_TOKEN="${whatsappToken}"`);
    } else {
        content += `\nWHATSAPP_ACCESS_TOKEN="${whatsappToken}"\n`;
    }

    // Update Gemini Key
    if (content.includes('GEMINI_API_KEY=')) {
        content = content.replace(/GEMINI_API_KEY=.*/g, `GEMINI_API_KEY="${geminiKey}"`);
    } else {
        content += `\nGEMINI_API_KEY="${geminiKey}"\n`;
    }

    fs.writeFileSync(envPath, content);
    console.log('Successfully updated .env file with both keys');
} catch (error) {
    console.error('Error updating .env:', error);
}
