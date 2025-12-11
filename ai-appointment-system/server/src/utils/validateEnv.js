const { cleanEnv, str, port, url } = require('envalid');

function validateEnv() {
    cleanEnv(process.env, {
        NODE_ENV: str({ choices: ['development', 'test', 'production', 'provision'] }),
        PORT: port(),
        JWT_SECRET: str(),
        DATABASE_URL: str(),
        // Client URL for CORS
        CLIENT_URL: url({ default: 'http://localhost:5173', desc: 'The frontend URL' }),

        // Cloudinary
        CLOUDINARY_CLOUD_NAME: str(),
        CLOUDINARY_API_KEY: str(),
        CLOUDINARY_API_SECRET: str(),

        // WhatsApp Cloud API
        WHATSAPP_ACCESS_TOKEN: str(),
        WHATSAPP_PHONE_NUMBER_ID: str(),
        WHATSAPP_VERIFY_TOKEN: str(),
    });
}

module.exports = validateEnv;
