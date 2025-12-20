const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const salons = await prisma.salon.findMany({
        include: {
            professionals: true,
            services: true
        }
    });

    console.log(`Found ${salons.length} salons.`);

    for (const s of salons) {
        console.log(`\n================================`);
        console.log(`SALON: ${s.name} (ID: ${s.id})`);
        console.log(`- Professionals: ${s.professionals.length}`);
        s.professionals.forEach(p => console.log(`  * [${p.id}] ${p.name} - Active: ${p.active}`));

        console.log(`- Services: ${s.services.length}`);
        s.services.forEach(srv => console.log(`  * [${srv.id}] ${srv.name}`));
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
