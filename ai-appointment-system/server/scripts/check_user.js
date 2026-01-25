const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'ardau367@gmail.com';
    console.log(`Searching for user: ${email}...`);

    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            ownedSalons: true,
            professionalProfile: true
        }
    });

    if (!user) {
        console.log('❌ User NOT found in database.');
    } else {
        console.log('✅ User Found:');
        console.log('------------------------------------------------');
        console.log(`ID:          ${user.id}`);
        console.log(`Name:        ${user.name}`);
        console.log(`Email:       ${user.email}`);
        console.log(`Role:        ${user.role}`);
        console.log(`Permissions: ${user.permissions || 'None'}`);
        console.log(`Verified:    ${user.isVerified}`);
        console.log('------------------------------------------------');

        if (user.ownedSalons.length > 0) {
            console.log('Owning Salons:', user.ownedSalons.map(s => s.name).join(', '));
        } else {
            console.log('No salons owned.');
        }
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
