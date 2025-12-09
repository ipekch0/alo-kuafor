const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
    try {
        const user = await prisma.user.findUnique({
            where: { email: 'yipek8055@gmail.com' }
        });
        console.log('User found:', user);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUser();
