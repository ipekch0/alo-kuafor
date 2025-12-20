const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// PUBLIC ROUTES (No Auth Required) ============================

// POST public appointment (guest booking)
router.post('/public', async (req, res) => {
    try {
        const { salonId, serviceId, professionalId, date, time, customerName, customerPhone, notes } = req.body;

        if (!customerPhone || customerPhone.trim() === '') {
            return res.status(400).json({ error: 'Telefon numarası zorunludur.' });
        }

        // 1. Find or Create Customer
        let customer = await prisma.customer.findFirst({
            where: { phone: customerPhone }
        });

        if (!customer) {
            customer = await prisma.customer.create({
                data: {
                    name: customerName,
                    phone: customerPhone,
                    // If we had salonId on Customer (many-to-many?), we'd link it. 
                    // Current schema: Customer has appointments. Appointments have salonId.
                    // Ideally we should link customer to this salon context if our schema supports it, 
                    // but for now creating it globally/unlinked is fine as per schema.
                    // Wait, let's check schema. Customer doesn't have salonId. 
                    // So a customer is global or implied by appointments.
                }
            });
        }

        // 2. Get Service Price
        const service = await prisma.service.findUnique({ where: { id: parseInt(serviceId) } });
        if (!service) return res.status(404).json({ error: 'Service not found' });

        // 3. Create Appointment
        const dateTime = new Date(`${date}T${time}:00`);

        const appointment = await prisma.appointment.create({
            data: {
                salonId: parseInt(salonId),
                customerId: customer.id,
                professionalId: parseInt(professionalId),
                serviceId: parseInt(serviceId),
                dateTime: dateTime,
                status: 'pending', // Pending approval for public bookings usually
                totalPrice: service.price,
                notes: notes || 'Online booking'
            },
            include: {
                customer: true,
                service: true,
                professional: true
            }
        });

        res.status(201).json(appointment);
    } catch (error) {
        console.error("Public booking error:", error);
        res.status(400).json({ error: error.message });
    }
});

// PROTECTED ROUTES (Auth Required) ============================
router.use(authMiddleware);

// GET customer's own appointments (Placed here to avoid collision with /:id)
router.get('/my-appointments', async (req, res) => {
    try {
        // Need to find the customer profile for this user first
        // If user is a customer, they should have a phone number.
        // We match via phone because User -> Customer link is loose in this schema version
        const customer = await prisma.customer.findFirst({
            where: { phone: req.user.phone }
        });

        if (!customer) return res.json([]);

        const appointments = await prisma.appointment.findMany({
            where: { customerId: customer.id },
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

        const updateData = { status };
        if (status === 'completed') {
            updateData.isPaid = true;
        }

        const appointment = await prisma.appointment.update({
            where: { id: parseInt(req.params.id) },
            data: updateData,
            include: { customer: true, user: true } // Include user/customer for notification
        });

        // Create Notification if user exists
        if (appointment.userId) {
            let title = 'Randevu Durumu Güncellendi';
            let message = `Randevunuzun durumu: ${status}`;

            if (status === 'confirmed') {
                title = 'Randevunuz Onaylandı ✅';
                message = `${appointment.dateTime.toLocaleString('tr-TR')} tarihli randevunuz onaylandı.`;
            } else if (status === 'completed') {
                title = 'Randevunuz Tamamlandı 🎉';
                message = 'Hizmetiniz tamamlandı. Bizi tercih ettiğiniz için teşekkürler!';
            } else if (status === 'cancelled') {
                title = 'Randevu İptal Edildi ❌';
                message = 'Randevunuz iptal edilmiştir.';
            }

            await prisma.notification.create({
                data: {
                    userId: appointment.userId,
                    title,
                    message,
                    type: status === 'cancelled' ? 'error' : 'success'
                }
            });
        }

        res.json(appointment);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// POST pay for appointment
router.post('/:id/pay', async (req, res) => {
    try {
        const { paymentMethod, cardDetails } = req.body;

        const appointment = await prisma.appointment.update({
            where: { id: parseInt(req.params.id) },
            data: {
                isPaid: true,
                paymentMethod: paymentMethod || 'credit_card',
                status: 'confirmed'
            }
        });

        res.json({ success: true, appointment });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
