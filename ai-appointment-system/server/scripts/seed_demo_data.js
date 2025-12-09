const path = require('path');
const { PrismaClient } = require('@prisma/client');

const absoluteDbPath = path.join(__dirname, '../dev.db');
const dbUrl = `file:${absoluteDbPath}`;
console.log(`🔌 Connecting to DB (Explicit): ${dbUrl}`);

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: dbUrl
        }
    }
});

async function main() {
    console.log('🌱 Starting Demo Data Seeding...');

    // 1. Create or Find Main Salon Owner (User)
    const email = 'demo_admin@alokuafor.com';
    let owner;
    try {
        console.log('Creating owner...');
        owner = await prisma.user.create({
            data: {
                name: "Demo Admin",
                email: email,
                password: "$2b$10$bS0rKTOT2PFCEiq0gVeSQ4xMAtLbIP1HcG",
                role: "salon_owner"
            }
        });
        console.log('✅ Created owner:', owner.email);
    } catch (e) {
        console.log('⚠️ Owner creation failed:', e.message);
        console.log(e);
        owner = await prisma.user.findUnique({ where: { email } });
        // if (!owner) throw e; 
        if (owner) console.log('ℹ️ Found existing owner:', owner.email);
    }

    if (!owner) {
        console.error("❌ Failed to get owner user. Exiting.");
        return;
    }

    // 2. Create Salon
    let salon = await prisma.salon.findFirst({ where: { ownerId: owner.id } });
    if (!salon) {
        console.log('Creating main salon...');
        salon = await prisma.salon.create({
            data: {
                name: "Elite Güzellik Stüdyosu",
                slug: "elite-guzellik-demo",
                ownerId: owner.id,
                address: "Bağdat Caddesi No: 123",
                city: "İstanbul",
                district: "Kadıköy",
                phone: "0532 123 45 67",
                description: "İstanbul'un en prestijli güzellik ve bakım merkezi.",
                rating: 4.8,
                reviewCount: 124,
                isVerified: true,
                isContracted: true,
                image: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=800&q=80" // Premium Salon Interior
            }
        });
        console.log('✅ Created Main Salon');
    }

    // 3. Create Services
    const existingServices = await prisma.service.count({ where: { salonId: salon.id } });
    if (existingServices === 0) {
        const servicesData = [
            { name: "Saç Kesimi", price: 350, duration: 45, category: "hair" },
            { name: "Fön", price: 150, duration: 30, category: "hair" },
            { name: "Manikür", price: 200, duration: 40, category: "nails" },
            { name: "Gelin Başı", price: 1500, duration: 120, category: "hair" },
            { name: "Pedikür", price: 250, duration: 45, category: "nails" }
        ];
        for (const s of servicesData) {
            await prisma.service.create({ data: { ...s, salonId: salon.id } });
        }
        console.log('✅ Created Services');
    }

    // 4. Create Professionals
    const existingPros = await prisma.professional.count({ where: { salonId: salon.id } });
    if (existingPros === 0) {
        const professionalsData = [
            { name: "Selin Yılmaz", title: "Senior Stylist", photo: "https://images.unsplash.com/photo-1595956553066-fe24283b43a3?auto=format&fit=crop&w=400&q=80" },
            { name: "Burak Demir", title: "Color Specialist", photo: "https://images.unsplash.com/photo-1542596594-649edbc13630?auto=format&fit=crop&w=400&q=80" },
            { name: "Ayşe Kaya", title: "Makeup Artist", photo: "https://images.unsplash.com/photo-1583333333509-66cdd1771242?auto=format&fit=crop&w=400&q=80" }
        ];
        for (const p of professionalsData) {
            await prisma.professional.create({ data: { ...p, salonId: salon.id } });
        }
        console.log('✅ Created Professionals');
    }

    // 5. Create Appointments
    const existingApps = await prisma.appointment.count({ where: { salonId: salon.id } });
    if (existingApps < 10) {
        console.log('Creating appointments...');
        const service = await prisma.service.findFirst({ where: { salonId: salon.id } });
        const pro = await prisma.professional.findFirst({ where: { salonId: salon.id } });

        // Create 30 appointments
        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(date.getDate() + (i - 15)); // -15 to +15 days
            date.setHours(9 + (i % 8), 0, 0, 0);

            await prisma.appointment.create({
                data: {
                    salonId: salon.id,
                    serviceId: service.id,
                    professionalId: pro.id,
                    dateTime: date,
                    status: i < 15 ? 'completed' : 'pending',
                    totalPrice: service.price,
                    isPaid: i < 15
                }
            });
        }
        console.log('✅ Created Appointments');
    }

    // 6. Create 50 Mock Salons for Search (Independent of appointments)
    const totalSalons = await prisma.salon.count();
    if (totalSalons < 10) {
        console.log('🌍 Seeding 50 extra salons for search demo...');
        const districts = ['Kadıköy', 'Beşiktaş', 'Şişli', 'Üsküdar', 'Ataşehir', 'Maltepe'];
        const salonNames = ['Paris', 'Tokyo', 'London', 'Milan', 'New York', 'Istanbul'];

        for (let i = 0; i < 50; i++) {
            const randomDistrict = districts[Math.floor(Math.random() * districts.length)];
            const randomName = `${salonNames[Math.floor(Math.random() * salonNames.length)]} Beauty ${i}`;

            await prisma.salon.create({
                data: {
                    name: randomName,
                    slug: `mock-salon-${i}-${Math.random().toString(36).substr(2, 5)}`,
                    ownerId: owner.id,
                    address: `Mahalle ${i} Sokak`,
                    city: "İstanbul",
                    district: randomDistrict,
                    phone: `0212 555 ${1000 + i}`,
                    description: "Profesyonel hizmet.",
                    rating: 4.0,
                    reviewCount: Math.floor(Math.random() * 50),
                    isVerified: Math.random() > 0.5,
                    isContracted: Math.random() > 0.7,
                    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
                }
            });
        }
        console.log('✅ Created 50 Mock Salons');
    }

    console.log('✅ DONE');
}

main()
    .catch((e) => {
        console.error("ERROR:", e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
