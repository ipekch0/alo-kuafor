
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const salons = await prisma.salon.findMany({
        select: {
            id: true,
            name: true,
            workingHours: true
        }
    });

    console.log("Found Salons:", salons.length);
    salons.forEach(s => {
        console.log(`\nID: ${s.id}, Name: ${s.name}`);
        console.log("Raw workingHours:", s.workingHours);
        if (s.workingHours) {
            try {
                const parsed = JSON.parse(s.workingHours);
                console.log("Parsed Keys:", Object.keys(parsed));
                console.log("Monday Sample:", parsed.monday || parsed.Monday || parsed['1']);
            } catch (e) {
                console.log("Parse Error:", e.message);
            }
        } else {
            console.log("workingHours is NULL");
        }
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
