const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('📊 Database Summary:');
    console.log('-------------------');

    try {
        const userCount = await prisma.user.count();
        console.log(`👤 Users: ${userCount}`);

        const salonCount = await prisma.salon.count();
        console.log(`scissors Salons: ${salonCount}`);

        const professionalCount = await prisma.professional.count();
        console.log(`tophat Professionals: ${professionalCount}`);

        const serviceCount = await prisma.service.count();
        console.log(`cog Services: ${serviceCount}`);

        const appointmentCount = await prisma.appointment.count();
        console.log(`calendar Appointments: ${appointmentCount}`);

        const customerCount = await prisma.customer.count();
        console.log(`users Customers: ${customerCount}`);

    } catch (error) {
        console.error('Error connecting to database:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
