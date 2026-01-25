const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'ardau367@gmail.com';
    console.log(`Migrating user: ${email}...`);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        console.log('User not found.');
        return;
    }

    const updated = await prisma.user.update({
        where: { email },
        data: {
            role: 'SALON_OWNER', // Uppercase for new RBAC
            permissions: JSON.stringify(["VIEW_FINANCE", "MANAGE_SALONS", "MANAGE_APPOINTMENTS", "MANAGE_STAFF", "VIEW_REPORTS"])
        }
    });

    console.log('✅ User updated successfully!');
    console.log(`New Role: ${updated.role}`);
    console.log(`Permissions: ${updated.permissions}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
