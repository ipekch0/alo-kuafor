const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'no_key');
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

async function generateAIResponse(message, context = {}) {
    if (!process.env.GEMINI_API_KEY) {
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
    - Tarzın: Emoji kullanabilirsin 💇‍♀️✨. Samimi ama saygılı ol. Çok uzun paragraflar yazma.

    Müşteri Mesajı: "${message}"
    Cevabın:
    `;

    try {
        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        return response.text();
    } catch (apiError) {
        console.error('Gemini API Failed:', apiError.message);
        // Fallback logic
        return "⚠️ Üzgünüm, şu an bağlantımda bir sorun var. Lütfen daha sonra tekrar yazın veya salonu arayın.";
    }
}

module.exports = { generateAIResponse };
