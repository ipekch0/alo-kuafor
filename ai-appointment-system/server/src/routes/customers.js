const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET all customers (who have appointments at the user's salon)
router.get('/', async (req, res) => {
    try {
        // 1. Get user's salon
        const salon = await prisma.salon.findFirst({
            where: { ownerId: req.user.id }
        });

        if (!salon) {
            return res.json([]);
        }

        // 2. Get customers who have appointments at this salon
        // Since Customer doesn't have salonId, we filter by appointments
        const customers = await prisma.customer.findMany({
            where: {
                appointments: {
                    some: {
                        salonId: salon.id
                    }
                }
            },
            include: {
                _count: {
                    select: { appointments: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        // Parse JSON fields and format
        const formattedCustomers = customers.map(customer => ({
            ...customer,
            totalAppointments: customer._count.appointments
        }));

        res.json(formattedCustomers);
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET single customer
router.get('/:id', async (req, res) => {
    try {
        const customer = await prisma.customer.findUnique({
            where: {
                id: parseInt(req.params.id)
            },
            include: {
                appointments: {
                    include: {
                        service: true,
                        professional: true,
                        salon: true
                    },
                    orderBy: { dateTime: 'desc' }
                }
            }
        });

        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create customer
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, address, city, idNumber, notes } = req.body;

        if (!phone || phone.trim() === '') {
            return res.status(400).json({ error: 'Telefon numarası zorunludur.' });
        }

        // Check if phone already exists
        const existingCustomer = await prisma.customer.findUnique({
            where: { phone }
        });

        if (existingCustomer) {
            // Instead of error, return the existing customer
            // This allows the frontend to proceed as if "added" to the system
            return res.status(200).json({
                ...existingCustomer,
                message: 'Müşteri sistemde zaten kayıtlı. İşlem başarılı.'
            });
        }

        const customer = await prisma.customer.create({
            data: {
                name,
                email: email || null,
                phone,
                city: city || null,
                address: address || null,
                idNumber: idNumber || null,
                notes: notes || null
            }
        });

        res.status(201).json(customer);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT update customer
router.put('/:id', async (req, res) => {
    try {
        const { name, email, phone, address, city, idNumber, notes } = req.body;

        const customer = await prisma.customer.update({
            where: { id: parseInt(req.params.id) },
            data: {
                ...(name && { name }),
                ...(email !== undefined && { email }),
                ...(phone && { phone }),
                ...(city !== undefined && { city }),
                ...(address !== undefined && { address }),
                ...(idNumber !== undefined && { idNumber }),
                ...(notes !== undefined && { notes })
            }
        });

        res.json(customer);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE customer
router.delete('/:id', async (req, res) => {
    try {
        await prisma.customer.delete({
            where: { id: parseInt(req.params.id) }
        });

        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
