const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugAccounting() {
    try {
        console.log('--- DEBUGGING ACCOUNTING ---');

        // 1. Inspect the specific 'completed' appointment
        const targetApp = await prisma.appointment.findFirst({
            where: { status: 'completed', totalPrice: { gt: 0 } },
            include: { salon: { include: { owner: true } } }
        });

        if (targetApp) {
            console.log('\n--- TARGET APPCINTMENT DIAGNOSIS ---');
            console.log(`App ID: ${targetApp.id}`);
            console.log(`Status: ${targetApp.status} (Raw DB Value)`);
            console.log(`Price: ${targetApp.totalPrice}`);
            console.log(`Date: ${targetApp.dateTime}`);
            console.log(`Salon ID: ${targetApp.salonId}`);

            if (targetApp.salon) {
                console.log(`Salon Name: ${targetApp.salon.name}`);
                console.log(`Owner ID: ${targetApp.salon.ownerId}`);
                console.log(`Owner Email: ${targetApp.salon.owner ? targetApp.salon.owner.email : 'NO OWNER FOUND'}`);
            } else {
                console.log('CRITICAL: This appointment has NO SALON associated!');
            }
        } else {
            console.log('No completed appointment with price > 0 found.');
        }

        // 2. Simulate the query logic from accounting.js
        const start = new Date(0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);

        console.log(`\nQuery Range: ${start.toISOString()} TO ${end.toISOString()}`);

        const revenueApps = await prisma.appointment.findMany({
            where: {
                status: 'completed', // Using literal string as in route
                dateTime: { lte: end }
            }
        });

        let total = 0;
        console.log(`\nMatching 'completed' appointments in range: ${revenueApps.length}`);
        revenueApps.forEach(app => {
            console.log(`+ Adding ${app.totalPrice} from ID ${app.id}`);
            total += Number(app.totalPrice || 0);
        });

        console.log(`Total Calculated Revenue: ${total}`);

    } catch (error) {
        console.error('Debug error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugAccounting();
