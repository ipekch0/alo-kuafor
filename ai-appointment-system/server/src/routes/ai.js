const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { generateAIResponse } = require('../services/aiService');

// Removed local initialization as it is moved to service
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'no_key');
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

router.post('/generate-image', async (req, res) => {
    try {
        const { prompt, style } = req.body;
        console.log('Generating image for:', prompt, 'Style:', style);

        // SMART DEMO LOGIC (Image Gen is expensive/complex, keeping as Smart Mock for now)
        const keywords = (prompt + " " + (style || "")).toLowerCase();
        let imageUrl = "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1024"; // Default Salon

        // Map keywords to specific high-quality Unsplash images
        if (keywords.includes('blonde') || keywords.includes('sarı')) {
            imageUrl = "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=1024";
        } else if (keywords.includes('nail') || keywords.includes('tırnak')) {
            imageUrl = "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=1024";
        } else if (keywords.includes('man') || keywords.includes('erkek') || keywords.includes('barber')) {
            imageUrl = "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=1024";
        } else if (keywords.includes('makeup') || keywords.includes('makyaj')) {
            imageUrl = "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1024";
        } else if (keywords.includes('modern') || keywords.includes('minimal')) {
            imageUrl = "https://images.unsplash.com/photo-1521590832169-d7fcbe2af40f?q=80&w=1024";
        }

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1500));

        res.json({
            success: true,
            imageUrl: imageUrl,
            message: "AI Image Generated (Demo Mode)"
        });

    } catch (error) {
        console.error('AI Generation Error:', error);
        res.status(500).json({ error: 'Image generation failed' });
    }
});

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
