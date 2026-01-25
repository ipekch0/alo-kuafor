const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetPassword() {
    const email = 'admin@alokuafor.com';
    const newPassword = '123456';

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const user = await prisma.user.update({
            where: { email: email },
            data: { password: hashedPassword }
        });

        console.log(`Password for ${email} has been reset to: ${newPassword}`);
    } catch (error) {
        console.error('Error resetting password:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetPassword();
