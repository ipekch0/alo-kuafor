const express = require('express');
const router = express.Router();
// const OpenAI = require('openai'); // Uncomment when API key is available

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

router.post('/generate-image', async (req, res) => {
    try {
        const { prompt, style } = req.body;
        console.log('Generating image for:', prompt, 'Style:', style);

        // SMART DEMO LOGIC
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

        // Simulate processing time for realism
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
        const lowerMsg = message.toLowerCase();
        let reply = "Size nasıl yardımcı olabilirim? Randevu, hizmetler veya stil önerileri hakkında sorabilirsiniz.";

        // Smart responses
        if (lowerMsg.includes('fiyat') || lowerMsg.includes('kaç tl') || lowerMsg.includes('ücret')) {
            reply = "Fiyatlarımız seçtiğiniz uzmana ve hizmete göre değişmektedir. Kesim işlemleri 200 TL'den, Boya işlemleri 800 TL'den başlamaktadır. Detaylı bilgi için 'Hizmetler' menüsünü inceleyebilirsiniz.";
        } else if (lowerMsg.includes('randevu') || lowerMsg.includes('boş')) {
            reply = "Randevu takvimimiz dinamik olarak güncelleniyor. İstediğiniz tarih ve saati belirtirseniz veya doğrudan 'Randevu Al' butonunu kullanırsanız size en uygun zamanı ayarlayabilirim.";
        } else if (lowerMsg.includes('saç') || lowerMsg.includes('model') || lowerMsg.includes('tavsiye')) {
            reply = "Bu sezon doğal dalgalar, 'bob' kesimler ve bakır tonları çok moda! Yüz şeklinize en uygun modeli belirlemek için uzmanlarımızla ücretsiz ön görüşme yapabilirsiniz.";
        } else if (lowerMsg.includes('saat') || lowerMsg.includes('açık')) {
            reply = "Salonumuz haftanın 7 günü 09:00 - 20:00 saatleri arasında hizmet vermektedir.";
        } else if (lowerMsg.includes('nerede') || lowerMsg.includes('konum')) {
            reply = "Merkezi bir konumdayız. İletişim sayfasından harita konumumuza ulaşabilirsiniz.";
        } else if (lowerMsg.includes('merhaba') || lowerMsg.includes('selam')) {
            reply = "Merhaba! Size nasıl yardımcı olabilirim? Bugün kendiniz için ne yapmak istersiniz?";
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        res.json({ reply });
    } catch (error) {
        res.status(500).json({ error: 'Chat failed' });
    }
});

// Status check for UI polling
router.get('/status', (req, res) => {
    res.json({ status: 'ready', configured: true, model: 'smart-mock-v1' });
});

module.exports = router;
