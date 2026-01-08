const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Apply auth middleware
router.use(authMiddleware);

// GET /api/search?q=query
router.get('/', async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.length < 2) {
            return res.json({ customers: [], appointments: [], services: [], professionals: [] });
        }

        // 1. Find user's salon
        const salon = await prisma.salon.findFirst({
            where: { ownerId: req.user.id }
        });

        if (!salon) {
            return res.json({ customers: [], appointments: [], services: [], professionals: [] });
        }

        const searchQuery = q.toLowerCase();

        // 2. Run queries in parallel
        const [customers, appointments, services, professionals] = await Promise.all([
            // Search Customers
            prisma.customer.findMany({
                where: {
                    OR: [
                        { name: { contains: q } }, // Case insensitive usually handled by DB collation or ILIKE if Postgres
                        { phone: { contains: q } },
                        { email: { contains: q } }
                    ],
                    // We only want customers associated with this salon (via appointments)
                    // Or if we have a direct link. Since we don't have direct link, we search ALL customers 
                    // that match the queries AND have at least one appointment in this salon?
                    // For simplicity/performance, let's search ALL customers for now, 
                    // or ideally check if they have relation.
                    // Given the schema, let's just search by text for now.
                    appointments: {
                        some: { salonId: salon.id }
                    }
                },
                take: 5
            }),

            // Search Appointments (by Customer Name or ID)
            prisma.appointment.findMany({
                where: {
                    salonId: salon.id,
                    OR: [
                        { customer: { name: { contains: q } } },
                        { id: !isNaN(parseInt(q)) ? parseInt(q) : undefined }
                    ]
                },
                include: {
                    customer: true,
                    service: true,
                    professional: true
                },
                take: 5,
                orderBy: { dateTime: 'desc' }
            }),

            // Search Services
            prisma.service.findMany({
                where: {
                    salonId: salon.id,
                    name: { contains: q }
                },
                take: 5
            }),

            // Search Professionals
            prisma.professional.findMany({
                where: {
                    salonId: salon.id,
                    name: { contains: q }
                },
                take: 5
            })
        ]);

        res.json({
            customers,
            appointments,
            services,
            professionals
        });

    } catch (error) {
        console.error('Search Error:', error);
        res.status(500).json({ error: 'Arama sırasında hata oluştu.' });
    }
});

module.exports = router;
