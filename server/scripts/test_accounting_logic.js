const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function testAccounting() {
    try {
        console.log("--- Testing Accounting Logic ---");

        // 1. Get a salon (first one found)
        const salon = await prisma.salon.findFirst();
        if (!salon) {
            console.log("No salon found.");
            return;
        }
        console.log(`Testing with Salon ID: ${salon.id}`);

        // 2. Create a dummy completed appointment in the future
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1); // Tomorrow

        const service = await prisma.service.findFirst({ where: { salonId: salon.id } });
        const professional = await prisma.professional.findFirst({ where: { salonId: salon.id } });

        if (!service || !professional) {
            console.log("Service or Professional missing.");
            return;
        }

        const appt = await prisma.appointment.create({
            data: {
                salonId: salon.id,
                serviceId: service.id,
                professionalId: professional.id,
                dateTime: futureDate,
                status: 'completed',
                totalPrice: service.price,
                isPaid: true
            }
        });
        console.log(`Created Appointment ${appt.id} with Price: ${appt.totalPrice} (Type: ${typeof appt.totalPrice})`);
        console.log(`Date: ${appt.dateTime}`);

        // 3. Simulate Accounting Logic
        const start = new Date(0);
        const end = new Date('2100-01-01');
        end.setHours(23, 59, 59, 999);

        let totalRevenue = 0;

        const appointments = await prisma.appointment.findMany({
            where: {
                salonId: salon.id,
                status: 'completed'
            }
        });

        console.log(`Found ${appointments.length} completed appointments.`);

        appointments.forEach(app => {
            const appDate = new Date(app.dateTime);
            if (appDate >= start && appDate <= end) {
                const val = Number(app.totalPrice || 0);
                console.log(`App ${app.id}: Price=${app.totalPrice}, Number()=${val}`);
                totalRevenue += val;
            }
        });

        console.log(`Total Revenue: ${totalRevenue}`);

        // Cleanup
        await prisma.appointment.delete({ where: { id: appt.id } });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

testAccounting();
