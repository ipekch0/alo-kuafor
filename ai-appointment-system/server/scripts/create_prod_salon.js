const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Creating Production Salon Data...');

    // 1. Create Admin User
    const user = await prisma.user.upsert({
        where: { email: 'admin@alokuafor.com' },
        update: {},
        create: {
            email: 'admin@alokuafor.com',
            password: 'password123', // Default password
            name: 'Yasin Yönetici',
            role: 'admin',
            phone: '5551234567',
            isVerified: true
        }
    });

    console.log('✅ User Check/Create: Done.');

    // 2. Create Salon with WhatsApp Credentials
    const salon = await prisma.salon.upsert({
        where: { slug: 'odakmanage-prod' }, // Use a unique slug
        update: {
            whatsappBusinessId: '1179874353536283',
            whatsappPhoneId: '822137460992821',
            whatsappAPIToken: 'EAAZAZAMaAliCIBQP61nBWbUQiHdh9LOIeiSLvaMhK5kMUnHZBUr7i7MmohEk9AF2ZBnQZATFo0bR0cXVlY2fHIltx6A03XKPlU3tl7ozQD2voh4Bm6v8h0qS63ieOLEVVqgvvDQALgqolwrzZABSdRDrQXtcioRFebc4IiYjIZBeZCEhCacy5jx527fdIq3EDsN3xDlsvEMRhVX3bdaWl3uwjZBtnEFUTZB55NUrc4Aw3uhjNF5Tk3pyr2wjargr3N9pDCbB28Av4Gw4b2MdKAGu5bowcZD'
        },
        create: {
            name: 'OdakManage',
            slug: 'odakmanage-prod',
            description: 'AI Destekli Kuaför ve Güzellik Salonu Yönetim Sistemi',
            address: 'Merkez Mah.',
            city: 'İstanbul',
            district: 'Merkez',
            phone: '5551234567',
            ownerId: user.id,
            whatsappBusinessId: '1179874353536283',
            whatsappPhoneId: '822137460992821',
            whatsappAPIToken: 'EAAZAZAMaAliCIBQP61nBWbUQiHdh9LOIeiSLvaMhK5kMUnHZBUr7i7MmohEk9AF2ZBnQZATFo0bR0cXVlY2fHIltx6A03XKPlU3tl7ozQD2voh4Bm6v8h0qS63ieOLEVVqgvvDQALgqolwrzZABSdRDrQXtcioRFebc4IiYjIZBeZCEhCacy5jx527fdIq3EDsN3xDlsvEMRhVX3bdaWl3uwjZBtnEFUTZB55NUrc4Aw3uhjNF5Tk3pyr2wjargr3N9pDCbB28Av4Gw4b2MdKAGu5bowcZD',
            isContracted: true,
            workingHours: '{}'
        }
    });

    console.log(`✅ Salon Created/Updated: ${salon.name}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
