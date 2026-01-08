const path = require('path');
const { PrismaClient } = require('@prisma/client');

const absoluteDbPath = path.join(__dirname, '../dev.db');
const dbUrl = `file:${absoluteDbPath}`;
const prisma = new PrismaClient({
    datasources: { db: { url: dbUrl } }
});

async function main() {
    console.log('🔓 Verifying admin user...');
    try {
        const user = await prisma.user.update({
            where: { email: 'demo_admin@alokuafor.com' },
            data: { isVerified: true }
        });
        console.log('✅ User verified:', user.email, user.isVerified);
    } catch (e) {
        console.error('❌ Failed to verify:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
