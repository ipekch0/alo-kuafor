
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
    const systemPrompt = `SYSTEM: You are a friendly, energetic, and emoji-loving salon assistant. You reply ONLY in JSON.
DATE: ${new Date().toISOString().split('T')[0]} (YYYY-MM-DD)
CURRENT TIME: ${new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}

SERVICES:
${servicesText}

WORKING HOURS:
${hoursText}

INSTRUCTIONS:
- Be professional, helpful, and concise.
- Use ONLY ONE emoji at the very end of the message.
- Use Turkish language suitable for a boutique salon.
- ALWAYS use the 'check_availability' tool before confirming any time.
- If user asks for an appointment OUTSIDE working hours, politely decline and suggest open times.

FORMATS:
1. Chat: { "text": "Professional reply here 🌸" }
2. Check Availability: { "tool": "check_availability", "date": "YYYY-MM-DD", "time": "HH:mm", "serviceName": "Service Name (Optional)" }
3. Create Booking: { "tool": "create_appointment", "serviceName": "Service", "date": "YYYY-MM-DD", "time": "HH:mm", "phone": "${senderPhone}" }

EXAMPLES:
USER: Yarın 14:00 saç kesimi
AI: { "tool": "check_availability", "date": "2025-12-18", "time": "14:00", "serviceName": "Saç Kesimi" }

USER: ${message}
AI:`;

    try {
        // --- STEP 1: INITIAL CALL ---
        let response = await callGemini(apiKey, systemPrompt);
        let text = response.text.trim();

        // Ensure we handle markdown code blocks
        if (text.startsWith('```json')) text = text.replace('```json', '').replace('```', '');
        if (text.startsWith('```')) text = text.replace('```', '').replace('```', '');
        text = text.trim();

        console.log(`[AI RAW] ${text}`);

        // --- STEP 2: PARSE & EXECUTE ---
        if (text.startsWith('{')) {
            try {
                const toolCall = JSON.parse(text);

                // CASE 1: Simple Text Reply
                if (toolCall.text) return toolCall.text;

                // CASE 2: Tool Execution
                if (toolCall.tool) {
                    console.log(`AI Tool Call: ${toolCall.tool}`, toolCall);
                    let toolResult = "";

                    // HELPER: Check Availability Logic
                    const checkSlot = async (dateStr, timeStr, serviceDuration = 30) => {
                        const reqDate = new Date(`${dateStr}T${timeStr}:00`);
                        const dayName = reqDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

                        // A. Check Working Hours
                        if (parsedHours && parsedHours[dayName]) {
                            const dayHours = parsedHours[dayName];
                            if (!dayHours.isOpen) return "KAPALI (Bugün çalışmıyoruz).";

                            const [openH, openM] = dayHours.start.split(':').map(Number);
                            const [closeH, closeM] = dayHours.end.split(':').map(Number);
                            const [reqH, reqM] = timeStr.split(':').map(Number);

                            const reqMinutes = reqH * 60 + reqM;
                            const openMinutes = openH * 60 + openM;
                            const closeMinutes = closeH * 60 + closeM;

                            if (reqMinutes < openMinutes || (reqMinutes + serviceDuration) > closeMinutes) {
                                return `KAPALI (Çalışma Saatleri: ${dayHours.start} - ${dayHours.end}).`;
                            }
                        }

                        // B. Check Overlaps
                        const startDateTime = reqDate;
                        const endDateTime = new Date(startDateTime.getTime() + serviceDuration * 60000);

                        // Find any appointment that overlaps
                        const conflict = await prisma.appointment.findFirst({
                            where: {
                                salonId: salonId,
                                status: { not: 'cancelled' },
                                OR: [
                                    {
                                        // Existing starts within new
                                        dateTime: { gte: startDateTime, lt: endDateTime }
                                    },
                                    {
                                        // Existing ends within new (requires knowing existing duration, assuming 30 if not linked, but let's be simpler)
                                        // Better logic: New Start < Existing End AND New End > Existing Start
                                        // Since we store only Start Time, we must join Service to get duration
                                    }
                                ]
                            },
                            include: { service: true }
                        });

                        // Robust Overlap Check using fetched appointments
                        // We fetch ALL appointments for that day to be safe and check in memory (easier than complex Prisma date math)
                        const dayStart = new Date(`${dateStr}T00:00:00`);
                        const dayEnd = new Date(`${dateStr}T23:59:59`);

                        const dayAppointments = await prisma.appointment.findMany({
                            where: {
                                salonId: salonId,
                                status: { not: 'cancelled' },
                                dateTime: { gte: dayStart, lte: dayEnd }
                            },
                            include: { service: true }
                        });

                        const isOverlap = dayAppointments.some(apt => {
                            const aptStart = new Date(apt.dateTime);
                            const aptDuration = apt.service ? apt.service.duration : 30;
                            const aptEnd = new Date(aptStart.getTime() + aptDuration * 60000);

                            return (startDateTime < aptEnd && endDateTime > aptStart);
                        });

                        if (isOverlap) return "DOLU (Seçilen saatte başka randevu var).";

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
                            toolResult = "HATA: Hizmet bulunamadı.";
                        } else {
                            // Re-Check Availability before creating
                            const availability = await checkSlot(toolCall.date, toolCall.time, service.duration);

                            if (availability !== "MÜSAİT") {
                                toolResult = `BAŞARISIZ: ${availability} Lütfen başka saat seçin.`;
                            } else {
                                const professional = await prisma.professional.findFirst({ where: { salonId: salonId } });
                                if (!professional) {
                                    toolResult = "HATA: Salonda personel tanımlı değil.";
                                } else {
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
                                    toolResult = `SUCCESS: Randevu oluşturuldu! 📅 ${toolCall.date} ${toolCall.time}, Hizmet: ${service.name}.`;
                                }
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
