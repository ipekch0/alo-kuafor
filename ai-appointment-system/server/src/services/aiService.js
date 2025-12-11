
const axios = require('axios');

// Initialize Gemini
// using direct REST API to avoid SDK/Fetch issues in some environments
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

async function generateAIResponse(message, context = {}) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.warn('GEMINI_API_KEY is missing.');
        // Fallback Mock
        const lowerMsg = message.toLowerCase();
        let reply = "Sistem şu an Yapay Zeka anahtarı eksik olduğu için tam kapasite çalışamıyor.";
        if (lowerMsg.includes('merhaba')) reply = "Merhaba! (API Key Eksik)";
        return reply;
    }

    const salonName = context.salonName || 'OdakManage';

    const systemPrompt = `
    Sen '${salonName}' için çalışan profesyonel ve yardımsever bir yapay zeka asistanısın.
    İsmin: '${salonName} Asistan'.
        Görevin: Müşterilerin sorularını nazik, profesyonel, kısa ve satış odaklı bir dille yanıtlamak.

            Bilgiler:
- Salon Adı: ${salonName}
- Randevu: Müşteriyi nazikçe 'Randevu Al' butonuna veya web sitesine yönlendir.
    - Dil: Türkçe konuş.
    - Tarzın: Emoji kullanabilirsin 💇‍♀️✨. Samimi ama saygılı ol.Çok uzun paragraflar yazma.

    Müşteri Mesajı: "${message}"
Cevabın:
`;

    try {
        const response = await axios.post(
            `${GEMINI_API_URL}?key=${apiKey}`,
            {
                contents: [{
                    parts: [{ text: systemPrompt }]
                }]
            },
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );

        if (response.data && response.data.candidates && response.data.candidates.length > 0) {
            const content = response.data.candidates[0].content;
            if (content && content.parts && content.parts.length > 0) {
                return content.parts[0].text;
            }
        }

        return "⚠️ Yanıt üretilemedi.";

    } catch (apiError) {
        console.error('Gemini API Failed:', apiError.response ? apiError.response.data : apiError.message);
        // Fallback logic
        return "⚠️ Üzgünüm, şu an bağlantımda bir sorun var. Lütfen daha sonra tekrar yazın veya salonu arayın.";
    }
}

// Alias for compatibility
const chat = async (message, sessionId, context = {}) => {
    // If context is passed as 3rd arg (from whatsappManager), use it.
    // generateAIResponse uses (message, context)
    // We can merge sessionId info into context if needed, but for now just map arguments.
    // whatsappManager calls: chat(message.body, message.from, salon) -> (msg, sessionId/userId, salonObj)

    // Careful: generateAIResponse expects context.salonName
    const salonName = context?.name || 'OdakManage';
    return {
        message: await generateAIResponse(message, { salonName })
    };
};

module.exports = { generateAIResponse, chat };
