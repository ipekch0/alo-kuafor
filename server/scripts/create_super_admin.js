const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function promoteToSuperAdmin() {
    try {
        // 1. Ask for email or just pick the first one / hardcode for now for speed
        // For CLI usage simplicity, let's list users and pick one, or just update a specific one.

        console.log('Fetching users...');
        const users = await prisma.user.findMany();

        if (users.length === 0) {
            console.log('No users found. Please register on the site first.');
            return;
        }

        console.log('Found users:');
        users.forEach(u => console.log(`- ${u.email} (${u.role})`));

        // EDIT THIS EMAIL to your specific email
        const targetEmail = users[0].email; // Default to first user for now

        const updatedUser = await prisma.user.update({
            where: { email: targetEmail },
            data: { role: 'super_admin' }
        });

        console.log(`\n✅ SUCCESS! User '${updatedUser.email}' is now a SUPER ADMIN.`);
        console.log('You can now access: http://localhost:5173/super-admin');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

promoteToSuperAdmin();
