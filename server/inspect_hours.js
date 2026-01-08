const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const salons = await prisma.salon.findMany();
    console.log(`Found ${salons.length} salons.`);

    for (const s of salons) {
        console.log(`\nSALON: ${s.name} (ID: ${s.id})`);
        console.log(`Working Hours Raw Type: ${typeof s.workingHours}`);

        let parsed = null;
        try {
            if (typeof s.workingHours === 'string') {
                parsed = JSON.parse(s.workingHours);
                console.log('Parsed from String.');
            } else if (typeof s.workingHours === 'object') {
                parsed = s.workingHours;
                console.log('Used as Object.');
            }

            if (parsed) {
                console.log('Parsed Keys:', Object.keys(parsed));
                if (parsed.monday) console.log('MONDAY:', parsed.monday);
                if (parsed.friday) console.log('FRIDAY:', parsed.friday);
            } else {
                console.log('Parsed is null/undefined');
            }
        } catch (e) {
            console.log('Could not parse JSON:', e.message);
            console.log('Raw Value:', s.workingHours);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
