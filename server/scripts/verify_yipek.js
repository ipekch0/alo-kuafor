const path = require('path');
const { PrismaClient } = require('@prisma/client');

const absoluteDbPath = path.join(__dirname, '../dev.db');
const dbUrl = `file:${absoluteDbPath}`;
const prisma = new PrismaClient({
    datasources: { db: { url: dbUrl } }
});

async function main() {
    console.log('🔓 Verifying user yipek8055@gmail.com...');

    try {
        const user = await prisma.user.update({
            where: { email: 'yipek8055@gmail.com' },
            data: {
                isVerified: true,
                verificationCode: null
            }
        });
        console.log('✅ User verified successfully!');
    } catch (e) {
        console.error('❌ Failed to verify:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
