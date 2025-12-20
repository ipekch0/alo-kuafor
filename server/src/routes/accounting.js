const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authenticateToken = require('../middleware/auth');

// Apply auth and permission check to all routes
router.use(authenticateToken);
router.use(authenticateToken.requirePermission('VIEW_FINANCE'));
// Helper to check if user owns the salon or is admin
const checkAccess = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const salonId = parseInt(req.query.salonId || req.body.salonId);

        if (userRole === 'admin') return next();

        if (salonId) {
            const salon = await prisma.salon.findFirst({
                where: { id: salonId, ownerId: userId }
            });
            if (salon) return next();
        }

        // If no salonId provided, we might rely on the main function to filter by ownerId
        return next();
    } catch (e) {
        res.status(403).json({ error: 'Access denied' });
    }
};

// GET /stats - Financial Overview
router.get('/stats', async (req, res) => {
    try {
        const userId = req.user.id;
        const { salonId, startDate, endDate } = req.query;

        // Build base filter
        let salonFilter = {};
        const parsedSalonId = parseInt(salonId);

        if (req.user.role === 'admin') {
            if (!isNaN(parsedSalonId)) salonFilter.id = parsedSalonId;
        } else {
            // Salon owner: find their salons
            salonFilter.ownerId = userId;
            if (!isNaN(parsedSalonId)) salonFilter.id = parsedSalonId;
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
        // Note: Make sure these month names match what you want displayed. 'ağustos' was lowercase in my read, fixing to 'Ağustos'
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
            // Revenue (Completed appointments)
            // Fetch all completed appointments to ensure correct total revenue calculation (even older than 6 months)
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


            console.log(`[DEBUG] Salon ${salon.id} - Found ${appointments.length} completed appointments. Current Total Revenue: ${totalRevenue}`);


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
        const userId = req.user.id;
        const { salonId } = req.query;

        let whereClause = {};

        if (req.user.role !== 'admin') {
            // Must belong to owned salon
            const ownedSalons = await prisma.salon.findMany({ where: { ownerId: userId }, select: { id: true } });
            const ownedIds = ownedSalons.map(s => s.id);
            whereClause.salonId = { in: ownedIds };
        }

        if (salonId) {
            whereClause.salonId = parseInt(salonId);
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

        // Auto-detect salonId if not provided (for single-salon owners)
        if (!salonId && req.user.role !== 'admin') {
            const salon = await prisma.salon.findFirst({
                where: { ownerId: req.user.id }
            });
            if (salon) {
                salonId = salon.id;
            } else {
                return res.status(400).json({ error: 'Salon bulunamadı' });
            }
        }

        // Verify ownership (if salonId was provided manually or autofilled)
        if (req.user.role !== 'admin') {
            const salon = await prisma.salon.findFirst({
                where: { id: parseInt(salonId), ownerId: req.user.id }
            });
            if (!salon) return res.status(403).json({ error: 'Not authorized for this salon' });
        }

        const expense = await prisma.expense.create({
            data: {
                salonId: parseInt(salonId),
                category,
                amount: parseFloat(amount),
                description,
                date: date ? new Date(date) : new Date()
            }
        });

        res.json(expense);

    } catch (error) {
        res.status(500).json({ error: 'Create error' });
    }
});

// DELETE /expenses/:id
router.delete('/expenses/:id', authenticateToken, async (req, res) => {
    try {
        const expenseId = parseInt(req.params.id);
        const expense = await prisma.expense.findUnique({ where: { id: expenseId }, include: { salon: true } });

        if (!expense) return res.status(404).json({ error: 'Not found' });

        if (req.user.role !== 'admin' && expense.salon.ownerId !== req.user.id) {
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
        const userId = req.user.id;
        const salons = await prisma.salon.findMany({
            where: { ownerId: userId }
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

        res.json(debugData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

