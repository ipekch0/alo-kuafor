const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateSalon() {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    if (!phoneNumberId) {
        console.error("WHATSAPP_PHONE_NUMBER_ID not found in environment variables.");
        return;
    }

    try {
        
        const salon = await prisma.salon.findFirst();
        if (salon) {
            await prisma.salon.update({
                where: { id: salon.id },
                data: { whatsappNumberId: phoneNumberId }
            });
            console.log(`Updated salon '${salon.name}' with WhatsApp ID: ${phoneNumberId}`);
        } else {
            console.log("No salon found to update.");
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

updateSalon();
