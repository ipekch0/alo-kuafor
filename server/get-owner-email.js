const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getOwnerEmail() {
    try {
        // Get the first salon
        const salon = await prisma.salon.findFirst({
            include: {
                owner: true
            }
        });

        if (salon) {
            console.log(`Salon Name: ${salon.name}`);
            console.log(`Owner Name: ${salon.owner.name}`);
            console.log(`Owner Email: ${salon.owner.email}`);
        } else {
            console.log('No salon found.');
        }
    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

getOwnerEmail();
