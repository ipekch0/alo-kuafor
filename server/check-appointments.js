const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAppointments() {
    try {
        const appointments = await prisma.appointment.findMany({
            take: 5,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                customer: true,
                service: true,
                professional: true
            }
        });

        console.log('Recent Appointments:');
        if (appointments.length === 0) {
            console.log('No appointments found.');
        } else {
            const app = appointments[0];
            console.log(`LATEST APPOINTMENT:`);
            console.log(`Date: ${app.dateTime.toISOString()}`);
            console.log(`Customer: ${app.customer.name}`);
            console.log(`Service: ${app.service.name}`);
        }
    } catch (error) {
        console.error('Error fetching appointments:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAppointments();
