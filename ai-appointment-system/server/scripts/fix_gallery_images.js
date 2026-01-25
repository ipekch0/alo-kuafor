const path = require('path');
const { PrismaClient } = require('@prisma/client');

const absoluteDbPath = path.join(__dirname, '../dev.db');
const dbUrl = `file:${absoluteDbPath}`;
console.log(`🔌 Connecting to DB: ${dbUrl}`);

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: dbUrl
        }
    }
});

const SALON_IMAGES = [
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1521590832896-bc17251e32dc?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80"
];

const GALLERY_IMAGES = [
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=800&q=80"
];

async function main() {
    console.log('🖼️ Fixing Salon Images...');

    // 1. Fix Main Seed Salon (Elite Güzellik)
    console.log('🔹 Updating Main Salon...');
    const mainSalon = await prisma.salon.findFirst({
        where: { slug: 'elite-guzellik-demo' }
    });

    if (!mainSalon) {
        // Fallback check for old slug
        const oldSalon = await prisma.salon.findFirst({ where: { slug: 'elite-guzellik' } });
        if (oldSalon) {
            console.log('Found old slug, updating images...');
            await prisma.salon.update({
                where: { id: oldSalon.id },
                data: {
                    image: SALON_IMAGES[0],
                    images: JSON.stringify(GALLERY_IMAGES) // JSON array for gallery
                }
            });
        }
    } else {
        await prisma.salon.update({
            where: { id: mainSalon.id },
            data: {
                image: SALON_IMAGES[0],
                images: JSON.stringify(GALLERY_IMAGES)
            }
        });
    }

    // 2. Fix All Mock Salons
    console.log('🔹 Updating 50 Mock Salons...');
    const salons = await prisma.salon.findMany({
        where: { NOT: { slug: 'elite-guzellik-demo' } }
    });

    for (const salon of salons) {
        const randomImage = SALON_IMAGES[Math.floor(Math.random() * SALON_IMAGES.length)];
        // Create a random sub-array for gallery
        const randomGallery = SALON_IMAGES
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);

        await prisma.salon.update({
            where: { id: salon.id },
            data: {
                image: randomImage,
                images: JSON.stringify(randomGallery)
            }
        });
    }

    console.log(`✅ Updated ${salons.length + 1} salons with valid images.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
