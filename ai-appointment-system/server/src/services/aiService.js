
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Initialize Gemini
// Initialize Gemini
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemma-3-4b-it:generateContent";

async function generateAIResponse(message, context = {}) {
    // HARDCODED KEY AS FALLBACK FOR IMMEDIATE RENDER DEPLOYMENT FIX (New Key 17 Dec)
    const apiKey = "AIzaSyAKuoa_PM9JddJTwULp3NRhm6wOgR_WctQ";

    // --- DEBUG LOGGING ---
    console.log(`[AI DEBUG] Generating response for: "${message}"`);
    console.log(`[AI DEBUG] API Key Present: ${!!apiKey} (Length: ${apiKey ? apiKey.length : 0})`);

    if (!apiKey) {
        console.error('[AI DEBUG] GEMINI_API_KEY is missing in process.env');
        return "Sistem şu an Yapay Zeka anahtarı eksik olduğu için tam kapasite çalışamıyor.";
    }

    const { salonName, services, salonId, senderPhone, workingHours } = context;

    // 1. Format Services for Prompt
    let servicesText = "Henüz hizmet bilgisi girilmemiş.";
    if (services && services.length > 0) {
        servicesText = services.map(s => `- ${s.name} (${s.duration} dk) - ${s.price} TL`).join('\n');
    }

    // 2. Format Working Hours for Prompt
    let hoursText = "Çalışma saatleri bilinmiyor (Varsayılan: 09:00 - 19:00).";
    let parsedHours = null;
    if (workingHours) {
        try {
            parsedHours = typeof workingHours === 'string' ? JSON.parse(workingHours) : workingHours;
            hoursText = Object.entries(parsedHours)
                .map(([day, hours]) => {
                    const trDay = {
                        monday: 'Pazartesi', tuesday: 'Salı', wednesday: 'Çarşamba',
                        thursday: 'Perşembe', friday: 'Cuma', saturday: 'Cumartesi', sunday: 'Pazar'
                    }[day];
                    return `${trDay}: ${hours.isOpen ? `${hours.start} - ${hours.end}` : 'KAPALI'}`;
                })
                .join('\n');
        } catch (e) {
            console.error('Error parsing working hours:', e);
        }
    }

    // 3. Construct System Prompt
    const systemPrompt = `SYSTEM: You are a warm, sincere, and helpful salon assistant for "${salonName}".
DATE: ${new Date().toISOString().split('T')[0]} (YYYY-MM-DD)
CURRENT TIME: ${new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}

SERVICES:
${servicesText}

WORKING HOURS:
${hoursText}

YOUR RELATIONS & GOAL:
- You are NOT a robot, you are a "friendly assistant". Be sincere, use a natural Turkish tone (samimi ama saygılı).
- YOUR MAIN GOAL is to get the user to book an appointment.
- After answering a question, ALWAYS ask a closing question like "Size ne zaman randevu oluşturalım?" or "Hangi gün müsaitsiniz?".
- DO NOT be dry. Use emojis occasionally (🌸, 😊, ✨).

INSTRUCTIONS:
1. RESPONSE FORMAT: You must return ONLY valid JSON.
2. JSON FORMAT: { "text": "Your message here" } OR { "tool": "...", ... }
3. CRITICAL: Use DOUBLE QUOTES (") for all JSON keys and strings. Do NOT use single quotes.
4. Do not include "AI:" or "JSON:" prefixes. just the raw JSON object.

TOOLS:
- Check Availability: { "tool": "check_availability", "date": "YYYY-MM-DD", "time": "HH:mm", "serviceName": "Service Name" }
- Create Booking: { "tool": "create_appointment", "serviceName": "Service Name", "date": "YYYY-MM-DD", "time": "HH:mm", "phone": "${senderPhone}" }

EXAMPLES:
User: "Ombre fiyatı ne kadar?"
AI: { "text": "Ombre işlemimiz 1000 TL ve yaklaşık 30 dakika sürüyor. ✨ Size en uygun gün hangisi, hemen yardımcı olayım? 😊" }

User: "Yarın 14:00e randevu ver"
AI: { "tool": "check_availability", "date": "2025-12-19", "time": "14:00", "serviceName": "Genel" }
`;

    try {
        // --- STEP 1: INITIAL CALL ---
        let response = await callGemini(apiKey, systemPrompt + `\nUSER: ${message}\nAI:`);
        let text = response.text.trim();

        // CLEANUP: Handle Markdown & Common JSON Errors
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        // Fix single quotes if they exist (simple heuristic)
        if (text.startsWith("{ '")) {
            text = text.replace(/'/g, '"'); // Risky but better than raw text for simple keys
        }

        console.log(`[AI RAW] ${text}`);

        // --- STEP 2: PARSE & EXECUTE ---
        let toolCall;
        try {
            // Find JSON object boundaries to ignore trailing text
            const jsonMatch = text.match(/(\{[\s\S]*\})/);
            if (jsonMatch) text = jsonMatch[0];

            toolCall = JSON.parse(text);
        } catch (e) {
            console.error("JSON PARSE ERROR:", e);
            // Fallback: If it looks like text, return it wrapped
            return text.replace(/[{}]/g, '').replace(/"text":/g, '').replace(/"/g, '').trim();
        }

        // CASE 1: Simple Text Reply
        if (toolCall.text) return toolCall.text;

        // CASE 2: Tool Execution
        if (toolCall.tool) {
            console.log(`AI Tool Call: ${toolCall.tool}`, toolCall);
            let toolResult = "";

            // HELPER: Check Availability Logic (Same as before)
            const checkSlot = async (dateStr, timeStr, serviceDuration = 30) => {
                const reqDate = new Date(`${dateStr}T${timeStr}:00`);
                const dayName = reqDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                if (parsedHours && parsedHours[dayName]) {
                    if (!parsedHours[dayName].isOpen) return "KAPALI (O gün çalışmıyoruz).";
                    // Simple hour check
                    const [openH] = parsedHours[dayName].start.split(':');
                    const [closeH] = parsedHours[dayName].end.split(':');
                    const reqH = parseInt(timeStr.split(':')[0]);
                    if (reqH < parseInt(openH) || reqH >= parseInt(closeH)) return "KAPALI (Mesai saatleri dışı).";
                }

                // Check overlapping appointments
                const conflict = await prisma.appointment.findFirst({
                    where: {
                        salonId: salonId,
                        dateTime: reqDate,
                        status: { not: 'cancelled' }
                    }
                });
                if (conflict) return "DOLU (O saatte randevu var).";

                return "MÜSAİT";
            };

            if (toolCall.tool === 'check_availability') {
                let duration = 30;
                if (toolCall.serviceName) {
                    const s = services.find(srv => srv.name.toLowerCase().includes(toolCall.serviceName.toLowerCase()));
                    if (s) duration = s.duration;
                }
                toolResult = await checkSlot(toolCall.date, toolCall.time, duration);
            }

            if (toolCall.tool === 'create_appointment') {
                const service = services.find(s => s.name.toLowerCase().includes(toolCall.serviceName.toLowerCase()));
                if (!service) {
                    toolResult = "HATA: Hizmet bulunamadı. Lütfen tam hizmet adını belirtin.";
                } else {
                    const availability = await checkSlot(toolCall.date, toolCall.time, service.duration);
                    if (availability !== "MÜSAİT") {
                        toolResult = `BAŞARISIZ: ${availability} Başka bir saat dener misiniz?`;
                    } else {
                        // CREATE
                        const professional = await prisma.professional.findFirst({ where: { salonId: salonId } });
                        if (!professional) return "HATA: Personel bulunamadı.";

                        let customer = await prisma.customer.findUnique({ where: { phone: senderPhone } });
                        if (!customer) customer = await prisma.customer.create({ data: { name: "WhatsApp Misafiri", phone: senderPhone } });

                        await prisma.appointment.create({
                            data: {
                                salonId, customerId: customer.id, serviceId: service.id, professionalId: professional.id,
                                dateTime: new Date(`${toolCall.date}T${toolCall.time}:00`),
                                totalPrice: service.price, status: 'confirmed', notes: 'AI Booking'
                            }
                        });
                        toolResult = "BAŞARILI: Randevu oluşturuldu! Müşteriye onayı bildir.";
                    }
                }
            }

            // --- STEP 3: FINAL CALL WITH RESULT ---
            // We ask the AI to generate the final friendly response based on the tool result.
            const resultPrompt = `
You tried to perform: ${toolCall.tool}
Result: ${toolResult}

Now reply to the user naturally based on this result.
If Success: Confirm nicely.
If Fail: Explain nicely and ask for another time.
Use JSON: { "text": "..." }
`;
            const finalRes = await callGemini(apiKey, resultPrompt);
            let finalText = finalRes.text.trim();
            // Clean again
            finalText = finalText.replace(/```json/g, '').replace(/```/g, '').trim();
            const finalJson = finalText.match(/(\{[\s\S]*\})/);
            if (finalJson) finalText = finalJson[0];

            try { return JSON.parse(finalText).text; } catch (e) {
                // Fallback extraction
                return finalText.replace(/[{}]/g, '').replace(/"text":/g, '').replace(/"/g, '').trim();
            }
        }

    } catch (apiError) {
        console.error('AI Processing Error:', apiError);
        return "Şu an bağlantımda küçük bir sorun var, ama mesajınızı aldım! 🌸";
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
