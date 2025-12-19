
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Checking Salons...");
    const salons = await prisma.salon.findMany();
    if (salons.length === 0) {
        console.log("No salons found!");
        return;
    }
    const salonId = salons[0].id; // Use first salon (Demo Kuafor likely)
    console.log(`Checking professionals for Salon ID: ${salonId}`);

    const staff = await prisma.professional.findMany({ where: { salonId } });
    console.log("Staff count:", staff.length);

    if (staff.length === 0) {
        console.log("Creating default staff...");
        const newStaff = await prisma.professional.create({
            data: {
                salonId: salonId,
                name: "Genel Personel",
                title: "Uzman",
                active: true
            }
        });
        console.log("Created staff:", newStaff);
    } else {
        console.log("Existing staff:", staff);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
