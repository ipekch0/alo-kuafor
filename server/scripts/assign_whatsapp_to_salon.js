const { PrismaClient } = require('@prisma/client');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
    const phoneId = process.env.WHATSAPP_PHONE_ID;

    if (!phoneId) {
        console.error('❌ WHATSAPP_PHONE_ID is missing in .env');
        return;
    }

    console.log(`🔍 Locking for Main Salon to assign Phone ID: ${phoneId}`);

    // Find ANY salon to attach to
    const salon = await prisma.salon.findFirst();

    if (!salon) {
        console.error('❌ Main demo salon not found!');
        return;
    }

    // Update the salon
    await prisma.salon.update({
        where: { id: salon.id },
        data: {
            whatsappPhoneId: phoneId,
            // We can also store the token if we want per-salon tokens in the future
            // whatsappAPIToken: process.env.WHATSAPP_ACCESS_TOKEN 
        }
    });

    console.log(`✅ Successfully assigned Phone ID ${phoneId} to Salon: "${salon.name}"`);
    console.log('🚀 usage: The routing logic will now find this salon automatically when a webhook arrives.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
