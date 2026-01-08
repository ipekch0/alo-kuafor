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
        console.log(`\nSALON: ${s.name} (ID: ${s.id})`);
        console.log(`- Professionals: ${s.professionals.length}`);
        s.professionals.forEach(p => console.log(`  * [${p.id}] ${p.name} (${p.title}) - Active: ${p.active}`));

        console.log(`- Services: ${s.services.length}`);
        s.services.forEach(srv => console.log(`  * [${srv.id}] ${srv.name} (${srv.duration} min) - Price: ${srv.price}`));
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
