
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Initialize Gemini
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemma-3-1b-it:generateContent";

async function generateAIResponse(message, context = {}) {
    // HARDCODED KEY AS FALLBACK FOR IMMEDIATE RENDER DEPLOYMENT FIX (New Key 17 Dec)
    const apiKey = "AIzaSyClNuFBQHmbWI_TTT5stSdZxflK0XpuAHo";

    // --- DEBUG LOGGING ---
    console.log(`[AI DEBUG] Generating response for: "${message}"`);
    console.log(`[AI DEBUG] API Key Present: ${!!apiKey} (Length: ${apiKey ? apiKey.length : 0})`);

    if (!apiKey) {
        console.error('[AI DEBUG] GEMINI_API_KEY is missing in process.env');
        return "Sistem şu an Yapay Zeka anahtarı eksik olduğu için tam kapasite çalışamıyor.";
    }

    const { salonName, services, salonId, senderPhone } = context;

    // 1. Format Services for Prompt
    let servicesText = "Henüz hizmet bilgisi girilmemiş.";
    if (services && services.length > 0) {
        servicesText = services.map(s => `- ${s.name} (${s.duration} dk) - ${s.price} TL`).join('\n');
    }

    // 2. Construct System Prompt with Tool Definitions
    // 2. Construct System Prompt with Tool Definitions
    // 2. Construct System Prompt with Tool Definitions
    const systemPrompt = `SYSTEM: You are a friendly, energetic, and emoji-loving salon assistant. You reply ONLY in JSON.
DATE: ${new Date().toISOString().split('T')[0]}
SERVICES:
${servicesText}

INSTRUCTIONS:
- Be professional, helpful, and concise.
- Use ONLY ONE emoji at the very end of the message.
- Use Turkish language suitable for a boutique salon.
- Text fields MUST contain the actual conversation.

FORMATS:
1. Chat: { "text": "Professional reply here 🌸" }
2. Check Availability: { "tool": "check_availability", "date": "YYYY-MM-DD", "time": "HH:mm" }
3. Create Booking: { "tool": "create_appointment", "serviceName": "Service", "date": "YYYY-MM-DD", "time": "HH:mm", "phone": "${senderPhone}" }

EXAMPLES:
USER: Merhaba
AI: { "text": "Merhabalar! Size nasıl yardımcı olabilirim? Saç bakımı mı yoksa kesim mi düşünüyorsunuz? ✨" }

USER: Fiyatlar?
AI: { "text": "Tabii ki! 💖 Harika hizmetlerimiz var:\nSaç kesimi 150 TL ✨\nFön 50 TL 💨\nSize hangisi uyar?" }

USER: Yarın 14:00 saç kesimi
AI: { "tool": "check_availability", "date": "2025-12-18", "time": "14:00" }

USER: ${message}
AI:`;

    try {
        // --- STEP 1: INITIAL CALL ---
        let response = await callGemini(apiKey, systemPrompt);
        let text = response.text.trim();

        // Ensure we handle markdown code blocks if the model adds them
        if (text.startsWith('```json')) text = text.replace('```json', '').replace('```', '');
        if (text.startsWith('```')) text = text.replace('```', '').replace('```', '');
        text = text.trim();

        console.log(`[AI RAW] ${text}`);

        // --- STEP 2: PARSE & EXECUTE ---
        if (text.startsWith('{')) {
            try {
                const toolCall = JSON.parse(text);

                // CASE 1: Simple Text Reply
                if (toolCall.text) {
                    return toolCall.text;
                }

                // CASE 2: Tool Execution
                if (toolCall.tool) {
                    console.log(`AI Tool Call: ${toolCall.tool}`, toolCall);
                    let toolResult = "";

                    if (toolCall.tool === 'check_availability') {
                        // MOCK Implementation
                        const existing = await prisma.appointment.findFirst({
                            where: {
                                salonId: salonId,
                                dateTime: new Date(`${toolCall.date}T${toolCall.time}:00`),
                                status: { not: 'cancelled' }
                            }
                        });
                        toolResult = existing ? "DOLU" : "MÜSAİT";
                    }

                    if (toolCall.tool === 'create_appointment') {
                        const service = services.find(s => s.name.toLowerCase().includes(toolCall.serviceName.toLowerCase()));
                        if (!service) {
                            toolResult = "HATA: Hizmet bulunamadı.";
                        } else {
                            // Professional Assignment
                            const professional = await prisma.professional.findFirst({ where: { salonId: salonId } });
                            if (!professional) {
                                toolResult = "HATA: Salonda personel tanımlı değil.";
                            } else {
                                // Create Customer if not exists (Double Check)
                                let customer = await prisma.customer.findUnique({ where: { phone: senderPhone } });
                                if (!customer) {
                                    customer = await prisma.customer.create({
                                        data: { name: "WhatsApp Müşterisi", phone: senderPhone }
                                    });
                                }

                                const aptDate = new Date(`${toolCall.date}T${toolCall.time}:00`);
                                await prisma.appointment.create({
                                    data: {
                                        salonId: salonId,
                                        customerId: customer.id,
                                        serviceId: service.id,
                                        professionalId: professional.id,
                                        dateTime: aptDate,
                                        totalPrice: service.price,
                                        status: 'confirmed',
                                        notes: 'WhatsApp Yapay Zeka tarafından oluşturuldu.'
                                    }
                                });
                                toolResult = `SUCCESS: Randevu başarıyla oluşturuldu! 🎉 Tarih: ${toolCall.date} Saat: ${toolCall.time}, Hizmet: ${service.name}. Müşteriye bunu harika bir dille müjdele! 🥳`;
                            }
                        }
                    }

                    // --- STEP 3: FINAL CALL WITH RESULT ---
                    const followUpPrompt = `${systemPrompt}\nAI: ${text}\nSYSTEM_RESULT: ${toolResult}\n\nGenerate final response for user (JSON { "text": "..." }):`;
                    const finalRes = await callGemini(apiKey, followUpPrompt);
                    let finalText = finalRes.text.trim();

                    if (finalText.startsWith('```json')) finalText = finalText.replace('```json', '').replace('```', '');
                    if (finalText.startsWith('{')) {
                        try { return JSON.parse(finalText).text; } catch (e) { return finalText; }
                    }
                    return finalText;
                }

            } catch (jsonErr) {
                console.error('Tool parsing error:', jsonErr);
                return "Anlaşılamadı, tekrar eder misiniz?";
            }
        }

        // Fallback if not JSON
        return text;



        // ... (rest of logic) ...

    } catch (apiError) {
        console.error('--- GEMINI API FAILURE ---');
        console.error('Message:', apiError.message);
        if (apiError.response) {
            console.error('Status:', apiError.response.status);
            console.error('Data:', JSON.stringify(apiError.response.data, null, 2));
        } else {
            console.error('Stack:', apiError.stack);
        }
        return `⚠️ Üzgünüm, şu an bağlantımda bir sorun var. (Hata: ${apiError.message})`;
    }
}

async function callGemini(apiKey, prompt) {
    const response = await axios.post(
        `${GEMINI_API_URL}?key=${apiKey}`,
        { contents: [{ parts: [{ text: prompt }] }] },
        { headers: { 'Content-Type': 'application/json' } }
    );
    if (response.data?.candidates?.[0]?.content?.parts?.[0]) {
        return { text: response.data.candidates[0].content.parts[0].text };
    }
    throw new Error("No response candidates");
}

const chat = async (message, sessionId, context = {}) => {
    // context needs: name, id, services (array)
    const salonName = context?.name || 'OdakManage';
    const services = context?.services || [];
    const salonId = context?.id;
    const senderPhone = sessionId; // Using sessionId as phone for now, assuming format '90555...'

    return {
        message: await generateAIResponse(message, { salonName, services, salonId, senderPhone })
    };
};

module.exports = { generateAIResponse, chat };
