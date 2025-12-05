const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Apply auth middleware
router.use(authMiddleware);

// GET all professionals (for current user's salon)
router.get('/', async (req, res) => {
    try {
        // Find salon owned by user
        const salon = await prisma.salon.findFirst({
            where: { ownerId: req.user.id }
        });

        if (!salon) {
            return res.json([]); // No salon, no professionals
        }

        const professionals = await prisma.professional.findMany({
            where: {
                salonId: salon.id,
                active: true // Only return active professionals
            },
            include: {
                _count: {
                    select: { appointments: true }
                }
            }
        });

        // Parse JSON fields
        const formatted = professionals.map(pro => ({
            ...pro,
            specialties: pro.specialties ? JSON.parse(pro.specialties) : [],
            workingHours: pro.workingHours ? JSON.parse(pro.workingHours) : {}
        }));

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ... (keep other routes same until DELETE)

// DELETE professional (Soft Delete)
router.delete('/:id', async (req, res) => {
    try {
        // Soft delete: Just mark as inactive
        await prisma.professional.update({
            where: { id: parseInt(req.params.id) },
            data: { active: false }
        });

        res.json({ message: 'Professional deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
