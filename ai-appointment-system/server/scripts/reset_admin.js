const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetAdmin() {
    try {
        const email = 'admin@admin.com';
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log(`--- Resetting Admin (${email}) ---`);

        // 1. Check if user exists
        let user = await prisma.user.findUnique({ where: { email } });

        if (user) {
            console.log('User found. Updating password and verification status...');
            user = await prisma.user.update({
                where: { email },
                data: {
                    password: hashedPassword,
                    isVerified: true,
                    role: 'salon_owner'
                }
            });
            console.log('User updated.');
        } else {
            console.log('User not found. Creating new admin user...');
            user = await prisma.user.create({
                data: {
                    name: 'Super Admin', // Changed from 'Demo Admin'
                    email,
                    password: hashedPassword,
                    role: 'SUPER_ADMIN', // Changed from 'salon_owner'
                    permissions: JSON.stringify(["VIEW_FINANCE", "MANAGE_SALONS", "MANAGE_SYSTEM", "MANAGE_USERS"]), // Grant all permissions
                    phone: '5555555555', // Added phone
                    isVerified: true
                }
            });
            console.log('User created.');
        }

        // 2. Ensure Salon Exists for this user
        const salon = await prisma.salon.findFirst({ where: { ownerId: user.id } });

        if (!salon) {
            console.log('No salon found for user. Creating Demo Salon...');
            await prisma.salon.create({
                data: {
                    name: 'Demo Kuaför Salonu',
                    slug: 'demo-kuafor-' + Math.floor(Math.random() * 1000),
                    ownerId: user.id,
                    city: 'İstanbul',
                    district: 'Kadıköy',
                    address: 'Moda Caddesi No: 1',
                    phone: '05551112233',
                    taxNumber: '1111111111',
                    taxOffice: 'Kadıköy',
                    subscriptionPlan: 'PRO',
                    isVerified: true
                }
            });
            console.log('Demo Salon created.');
        } else {
            console.log(`Salon already exists: ${salon.name}`);
        }

        console.log('\n✅ Admin Reset Successful!');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);

    } catch (error) {
        console.error('Reset Failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetAdmin();
