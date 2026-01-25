require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Veritabanı temizleniyor...');
    // Clean up existing data (optional, but good for clean slate)
    // await prisma.appointment.deleteMany();
    // await prisma.service.deleteMany();
    // await prisma.professional.deleteMany();
    // await prisma.salon.deleteMany();

    console.log('🌱 Gerçekçi veriler yükleniyor...');

    // 1. Create Admin User (Salon Owner)
    // Upsert avoids error if exists
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@alokuafor.com' },
        update: {},
        create: {
            email: 'admin@alokuafor.com',
            password: 'password123', // In real app, hash this!
            name: 'Yasin Yönetici',
            role: 'admin',
            phone: '5551234567',
            isVerified: true
        }
    });

    const salons = [
        {
            name: 'AloKuaför Premium',
            description: 'Şehrin en seçkin kuaför deneyimi. Modern kesimler, profesyonel renklendirme ve bakım hizmetleri.',
            address: 'Bağdat Caddesi No: 123',
            city: 'İstanbul',
            district: 'Kadıköy',
            lat: 40.9632,
            lng: 29.0630,
            image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1000',
            rating: 4.9,
            reviewCount: 128,
            workingHours: {
                monday: { start: '09:00', end: '20:00', active: true },
                tuesday: { start: '09:00', end: '20:00', active: true },
                wednesday: { start: '09:00', end: '20:00', active: true },
                thursday: { start: '09:00', end: '20:00', active: true },
                friday: { start: '09:00', end: '21:00', active: true },
                saturday: { start: '09:00', end: '21:00', active: true },
                sunday: { start: '10:00', end: '18:00', active: true }
            }
        },
        {
            name: 'Studio Makas & Sanat',
            description: 'Genç ve dinamik ekip, trend saç modelleri ve kreatif renklendirme işlemleri.',
            address: 'Nişantaşı Mah. Valikonağı Cad. No: 45',
            city: 'İstanbul',
            district: 'Şişli',
            lat: 41.0520,
            lng: 28.9920,
            image: 'https://images.unsplash.com/photo-1521590832169-dca14f33caf2?auto=format&fit=crop&q=80&w=1000',
            rating: 4.7,
            reviewCount: 45,
            workingHours: {
                monday: { start: '10:00', end: '20:00', active: true },
                sunday: { start: '00:00', end: '00:00', active: false }
            }
        },
        {
            name: 'Golden Touch Güzellik',
            description: 'Profesyonel cilt bakımı, lazer epilasyon ve kalıcı makyaj hizmetleri.',
            address: 'Ataköy 5. Kısım, Galleria AVM Yanı',
            city: 'İstanbul',
            district: 'Bakırköy',
            lat: 40.9780,
            lng: 28.8720,
            image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=1000',
            rating: 4.8,
            reviewCount: 89,
            workingHours: {
                monday: { start: '09:00', end: '19:00', active: true }
            }
        },
        {
            name: 'Barber Club İstinye',
            description: 'Erkekler için özel bakım konsepti. Saç sakal tasarımı ve VIP hizmet.',
            address: 'İstinye Park AVM Meydan Katı',
            city: 'İstanbul',
            district: 'Sarıyer',
            lat: 41.1110,
            lng: 29.0320,
            image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=1000',
            rating: 5.0,
            reviewCount: 210,
            workingHours: {
                monday: { start: '10:00', end: '22:00', active: true }
            }
        },
        {
            name: 'Zen Spa & Wellness',
            description: 'Şehrin stresinden uzaklaşın. Masaj, manikür, pedikür ve detoks hizmetleri.',
            address: 'Acıbadem Cad. Akasya AVM',
            city: 'İstanbul',
            district: 'Üsküdar',
            lat: 41.0020,
            lng: 29.0520,
            image: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&q=80&w=1000',
            rating: 4.6,
            reviewCount: 65,
            workingHours: {
                monday: { start: '09:00', end: '22:00', active: true }
            }
        }
    ];

    for (const salonData of salons) {
        // Create Salon
        const salon = await prisma.salon.create({
            data: {
                name: salonData.name,
                slug: salonData.name.toLowerCase().replace(/ /g, '-').replace(/&/g, '') + '-' + Math.floor(Math.random() * 1000),
                description: salonData.description,
                address: salonData.address,
                city: salonData.city,
                district: salonData.district,
                phone: '0' + (5000000000 + Math.floor(Math.random() * 999999999)),
                image: salonData.image,
                rating: salonData.rating,
                reviewCount: salonData.reviewCount,
                workingHours: JSON.stringify(salonData.workingHours || {}),
                ownerId: adminUser.id,
                isContracted: true
            }
        });

        // Add Professionals
        await prisma.professional.createMany({
            data: [
                {
                    salonId: salon.id,
                    name: 'Elif Yılmaz',
                    title: 'Uzman Estetisyen',
                    active: true,
                    specialties: JSON.stringify(['Cilt Bakımı', 'Lazer'])
                },
                {
                    salonId: salon.id,
                    name: 'Mehmet Demir',
                    title: 'Saç Tasarım Uzmanı',
                    active: true,
                    specialties: JSON.stringify(['Kesim', 'Boya'])
                }
            ]
        });

        // Add Services
        const baseServices = [
            { name: 'Saç Kesimi', category: 'hair', duration: 45, price: 350 + Math.floor(Math.random() * 200) },
            { name: 'Fön', category: 'hair', duration: 30, price: 150 + Math.floor(Math.random() * 100) },
            { name: 'Keratin Bakım', category: 'hair', duration: 90, price: 1500 + Math.floor(Math.random() * 500) },
            { name: 'Manikür', category: 'nails', duration: 40, price: 300 },
            { name: 'Pedikür', category: 'nails', duration: 50, price: 400 },
            { name: 'Cilt Bakımı', category: 'skincare', duration: 60, price: 1200 },
            { name: 'Gelin Başı', category: 'hair', duration: 120, price: 5000 }
        ];

        // Randomly pick 4-7 services for each salon
        const salonServices = baseServices.sort(() => 0.5 - Math.random()).slice(0, 4 + Math.floor(Math.random() * 3));

        for (const s of salonServices) {
            await prisma.service.create({
                data: {
                    salonId: salon.id,
                    name: s.name,
                    category: s.category,
                    duration: s.duration,
                    price: s.price,
                    active: true
                }
            });
        }
    }

    console.log('✅ Veritabanı başarıyla renklendirildi! 🎉');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
