const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    const email = 'demo_admin@alokuafor.com';
    const password = '123456';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: { password: hashedPassword, role: 'salon_owner', isVerified: true },
        create: {
            email,
            password: hashedPassword,
            name: 'Demo Admin',
            role: 'salon_owner',
            isVerified: true
        }
    });

    console.log(`User ${user.email} password reset to ${password}`);

    // Ensure salon exists for this user
    const salon = await prisma.salon.findFirst({ where: { ownerId: user.id } });
    if (!salon) {
        console.log("Creating salon for user...");
        await prisma.salon.create({
            data: {
                name: "Elite Demo Salon",
                slug: "elite-demo",
                ownerId: user.id,
                address: "Test Address",
                city: "Istanbul",
                phone: "5555555555",
                isVerified: true
            }
        });
    } else {
        console.log(`Salon exists: ${salon.name}`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
