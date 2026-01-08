const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        await prisma.user.update({
            where: { email: 'admin@alokuafor.com' },
            data: { isVerified: true }
        });
        console.log('✅ Verifying admin@alokuafor.com');

        // Also verify oceancover1 just in case
        await prisma.user.update({
            where: { email: 'oceancover1@gmail.com' },
            data: { isVerified: true }
        });
        console.log('✅ Verifying oceancover1@gmail.com');

    } catch (e) {
        console.log(e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
