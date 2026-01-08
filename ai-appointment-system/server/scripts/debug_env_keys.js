require('dotenv').config({ path: '../.env' });

console.log('Loaded Keys:');
Object.keys(process.env).forEach(key => {
    if (key.startsWith('WHATSAPP') || key.startsWith('CLOUDINARY')) {
        console.log(`${key}: ${process.env[key].substring(0, 5)}...`);
    }
});
