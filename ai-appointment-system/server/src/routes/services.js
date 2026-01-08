const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const { checkSubscriptionLimit } = require('../utils/subscription');

const router = express.Router();
const prisma = new PrismaClient();

// Apply auth middleware
router.use(authMiddleware);

// GET all services (for current user's salon)
router.get('/', async (req, res) => {
    try {
        const salon = await prisma.salon.findFirst({
            where: { ownerId: req.user.id }
        });

        if (!salon) {
            return res.json([]);
        }

        const services = await prisma.service.findMany({
            where: { salonId: salon.id }
        });
        res.json(services);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create service
router.post('/', async (req, res) => {
    try {
        const { name, category, description, duration, price } = req.body;

        const salon = await prisma.salon.findFirst({
            where: { ownerId: req.user.id }
        });

        if (!salon) {
            return res.status(404).json({ error: 'Salon not found' });
        }

        // Check subscription limits (optional implementation)
        // await checkSubscriptionLimit(salon.id, 'services');

        const service = await prisma.service.create({
            data: {
                salonId: salon.id,
                name,
                category,
                description,
                duration: parseInt(duration),
                price: parseFloat(price)
            }
        });

        res.json(service);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE service
router.delete('/:id', async (req, res) => {
    try {
        await prisma.service.delete({
            where: { id: parseInt(req.params.id) }
        });
        res.json({ message: 'Service deleted' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
