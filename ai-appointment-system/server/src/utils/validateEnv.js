const { cleanEnv, str, port, url } = require('envalid');

function validateEnv() {
    cleanEnv(process.env, {
        NODE_ENV: str({ choices: ['development', 'test', 'production', 'provision'], default: 'development' }),
        PORT: port({ default: 5000 }),
        JWT_SECRET: str({ default: 'dev-secret-123' }), // Fallback for dev
        DATABASE_URL: str(),
        // Client URL for CORS
        CLIENT_URL: url({ default: 'http://localhost:5173', desc: 'The frontend URL' }),

        // Cloudinary (Optional for Dev)
        CLOUDINARY_CLOUD_NAME: str({ default: '' }),
        CLOUDINARY_API_KEY: str({ default: '' }),
        CLOUDINARY_API_SECRET: str({ default: '' }),

        // WhatsApp Cloud API (Credentials now in DB, env fallback optional)
        WHATSAPP_ACCESS_TOKEN: str({ default: '' }),
        WHATSAPP_PHONE_NUMBER_ID: str({ default: '' }),
        WHATSAPP_VERIFY_TOKEN: str({ default: '' }),
    });
}

module.exports = validateEnv;
