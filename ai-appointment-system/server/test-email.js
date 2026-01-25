require('dotenv').config();
const nodemailer = require('nodemailer');

async function main() {
    console.log('--- Email Test Start ---');
    console.log('User:', process.env.EMAIL_USER);
    // Mask password for log safety
    console.log('Pass:', process.env.EMAIL_PASS ? '******' : 'MISSING');

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        debug: true, // Show debug output
        logger: true // Log information to console
    });

    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to self
            subject: 'Test Email from Debug Script',
            text: 'If you receive this, SMTP is working.',
        });

        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Error occurred during email sending:');
        console.error(error);
    }
}

main();
