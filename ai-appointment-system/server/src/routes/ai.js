const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { generateAIResponse } = require('../services/aiService');

// Removed local initialization as it is moved to service
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'no_key');
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });



router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const reply = await generateAIResponse(message);
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
