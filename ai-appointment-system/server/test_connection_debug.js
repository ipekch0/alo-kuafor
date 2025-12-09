const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Connecting to database...');
        await prisma.$connect();
        console.log('Connected successfully.');

        console.log('Checking users...');
        const count = await prisma.user.count();
        console.log(`Found ${count} users.`);

        await prisma.$disconnect();
        process.exit(0);
    } catch (e) {
        console.error('Database error:', e);
        process.exit(1);
    }
}

main();
