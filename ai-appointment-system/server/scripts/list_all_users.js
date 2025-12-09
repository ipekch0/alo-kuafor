const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isVerified: true
            }
        });
        const fs = require('fs');
        fs.writeFileSync('users_list.json', JSON.stringify(users, null, 2));
        console.log('Written to users_list.json');
        console.log(`Total users: ${users.length}`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
