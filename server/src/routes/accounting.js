const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authenticateToken = require('../middleware/auth');

// Apply auth to all routes
router.use(authenticateToken);

// Helper to get allowed salon IDs for a user
const getAllowedSalonIds = async (user) => {
    if (user.role === 'admin' || user.role === 'super_admin') {
        return null; // All salons allowed
    }

    if (user.role === 'salon_owner' || user.role === 'SALON_OWNER') {
        const salons = await prisma.salon.findMany({
            where: { ownerId: user.id },
            select: { id: true }
        });
        return salons.map(s => s.id);
    }

    if (user.role === 'staff' || user.role === 'STAFF') {
        const professional = await prisma.professional.findUnique({
            where: { userId: user.id },
            select: { salonId: true }
        });
        return professional ? [professional.salonId] : [];
    }

    return [];
};

// GET /stats - Financial Overview
router.get('/stats', async (req, res) => {
    try {
        const userId = req.user.id;
        const { salonId, startDate, endDate } = req.query;

        // Determine allowed salons
        const allowedSalonIds = await getAllowedSalonIds(req.user);

        // Build base filter
        let salonFilter = {};
        const parsedSalonId = parseInt(salonId);

        if (allowedSalonIds === null) {
            // Admin: can see all, or filter by specific
            if (!isNaN(parsedSalonId)) salonFilter.id = parsedSalonId;
        } else {
            // Owner or Staff: restricted to their salons
            if (allowedSalonIds.length === 0) {
                return res.json({
                    revenue: 0,
                    expenses: 0,
                    profit: 0,
                    breakdown: {},
                    monthlyStats: []
                });
            }

            if (!isNaN(parsedSalonId)) {
                if (!allowedSalonIds.includes(parsedSalonId)) {
                    return res.status(403).json({
                        error: 'Access denied for this salon',
                        debug: {
                            userRole: req.user.role,
                            userId: req.user.id,
                            allowedSalonIds,
                            requestedSalonId: parsedSalonId,
                            message: 'User is not linked to this salon via Professional table'
                        }
                    });
                }
                salonFilter.id = parsedSalonId;
            } else {
                salonFilter.id = { in: allowedSalonIds };
            }
        }

        const salons = await prisma.salon.findMany({
            where: salonFilter,
            include: { expenses: true, appointments: true }
        });


        // Date filtering helpers
        const start = startDate ? new Date(startDate) : new Date(0); // Beginning of time if not set

        // FIX: If no endDate is provided, default to far future to include ALL completed appointments (even if scheduled for tomorrow)
        const end = endDate ? new Date(endDate) : new Date('2100-01-01');
        end.setHours(23, 59, 59, 999);

        console.log(`[DEBUG] Stats Request - Start: ${start.toISOString()}, End: ${end.toISOString()}`);


        let totalRevenue = 0;
        let totalExpenses = 0;
        let expensesByCategory = {};

        // Initialize Monthly Data for Last 6 Months
        const monthlyStats = [];
        const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = `${d.getFullYear()}-${d.getMonth()}`; // Unique year-month key
            monthlyStats.push({
                name: monthNames[d.getMonth()],
                key: key,
                revenue: 0,
                expense: 0,
                dateObj: new Date(d.getFullYear(), d.getMonth(), 1)
            });
        }

        // Loop through to aggregate
        for (const salon of salons) {
            // Revenue (Completed appointments)
            const appointments = await prisma.appointment.findMany({
                where: {
                    salonId: salon.id,
                    status: 'completed'
                }
            });

            appointments.forEach(app => {
                const appDate = new Date(app.dateTime);
                const key = `${appDate.getFullYear()}-${appDate.getMonth()}`;

                // Add to total
                if (appDate >= start && appDate <= end) {
                    totalRevenue += Number(app.totalPrice || 0);
                }

                // Add to monthly bucket
                const monthBucket = monthlyStats.find(m => m.key === key);
                if (monthBucket) {
                    monthBucket.revenue += Number(app.totalPrice || 0);
                }
            });

            console.log(`[DEBUG] Salon ${salon.id} - Processed ${appointments.length} appointments. Total Revenue: ${totalRevenue}`);

            // Expenses
            const expenses = await prisma.expense.findMany({
                where: {
                    salonId: salon.id,
                    date: { gte: monthlyStats[0].dateObj }
                }
            });

            expenses.forEach(exp => {
                const amount = Number(exp.amount || 0);
                const expDate = new Date(exp.date);
                const key = `${expDate.getFullYear()}-${expDate.getMonth()}`;

                // Add to total
                if (expDate >= start && expDate <= end) {
                    totalExpenses += amount;
                    expensesByCategory[exp.category] = (expensesByCategory[exp.category] || 0) + amount;
                }

                // Add to monthly bucket
                const monthBucket = monthlyStats.find(m => m.key === key);
                if (monthBucket) {
                    monthBucket.expense += amount;
                }
            });
        }

        res.json({
            revenue: totalRevenue,
            expenses: totalExpenses,
            profit: totalRevenue - totalExpenses,
            breakdown: expensesByCategory,
            monthlyStats: monthlyStats.map(({ name, revenue, expense }) => ({ name, revenue, expense }))
        });

    } catch (error) {
        console.error('Stats Error Stack:', error);
        res.status(500).json({ error: 'Stats error', details: error.message });
    }
});

