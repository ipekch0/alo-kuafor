const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
    try {
        const user = await prisma.user.findUnique({
            where: { email: 'yipek8055@gmail.com' }
        });
        console.log('User Role:', user ? user.role : 'User not found');
        console.log('User Permissions:', user ? user.permissions : 'N/A');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkUser();
