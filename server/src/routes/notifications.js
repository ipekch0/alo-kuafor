const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Protected Routes
router.use(authMiddleware);

// GET all notifications for the user
router.get('/', async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' }
        });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT mark as read
router.put('/:id/read', async (req, res) => {
    try {
        const notification = await prisma.notification.update({
            where: { id: parseInt(req.params.id) },
            data: { isRead: true }
        });
        res.json(notification);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