// GET /expenses - List
router.get('/expenses', authenticateToken, async (req, res) => {
    try {
        const { salonId } = req.query;
        const allowedSalonIds = await getAllowedSalonIds(req.user);

        let whereClause = {};

        if (allowedSalonIds !== null) {
            // Restricted access
            if (allowedSalonIds.length === 0) return res.json([]);
            whereClause.salonId = { in: allowedSalonIds };
        }

        if (salonId) {
            const parsedId = parseInt(salonId);
            if (allowedSalonIds !== null && !allowedSalonIds.includes(parsedId)) {
                return res.status(403).json({
                    error: 'Access denied',
                    debug: {
                        userRole: req.user.role,
                        userId: req.user.id,
                        allowedSalonIds,
                        requestedSalonId: parsedId
                    }
                });
            }
            whereClause.salonId = parsedId;
        }

        const expenses = await prisma.expense.findMany({
            where: whereClause,
            orderBy: { date: 'desc' },
            take: 100,
            include: { salon: { select: { name: true } } }
        });

        res.json(expenses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /expenses - Create
router.post('/expenses', authenticateToken, async (req, res) => {
    try {
        let { salonId, category, amount, description, date } = req.body;
        const allowedSalonIds = await getAllowedSalonIds(req.user);

        // Auto-detect salonId if not provided
        if (!salonId) {
            if (allowedSalonIds === null) {
                // Admin: just pick first salon if not specified (testing convenience)
                const salon = await prisma.salon.findFirst();
                if (salon) salonId = salon.id;
            } else if (allowedSalonIds.length > 0) {
                // Default to first allowed salon
                salonId = allowedSalonIds[0];
            } else {
                return res.status(400).json({ error: 'Salon bulunamadı. Yetkiniz yok veya salon tanımlı değil.' });
            }
        }

        // Verify permission
        const parsedSalonId = parseInt(salonId);
        if (allowedSalonIds !== null && !allowedSalonIds.includes(parsedSalonId)) {
            return res.status(403).json({ error: 'Bu salon için işlem yapma yetkiniz yok' });
        }

        const expense = await prisma.expense.create({
            data: {
                salonId: parsedSalonId,
                category,
                amount: parseFloat(amount),
                description,
                date: date ? new Date(date) : new Date()
            }
        });

        res.json(expense);

    } catch (error) {
        console.error('Create Expense Error:', error);
        res.status(500).json({ error: 'Create error' });
    }
});

// DELETE /expenses/:id
router.delete('/expenses/:id', authenticateToken, async (req, res) => {
    try {
        const expenseId = parseInt(req.params.id);
        const expense = await prisma.expense.findUnique({ where: { id: expenseId }, include: { salon: true } });

        if (!expense) return res.status(404).json({ error: 'Not found' });

        const allowedSalonIds = await getAllowedSalonIds(req.user);

        if (allowedSalonIds !== null && !allowedSalonIds.includes(expense.salonId)) {
            return res.status(403).json({ error: 'No permission' });
        }

        await prisma.expense.delete({ where: { id: expenseId } });
        res.json({ success: true });

    } catch (error) {
        res.status(500).json({ error: 'Delete error' });
    }
});

// DEBUG ROUTE
router.get('/debug-revenue', authenticateToken, async (req, res) => {
    try {
        const allowedSalonIds = await getAllowedSalonIds(req.user);

        let salonFilter = {};
        if (allowedSalonIds !== null) {
            if (allowedSalonIds.length === 0) return res.json({ message: 'No allowed salons' });
            salonFilter.id = { in: allowedSalonIds };
        }

        const salons = await prisma.salon.findMany({
            where: salonFilter
        });

        const debugData = [];

        for (const salon of salons) {
            const appointments = await prisma.appointment.findMany({
                where: {
                    salonId: salon.id,
                    status: 'completed'
                },
                take: 10,
                orderBy: { dateTime: 'desc' },
                select: { id: true, status: true, totalPrice: true, dateTime: true, isPaid: true }
            });

            let calculatedRevenue = 0;
            const allCompleted = await prisma.appointment.findMany({
                where: { salonId: salon.id, status: 'completed' },
                select: { totalPrice: true }
            });

            allCompleted.forEach(a => calculatedRevenue += Number(a.totalPrice || 0));

            debugData.push({
                salonId: salon.id,
                salonName: salon.name,
                last10CompletedAppointments: appointments,
                totalCalculatedRevenue: calculatedRevenue,
                appointmentCount: allCompleted.length
            });
        }

        res.json({
            userInfo: { id: req.user.id, role: req.user.role, email: req.user.email },
            allowedSalonIds,
            salonsFound: salons.length,
            data: debugData
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

