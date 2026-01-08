
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const salon = await prisma.salon.findFirst();
        console.log('--- SALON DEBUG INFO ---');
        console.log('ID:', salon.id);
        console.log('Name:', salon.name);
        console.log('WhatsApp Phone ID:', salon.whatsappPhoneId);
        console.log('WhatsApp WABA ID:', salon.whatsappBusinessId);
        console.log('Token Length:', salon.whatsappAPIToken ? salon.whatsappAPIToken.length : 'NULL');
        console.log('------------------------');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
check();
