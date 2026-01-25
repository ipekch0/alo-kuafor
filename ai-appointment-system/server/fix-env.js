const fs = require('fs');
const content = `DATABASE_URL="file:./dev.db"
JWT_SECRET="super-secret-jwt-key-change-this"
GEMINI_API_KEY="AIzaSyBhdzyUW10uEa2eqxLzyvAMeyArwBoibSE"
WHATSAPP_ACCESS_TOKEN="EAAG..."
WHATSAPP_PHONE_NUMBER_ID="your_phone_number_id"
WHATSAPP_VERIFY_TOKEN="my_secure_token"`;

fs.writeFileSync('server/.env', content.trim());
console.log('.env file written successfully');
