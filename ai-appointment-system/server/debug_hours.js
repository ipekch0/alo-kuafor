
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkHours() {
    try {
        const salons = await prisma.salon.findMany();
        console.log(`Found ${salons.length} salons.`);

        for (const salon of salons) {
            console.log(`\nID: ${salon.id} | Name: ${salon.name} | WA ID: ${salon.whatsappPhoneId}`);
            if (salon.workingHours) {
                const parsed = typeof salon.workingHours === 'string' ? JSON.parse(salon.workingHours) : salon.workingHours;
                console.log("Working Hours Keys:", Object.keys(parsed));
                // Print Monday and Friday specifically
                console.log("Monday:", parsed['monday'] || parsed['Monday']);
                console.log("Friday:", parsed['friday'] || parsed['Friday']);
            } else {
                console.log("Working Hours: NULL");
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkHours();
