const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Fetching users...');
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            permissions: true
        }
    });

    console.log('\n--- SYSTEM USERS ---');
    if (users.length === 0) {
        console.log('No users found.');
    } else {
        console.table(users.map(u => ({
            ID: u.id,
            Name: u.name,
            Email: u.email,
            Role: u.role,
            Permissions: u.permissions ? u.permissions.substring(0, 50) + '...' : 'None'
        })));
    }

    console.log('\n--- SUMMARY ---');
    const counts = {};
    users.forEach(u => {
        counts[u.role] = (counts[u.role] || 0) + 1;
    });
    console.log(counts);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
