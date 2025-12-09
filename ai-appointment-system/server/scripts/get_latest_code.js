const path = require('path');
const { PrismaClient } = require('@prisma/client');

const absoluteDbPath = path.join(__dirname, '../dev.db');
const dbUrl = `file:${absoluteDbPath}`;
const prisma = new PrismaClient({
    datasources: { db: { url: dbUrl } }
});

async function main() {
    console.log('🔍 Looking for recent unverified users...');

    const user = await prisma.user.findFirst({
        where: { isVerified: false },
        orderBy: { createdAt: 'desc' }
    });

    if (user) {
        console.log('------------------------------------------------');
        console.log('👤 User:', user.email);
        console.log('🔑 Verification Code:', user.verificationCode);
        console.log('------------------------------------------------');
    } else {
        console.log('✅ No unverified users found.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
