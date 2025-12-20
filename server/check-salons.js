const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
    try {
        console.log('--- USERS ---');
        const users = await prisma.user.findMany();
        users.forEach(u => console.log(`ID: ${u.id}, Name: ${u.name}, Email: ${u.email}`));

        console.log('\n--- SALONS ---');
        const salons = await prisma.salon.findMany();
        salons.forEach(s => console.log(`ID: ${s.id}, Name: ${s.name}, OwnerID: ${s.ownerId}`));

        console.log('\n--- APPOINTMENTS (Last 5) ---');
        const appointments = await prisma.appointment.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' }
        });
        appointments.forEach(a => console.log(`ID: ${a.id}, SalonID: ${a.salonId}, Date: ${a.dateTime}`));

    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

checkData();
