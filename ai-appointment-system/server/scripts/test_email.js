require('dotenv').config({ path: '../.env' });
const nodemailer = require('nodemailer');

async function testEmail() {
    console.log('--- Email Debugger ---');

    // 1. Check Config
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    const host = process.env.EMAIL_HOST || 'smtp.gmail.com';

    console.log(`Host: ${host}`);
    console.log(`User: ${user ? user.substring(0, 3) + '***' : 'MISSING'}`);
    console.log(`Pass: ${pass ? 'PROVIDED' : 'MISSING'}`);

    if (!user || !pass) {
        console.error('❌ ERROR: EMAIL_USER or EMAIL_PASS is missing in .env');
        return;
    }

    // 2. Create Transporter
    const transporter = nodemailer.createTransport({
        host: host,
        port: 587,
        secure: false,
        auth: {
            user: user,
            pass: pass
        }
    });

    // 3. Verify Connection
    try {
        console.log('Testing SMTP Connection...');
        await transporter.verify();
        console.log('✅ SMTP Connection Successful!');
    } catch (err) {
        console.error('❌ SMTP Connection Failed:', err.message);
        if (err.code === 'EAUTH') {
            console.log('💡 Tip: For Gmail, you need an "App Password", not your login password.');
            console.log('   Go to: https://myaccount.google.com/apppasswords');
        }
        return;
    }

    // 4. Send Test Email
    try {
        console.log('Sending Test Email...');
        const info = await transporter.sendMail({
            from: `"Test Debugger" <${user}>`,
            to: user, // Send to self
            subject: 'Test Email from ALO KUAFOR Debugger',
            text: 'If you see this, email sending is working!'
        });
        console.log('✅ Email Sent:', info.messageId);
    } catch (err) {
        console.error('❌ Send Mail Failed:', err.message);
    }
}

testEmail();
