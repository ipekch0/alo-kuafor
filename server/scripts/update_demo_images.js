const { PrismaClient } = require('@prisma/client');
const path = require('path');

const absoluteDbPath = path.join(__dirname, '../dev.db');
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: `file:${absoluteDbPath}`
        }
    }
});

async function main() {
    console.log('🔄 Updating Demo Images...');

    // 1. Get Owner
    const owner = await prisma.user.findUnique({
        where: { email: 'demo_admin@alokuafor.com' }
    });

    if (!owner) {
        console.error('Owner not found, cannot update.');
        return;
    }

    // 2. Update Salon Image
    const salon = await prisma.salon.findFirst({ where: { ownerId: owner.id } });
    if (salon) {
        await prisma.salon.update({
            where: { id: salon.id },
            data: {
                image: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=800&q=80",
                isContracted: true // Ensure it's premium
            }
        });
        console.log('✅ Updated Salon Image');
    }

    // 3. Update Professionals
    const professionalImages = {
        "Selin Yılmaz": "https://images.unsplash.com/photo-1595956553066-fe24283b43a3?auto=format&fit=crop&w=400&q=80",
        "Burak Demir": "https://images.unsplash.com/photo-1542596594-649edbc13630?auto=format&fit=crop&w=400&q=80",
        "Ayşe Kaya": "https://images.unsplash.com/photo-1583333333509-66cdd1771242?auto=format&fit=crop&w=400&q=80"
    };

    if (salon) {
        for (const [name, photo] of Object.entries(professionalImages)) {
            const pro = await prisma.professional.findFirst({
                where: {
                    salonId: salon.id,
                    name: name
                }
            });

            if (pro) {
                await prisma.professional.update({
                    where: { id: pro.id },
                    data: { photo: photo }
                });
                console.log(`✅ Updated photo for ${name}`);
            } else {
                console.log(`⚠️ Professional not found: ${name}`);
            }
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
