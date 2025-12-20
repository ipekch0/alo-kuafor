const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SUBSCRIPTION_LIMITS = {
    SILVER: {
        maxProfessionals: 3,
        maxServices: 10,
        price: 800,
        features: ['basic_calendar', 'online_booking']
    },
    GOLD: {
        maxProfessionals: 10,
        maxServices: 50,
        price: 1100,
        features: ['basic_calendar', 'online_booking', 'sms_notifications', 'revenue_reports', 'whatsapp_ai']
    },
    ULTRA: {
        maxProfessionals: 999,
        maxServices: 999,
        price: 0, // Contact for price
        features: ['basic_calendar', 'online_booking', 'sms_notifications', 'revenue_reports', 'whatsapp_ai', 'style_recommender', 'churn_prediction', 'dedicated_support']
    }
};

async function checkSubscriptionLimit(salonId, resource) {
    const salon = await prisma.salon.findUnique({
        where: { id: salonId },
        select: { subscriptionPlan: true }
    });

    if (!salon) return false;

    const plan = salon.subscriptionPlan || 'SILVER';
    const limits = SUBSCRIPTION_LIMITS[plan] || SUBSCRIPTION_LIMITS.SILVER;

    if (resource === 'professional') {
        const count = await prisma.professional.count({ where: { salonId } });
        return count < limits.maxProfessionals;
    }

    if (resource === 'service') {
        const count = await prisma.service.count({ where: { salonId } });
        return count < limits.maxServices;
    }

    return true;
}

module.exports = {
    SUBSCRIPTION_LIMITS,
    checkSubscriptionLimit
};
