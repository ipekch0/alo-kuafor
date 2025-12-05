const express = require('express');
const router = express.Router();
// const OpenAI = require('openai'); // Uncomment when API key is available

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

router.post('/generate-image', async (req, res) => {
    try {
        const { prompt, style } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        console.log('Generating image for:', prompt, 'Style:', style);

        // MOCK IMPLEMENTATION FOR DEMO
        // In production, uncomment the OpenAI call below

        /*
        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: `${style} style hair salon design: ${prompt}`,
            n: 1,
            size: "1024x1024",
        });
        const imageUrl = response.data[0].url;
        */

        // Return a high-quality placeholder image based on keywords for demo purposes
        const keywords = prompt.toLowerCase();
        let imageUrl = "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1024&auto=format&fit=crop"; // Default Salon

        if (keywords.includes('hair') || keywords.includes('sac')) {
            imageUrl = "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=1024&auto=format&fit=crop";
        } else if (keywords.includes('nail') || keywords.includes('tirnak')) {
            imageUrl = "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=1024&auto=format&fit=crop";
        } else if (keywords.includes('modern')) {
            imageUrl = "https://images.unsplash.com/photo-1521590832169-d7fcbe2af40f?q=80&w=1024&auto=format&fit=crop";
        }

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        res.json({
            success: true,
            imageUrl: imageUrl,
            message: "Demo Mode: Real AI generation requires API Key."
        });

    } catch (error) {
        console.error('AI Generation Error:', error);
        res.status(500).json({ error: 'Image generation failed' });
    }
});

module.exports = router;
