const { PrismaClient } = require('@prisma/client');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const prisma = new PrismaClient();

async function seedWhatsApp() {
    console.log('🌱 WhatsApp bilgileri tanımlanıyor...');

    const numberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!numberId || !accessToken) {
        console.error('❌ .env dosyasında WHATSAPP_PHONE_NUMBER_ID veya WHATSAPP_ACCESS_TOKEN eksik.');
        return;
    }

    
    const salon = await prisma.salon.findFirst();

    if (!salon) {
        console.error('❌ Hiç salon bulunamadı. Lütfen önce panelden kayıt olun!');
        return;
    }

    try {
        await prisma.salon.update({
            where: { id: salon.id },
            data: {
                whatsappNumberId: numberId,
                whatsappAccessToken: accessToken
            }
        });
        console.log(`✅ ${salon.name} için WhatsApp bilgileri başarıyla tanımlandı!`);
    } catch (error) {
        console.error('❌ Hata:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedWhatsApp();
