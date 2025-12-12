const express = require('express');
const router = express.Router();
// const whatsappManager = require('../services/whatsappManager');
const authenticateToken = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Middleware to get salonId from user
const getSalonId = async (req, res, next) => {
    try {
        const salon = await prisma.salon.findFirst({
            where: { ownerId: req.user.id }
        });
        if (!salon) return res.status(404).json({ error: 'Salon not found' });
        req.salonId = salon.id;
        next();
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
};

// GET /api/whatsapp/status
router.get('/status', authenticateToken, getSalonId, (req, res) => {
    const status = whatsappManager.getSessionStatus(req.salonId);
    res.json(status);
});

// POST /api/whatsapp/connect
router.post('/connect', authenticateToken, getSalonId, async (req, res) => {
    try {
        await whatsappManager.startSession(req.salonId);
        res.json({ message: 'Session initialization started' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/whatsapp/disconnect
router.post('/disconnect', authenticateToken, getSalonId, async (req, res) => {
    try {
        await whatsappManager.logout(req.salonId);

        // Also update the database to remove the connected number
        await prisma.salon.update({
            where: { id: req.salonId },
            data: {
                whatsappPhoneId: null,
                // whatsappAPIToken: null // If we were storing token
            }
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /api/whatsapp/config
router.post('/config', authenticateToken, getSalonId, async (req, res) => {
    try {
        const { phoneId, accessToken, wabaId } = req.body;

        // Basic validation
        if (!phoneId || !accessToken) {
            return res.status(400).json({ error: 'Phone ID and Access Token are required' });
        }

        // Update the salon's WhatsApp configuration
        await prisma.salon.update({
            where: { id: req.salonId },
            data: {
                whatsappPhoneId: phoneId,
                whatsappAPIToken: accessToken,
                whatsappBusinessId: wabaId
            }
        });

        console.log(`✅ WhatsApp Connected for Salon ${req.salonId}: ID ${phoneId}`);
        res.json({ success: true });
    } catch (error) {
        console.error('Update WhatsApp Config Error:', error);
        // Handle unique constraint error if another salon used this ID (unlikely in this flow but possible)
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'This WhatsApp number is already connected to another account.' });
        }
        res.status(500).json({ error: 'Failed to update configuration' });
    }
});

module.exports = router;
