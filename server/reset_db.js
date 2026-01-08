const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetDatabase() {
    console.log('🗑️  Veritabanı temizleniyor...');
    try {

        // Delete dependent tables first
        await prisma.message.deleteMany({});
        await prisma.conversation.deleteMany({});
        await prisma.review.deleteMany({});
        await prisma.expense.deleteMany({});
        await prisma.notification.deleteMany({});

        await prisma.appointment.deleteMany({});
        await prisma.professional.deleteMany({});
        await prisma.service.deleteMany({});
        await prisma.customer.deleteMany({});
        await prisma.salon.deleteMany({});
        await prisma.user.deleteMany({});

        console.log('✅ Veritabanı başarıyla sıfırlandı! Her şey tertemiz.');
    } catch (error) {
        console.error('❌ Sıfırlama hatası:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetDatabase();
