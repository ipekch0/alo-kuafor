const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { generateAIResponse } = require('../services/aiService');

// Removed local initialization as it is moved to service
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'no_key');
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });



const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;

        // Fetch "Context" - ideally we should know the salonId, but for now fetch the first one (Demo/Single Tenant)
        const salon = await prisma.salon.findFirst({
            include: { services: true, professionals: true }
        });

        const context = {
            salonName: salon?.name || 'OdakManage Salon',
            salonId: salon?.id,
            services: salon?.services || [],
            workingHours: salon?.workingHours,
            senderPhone: 'guest' // No phone for web chat yet
        };

        const reply = await generateAIResponse(message, context);
        res.json({ reply });
    } catch (error) {
        console.error('Gemini Chat System Error:', error);
        res.status(500).json({ error: 'Chat failed' });
    }
});

// Status check for UI polling
router.get('/status', (req, res) => {
    res.json({
        status: 'ready',
        configured: !!process.env.GEMINI_API_KEY,
        model: 'gemini-pro'
    });
});

module.exports = router;
