
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
    const systemPrompt = `
    Sen '${salonName}' için çalışan profesyonel bir randevu asistanısın.
    Görevin: Müşterilere bilgi vermek ve RANDEVU ALMAK.

    SALON HİZMETLERİ:
    ${servicesText}

    KURALLAR:
    - Asla yalan söyleme.
    - Randevu talep edilirse ÖNCE müsaitlik kontrolü yap.
    - Müsaitse ve müşteri onaylarsa randevuyu oluştur.
    - Tarih formatı: YYYY-MM-DD HH:mm (Örn: 2025-12-16 14:30)
    - Bugünün Tarihi: ${new Date().toISOString().split('T')[0]} (${new Date().toLocaleDateString('tr-TR', { weekday: 'long' })})

    ARAÇLAR (TOOLS):
    Eğer bir işlem yapman gerekiyorsa, cevabını SADECE aşağıdaki JSON formatında ver (yorum ekleme):

    1. Müsaitlik Kontrolü:
    { "tool": "check_availability", "date": "YYYY-MM-DD", "time": "HH:mm" }

    2. Randevu Oluşturma (Sadece müşteri net onay verirse):
    { "tool": "create_appointment", "serviceName": "Hizmet Adı Tam Eşleşme", "date": "YYYY-MM-DD", "time": "HH:mm", "phone": "${senderPhone}" }

    Eğer işlem gerekmiyorsa, sadece normal Türkçe cevap ver.
    Müşteri Mesajı: "${message}"
    `;

    try {
        // --- STEP 1: INITIAL CALL ---
        let response = await callGemini(apiKey, systemPrompt);
        let text = response.text;

        // --- STEP 2: TOOL EXECUTION LOOP ---
        // Check if response is JSON (Tool Call)
        if (text.trim().startsWith('{') && text.trim().includes('"tool"')) {
            try {
                const toolCall = JSON.parse(text.match(/\{[\s\S]*\}/)[0]); // Extract JSON robustly
                console.log(`AI Tool Call: ${toolCall.tool}`, toolCall);

                let toolResult = "";

                if (toolCall.tool === 'check_availability') {
                    // MOCK Implementation for now - Real implementation needs simple date clash check
                    // For MVP: Check if any appointment exists at that exact time for the salon
                    // We assume 1 professional for simplicity in this auto-response mode
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
                    // Find service
                    const service = services.find(s => s.name.toLowerCase().includes(toolCall.serviceName.toLowerCase()));
                    if (!service) {
                        toolResult = "HATA: Hizmet bulunamadı.";
                    } else {
                        // Create Database Record
                        // Retrieve or create customer
                        let customer = await prisma.customer.findUnique({ where: { phone: senderPhone } });
                        if (!customer) {
                            customer = await prisma.customer.create({
                                data: { name: "WhatsApp Müşterisi", phone: senderPhone }
                            });
                        }

                        // Need a professional ID. Pick the first one or default one.
                        // Assuming salon has at least one professional.
                        const professional = await prisma.professional.findFirst({ where: { salonId: salonId } });
                        if (!professional) {
                            toolResult = "HATA: Salonda personel tanımlı değil.";
                        } else {
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
                            toolResult = `BAŞARILI: Randevu oluşturuldu. Tarih: ${toolCall.date} ${toolCall.time}, Hizmet: ${service.name}`;
                        }
                    }
                }

                // --- STEP 3: FINAL CALL WITH RESULT ---
                const followUpPrompt = `${systemPrompt}\n\nSİSTEM ÇIKTISI (TOOL RESULT): ${toolResult}\n\nBu bilgiye göre müşteriye son cevabı ver:`;
                const finalRes = await callGemini(apiKey, followUpPrompt);
                return finalRes.text;

            } catch (jsonErr) {
                console.error('Tool parsing error:', jsonErr);
                return "İşleminizi yaparken bir hata oluştu, ancak size nasıl yardımcı olabilirim?";
            }
        }

        return text; // No tool called, return original text



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
