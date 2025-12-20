require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

console.log('--- DB Config Check ---');
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    console.error('DATABASE_URL is not defined in environment!');
} else {
    try {
        const url = new URL(dbUrl);
        console.log(`Host: ${url.hostname}`);
        console.log(`Port: ${url.port}`);
        console.log(`Database: ${url.pathname.substring(1)}`);
        console.log(`Protocol: ${url.protocol}`);

        // Check if host is local
        if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
            console.log('Target is LOCALHOST.');
        } else {
            console.log('Target is REMOTE.');
        }

    } catch (e) {
        console.error('Could not parse DATABASE_URL:', e.message);
        // Print usage hint without revealing full URL if possible, or just first few chars
        console.log('URL starts with:', dbUrl.substring(0, 15) + '...');
    }
}
console.log('-----------------------');
