const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function debugRevenue() {
    try {
        console.log("--- DEBUG REVENUE ---");

        const salons = await prisma.salon.findMany({
            include: { owner: true }
        });

        for (const salon of salons) {
            console.log(`\nSalon: ${salon.name} (ID: ${salon.id}, Owner: ${salon.owner.email})`);

            const appointments = await prisma.appointment.findMany({
                where: {
                    salonId: salon.id,
                    status: 'completed'
                }
            });

            console.log(`Found ${appointments.length} completed appointments.`);

            let totalRevenue = 0;
            appointments.forEach(app => {
                const price = Number(app.totalPrice);
                console.log(` - App ID: ${app.id}, Date: ${app.dateTime.toISOString()}, Price: ${price}`);
                totalRevenue += price;
            });

            console.log(`CALCULATED TOTAL REVENUE: ${totalRevenue}`);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

debugRevenue();
