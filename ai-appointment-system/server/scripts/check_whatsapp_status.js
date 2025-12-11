const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const salons = await prisma.salon.findMany({
            select: {
                id: true,
                name: true,
                whatsappPhoneId: true,
                whatsappBusinessId: true,
                // Do not print full token for security, just length
                whatsappAPIToken: true 
            }
        });

        console.log("--- SALON WHATSAPP STATUS ---");
        salons.forEach(s => {
            const status = s.whatsappAPIToken ? "✅ CONNECTED" : "❌ NOT CONNECTED";
            console.log(`Salon: ${s.name} | ID: ${s.id} | Status: ${status}`);
            console.log(`Phone ID: ${s.whatsappPhoneId}`);
            console.log(`Token Length: ${s.whatsappAPIToken ? s.whatsappAPIToken.length : 0}`);
            console.log("-----------------------------");
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
