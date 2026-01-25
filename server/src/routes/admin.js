
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken'); // Added for Impersonation

const prisma = require('../lib/prisma');
const authenticateToken = require('../middleware/auth');

// Middleware to check if user is Super Admin
const requireSuperAdmin = async (req, res, next) => {
    try {
        if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Boss only.' });
        }
        next();
    } catch (error) {
        res.status(500).json({ error: 'Auth check failed' });
    }
};

// GET /api/admin/stats - Global Dashboard Stats
router.get('/stats', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
        // 1. Total Revenue (Sum of all completed, paid appointments)
        const revenueAgg = await prisma.appointment.aggregate({
            where: {
                status: 'completed',
                isPaid: true
            },
            _sum: {
                totalPrice: true
            }
        });

        // 2. Active Salons
        const activeSalonsCount = await prisma.salon.count({
            where: { isVerified: true } // Assuming verified means active for now
        });

        // 3. Total Appointments
        const totalAppointments = await prisma.appointment.count();

        // 4. Salons List with Monthly Revenue
        const salons = await prisma.salon.findMany({
            include: {
                owner: {
                    select: { name: true, email: true }
                },
                appointments: {
                    where: {
                        createdAt: {
                            gte: new Date(new Date().setDate(1)) // This month
                        },
                        status: 'completed'
                    },
                    select: {
                        totalPrice: true
                    }
                }
            }
        });

        const formattedSalons = salons.map(salon => {
            const monthlyRevenue = salon.appointments.reduce((acc, curr) => acc + Number(curr.totalPrice), 0);
            return {
                id: salon.id,
                name: salon.name,
                owner: salon.owner.name,
                ownerEmail: salon.owner.email,
                status: salon.isVerified ? 'active' : 'pending',
                isVerified: salon.isVerified,
                taxNumber: salon.taxNumber,
                taxOffice: salon.taxOffice,
                monthlyRevenue: monthlyRevenue,
                city: salon.city
            };
        });

        res.json({
            stats: {
                totalRevenue: revenueAgg._sum.totalPrice || 0,
                activeSalons: activeSalonsCount,
                totalAppointments: totalAppointments,
                systemStatus: 'Stable'
            },
            salons: formattedSalons
        });

    } catch (error) {
        console.error('Admin Stats Error:', error);
        res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
});

// POST /api/admin/verify-salon - GOD MODE: Verify a salon
router.post('/verify-salon', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
        const { salonId } = req.body;

        await prisma.salon.update({
            where: { id: salonId },
            data: { isVerified: true }
        });

        res.json({ success: true, message: 'Salon verified successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Verification failed' });
    }
});

// POST /api/admin/impersonate - GOD MODE: Login as any user
router.post('/impersonate', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
        const { userId } = req.body;
        // userId here is actually salonId from the frontend call, let's fix that or handle both
        // If it's a salonId, we need the ownerId
        const salon = await prisma.salon.findUnique({ where: { id: userId } });
        const targetUserId = salon ? salon.ownerId : userId;

        const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });

        if (!targetUser) return res.status(404).json({ error: 'User not found' });

        // Generate a new token for this user without password check
        const token = jwt.sign(
            { userId: targetUser.id, role: targetUser.role },
            process.env.JWT_SECRET || 'temp_secret_key_123',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: targetUser.id,
                name: targetUser.name,
                email: targetUser.email,
                role: targetUser.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'God Mode Login Failed' });
    }
});

// POST /api/admin/ban-user - GOD MODE: Ban a user/salon
router.post('/ban-user', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
        const { userId, action } = req.body; // action: 'ban' or 'unban'
        const isActive = action === 'unban';

        // Check if userId is salonId
        const salon = await prisma.salon.findUnique({ where: { id: userId } });
        const targetUserId = salon ? salon.ownerId : userId;

        await prisma.user.update({
            where: { id: targetUserId },
            data: { isActive: isActive }
        });

        res.json({ success: true, message: `User ${action}ed successfully via God Mode.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ban Hammer Failed' });
    }
});

// GET /api/admin/messages - GOD MODE: Spy on messages
router.get('/messages', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
        const messages = await prisma.message.findMany({
            take: 50,
            orderBy: { createdAt: 'desc' },
            include: {
                conversation: {
                    include: {
                        user: { select: { name: true, email: true } },
                        salon: { select: { name: true } }
                    }
                }
            }
        });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Spy Mode Failed' });
    }
});

module.exports = router;
