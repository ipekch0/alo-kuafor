const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const salonId = 6; // Demo Salon ID

    console.log(`Seeding data for Salon ID: ${salonId}...`);

    // 1. Create Default Professional if none exists
    const existingStaff = await prisma.professional.findFirst({ where: { salonId } });
    if (!existingStaff) {
        await prisma.professional.create({
            data: {
                salonId,
                name: "Uzman Personel",
                title: "Kuaför",
                active: true,
                workingHours: JSON.stringify({
                    monday: { start: "09:00", end: "19:00" },
                    tuesday: { start: "09:00", end: "19:00" },
                    wednesday: { start: "09:00", end: "19:00" },
                    thursday: { start: "09:00", end: "19:00" },
                    friday: { start: "09:00", end: "19:00" },
                    saturday: { start: "09:00", end: "19:00" },
                    sunday: { start: "09:00", end: "19:00" }
                })
            }
        });
        console.log("✅ Created default Professional: 'Uzman Personel'");
    } else {
        console.log("ℹ️ Professional already exists.");
    }

    // 2. Create Default Service if none exists
    const existingService = await prisma.service.findFirst({ where: { salonId } });
    if (!existingService) {
        await prisma.service.create({
            data: {
                salonId,
                name: "Genel Hizmet",
                category: "hair",
                duration: 60,
                price: 500,
                active: true
            }
        });
        console.log("✅ Created default Service: 'Genel Hizmet'");
    } else {
        console.log("ℹ️ Service already exists.");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
