const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Apply auth middleware
router.use(authMiddleware);

// GET all appointments (for current user's salon)
router.get('/', async (req, res) => {
    try {
        const salon = await prisma.salon.findFirst({
            where: { ownerId: req.user.id }
        });

        if (!salon) {
            return res.json([]);
        }

        const appointments = await prisma.appointment.findMany({
            where: { salonId: salon.id },
            include: {
                customer: true,
                professional: true,
                service: true
            },
            orderBy: { dateTime: 'desc' }
        });

        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single appointment
router.get('/:id', async (req, res) => {
    try {
        const appointment = await prisma.appointment.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                customer: true,
                professional: true,
                service: true
            }
        });

        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        res.json(appointment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create appointment
router.post('/', async (req, res) => {
    try {
        const { customerId, professionalId, serviceId, date, time, notes } = req.body;

        const salon = await prisma.salon.findFirst({
            where: { ownerId: req.user.id }
        });

        if (!salon) {
            return res.status(400).json({ error: 'Salon not found.' });
        }

        const service = await prisma.service.findUnique({ where: { id: parseInt(serviceId) } });
        const dateTime = new Date(`${date}T${time}:00`);

        const appointment = await prisma.appointment.create({
            data: {
                salonId: salon.id,
                customerId: parseInt(customerId),
                professionalId: parseInt(professionalId),
                serviceId: parseInt(serviceId),
                dateTime: dateTime,
                status: 'confirmed',
                totalPrice: service.price,
                notes
            },
            include: {
                customer: true,
                professional: true,
                service: true
            }
        });

        res.status(201).json(appointment);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT update status
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const appointment = await prisma.appointment.update({
            where: { id: parseInt(req.params.id) },
            data: { status }
        });
        res.json(appointment);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// GET customer's own appointments
router.get('/my-appointments', async (req, res) => {
    try {
        // Find appointments where the user is linked
        const appointments = await prisma.appointment.findMany({
            where: { userId: req.user.id },
            include: {
                salon: true,
                professional: true,
                service: true
            },
            orderBy: { dateTime: 'desc' }
        });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST pay for appointment
router.post('/:id/pay', async (req, res) => {
    try {
        const { paymentMethod, cardDetails } = req.body;

        // In a real app, process payment with cardDetails here via Stripe/Iyzico
        // For now, we simulate success

        const appointment = await prisma.appointment.update({
            where: { id: parseInt(req.params.id) },
            data: {
                isPaid: true,
                paymentMethod: paymentMethod || 'credit_card',
                status: 'confirmed' // Auto confirm if paid? Or keep as is. Let's confirm to make user happy.
            }
        });

        res.json({ success: true, appointment });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
