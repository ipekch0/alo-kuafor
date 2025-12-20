const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const salons = await prisma.salon.findMany({
        select: {
            id: true,
            name: true,
            whatsappPhoneId: true,
            whatsappAPIToken: true, // Check if token exists
            whatsappBusinessId: true
        }
    });
    salons.forEach(s => {
        if (s.whatsappPhoneId || s.whatsappAPIToken) {
            console.log(`FOUND_SALON: ${s.id} | PhoneID: ${s.whatsappPhoneId} | Token: ${s.whatsappAPIToken ? 'YES' : 'NO'}`);
        }
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
