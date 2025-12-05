const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // 1. Create Admin User (Salon Owner)
    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@alokuafor.com',
            password: 'password123', // In real app, hash this!
            name: 'Yasin Yönetici',
            role: 'admin',
            phone: '5551234567'
        }
    });

    // 2. Create Main Salon (AloKuaför)
    const mainSalon = await prisma.salon.create({
        data: {
            name: 'AloKuaför Premium',
            slug: 'alokuafor-premium',
            description: 'Şehrin en seçkin kuaför deneyimi. Modern kesimler, profesyonel renklendirme ve bakım hizmetleri.',
            address: 'Bağdat Caddesi No: 123',
            city: 'İstanbul',
            district: 'Kadıköy',
            phone: '02161234567',
            email: 'info@alokuafor.com',
            rating: 4.9,
            reviewCount: 128,
            isContracted: true,
            ownerId: adminUser.id,
            workingHours: JSON.stringify({
                monday: { start: '09:00', end: '20:00' },
                tuesday: { start: '09:00', end: '20:00' },
                wednesday: { start: '09:00', end: '20:00' },
                thursday: { start: '09:00', end: '20:00' },
                friday: { start: '09:00', end: '21:00' },
                saturday: { start: '09:00', end: '21:00' },
                sunday: { start: '10:00', end: '18:00' }
            })
        }
    });

    // 3. Create Professionals for Main Salon
    const pro1 = await prisma.professional.create({
        data: {
            salonId: mainSalon.id,
            name: 'Ahmet Yılmaz',
            title: 'Senior Stylist',
            bio: '15 yıllık tecrübesiyle modern kesim uzmanı.',
            specialties: JSON.stringify(['Saç Kesimi', 'Fön', 'Keratin Bakım']),
            active: true
        }
    });

    const pro2 = await prisma.professional.create({
        data: {
            salonId: mainSalon.id,
            name: 'Ayşe Demir',
            title: 'Colorist Expert',
            bio: 'Renklendirme ve ombre konusunda ödüllü uzman.',
            specialties: JSON.stringify(['Boya', 'Ombre', 'Röfle', 'Gelin Başı']),
            active: true
        }
    });

    // 4. Create Services for Main Salon
    const services = [
        { name: 'Saç Kesimi', category: 'hair', duration: 45, price: 350 },
        { name: 'Fön', category: 'hair', duration: 30, price: 150 },
        { name: 'Dip Boya', category: 'hair', duration: 90, price: 800 },
        { name: 'Ombre / Balyaj', category: 'hair', duration: 180, price: 2500 },
        { name: 'Gelin Başı', category: 'hair', duration: 120, price: 3000 },
        { name: 'Manikür', category: 'nails', duration: 45, price: 250 },
        { name: 'Pedikür', category: 'nails', duration: 60, price: 350 },
        { name: 'Cilt Bakımı', category: 'skincare', duration: 60, price: 1200 }
    ];

    for (const s of services) {
        await prisma.service.create({
            data: {
                salonId: mainSalon.id,
                name: s.name,
                category: s.category,
                duration: s.duration,
                price: s.price
            }
        });
    }

    // 5. Create Another Salon (Competitor/Partner)
    const salon2 = await prisma.salon.create({
        data: {
            name: 'Studio Makas',
            slug: 'studio-makas',
            description: 'Genç ve dinamik ekip, trend saç modelleri.',
            address: 'Nişantaşı Mah. Valikonağı Cad.',
            city: 'İstanbul',
            district: 'Şişli',
            phone: '02129876543',
            rating: 4.5,
            reviewCount: 45,
            isContracted: true,
            ownerId: adminUser.id // Same owner for demo simplicity
        }
    });

    await prisma.service.create({
        data: {
            salonId: salon2.id,
            name: 'Saç Kesimi',
            category: 'hair',
            duration: 40,
            price: 500 // More expensive
        }
    });

    console.log('✅ Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
