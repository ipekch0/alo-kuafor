require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const nodemailer = require('nodemailer');

async function test(port, secure) {
    console.log(`\nTesting Port: ${port}, Secure: ${secure}`);
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    console.log(`User: '${user}' (len: ${user.length})`);
    console.log(`Pass: '${pass ? pass.replace(/./g, '*') : 'MISSING'}' (len: ${pass ? pass.length : 0})`);

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: port,
        secure: secure,
        auth: {
            user: user,
            pass: pass
        },
        tls: {
            rejectUnauthorized: false // Sometimes needed for dev
        }
    });

    try {
        await transporter.verify();
        console.log('✅ Connection verified successfully!');

        const info = await transporter.sendMail({
            from: user,
            to: user,
            subject: 'Test Email ' + port,
            text: 'Working!'
        });
        console.log('✅ Message sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) console.error('Response:', error.response);
        return false;
    }
}

async function main() {
    console.log('--- Advanced Email Test ---');
    // Try 587 (TLS)
    let success = await test(587, false);
    if (!success) {
        // Try 465 (SSL)
        await test(465, true);
    }
}

main();
