
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
    const historyText = context.history
        ? context.history.map(msg => `${msg.role === 'user' ? 'USER' : 'AI'}: ${msg.content}`).join('\n')
        : '';

    const systemPrompt = `SYSTEM: You are a smart salon receptionist for "${salonName}".
DATE: ${new Date().toISOString().split('T')[0]} (YYYY-MM-DD)
DAY: ${new Date().toLocaleDateString('tr-TR', { weekday: 'long' })}
TIME: ${new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}

SERVICES:
${servicesText}

WORKING HOURS:
${hoursText}

GOAL: Book appointments.
RULES:
1. **EXTRACT INFO:** User might give Name, Phone, Email in separate messages. CHECK HISTORY ("PREVIOUS MESSAGES") carefully.
   - If User says "My name is Ali", store it mentally.
   - If User later says "0555...", combine it with Name.
   - **IF YOU HAVE Name, Phone, Email and confirmed Time -> CALL 'create_appointment' IMMEDIATELY.**
2. **MISSING INFO:** If you have Time but missing Name/Email/Phone -> Ask specifically for missing parts.
3. **DATES:**
   - "Yarın" = Tomorrow (${new Date(Date.now() + 86400000).toISOString().split('T')[0]})
   - "Pazartesi" = Calculate date based on TODAY (${new Date().toLocaleDateString('tr-TR', { weekday: 'long' })}).
4. **AVAILABILITY:** Always check 'check_availability' before booking.

TOOLS:
- check_availability(date: "YYYY-MM-DD", time: "HH:mm", serviceName: "...")
- create_appointment(serviceName, date, time, customerName, customerPhone, customerEmail)

PREVIOUS MESSAGES:
${historyText}

EXAMPLES:
User: "Yarın 14:00 uygun mu?"
AI: { "tool": "check_availability", "date": "2025-12-20", "time": "14:00", ... }

User: "Evet" (History has Name: Ali, Phone: 0555...)
AI: { "text": "Mail adresinizi de yazar mısınız?" }

User: "ali@test.com"
AI: { "tool": "create_appointment", ..., "customerName": "Ali", "customerPhone": "0555...", "customerEmail": "ali@test.com" }
`;

    try {
        // --- STEP 1: INITIAL CALL ---
        let response = await callGemini(apiKey, systemPrompt + `\nUSER: ${message}\nAI:`);
        let text = response.text.trim();

        // CLEANUP
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        if (text.startsWith("{ '")) text = text.replace(/'/g, '"');

        console.log(`[AI RAW] ${text}`);

        // --- STEP 2: PARSE & EXECUTE ---
        let toolCall;
        try {
            const jsonMatch = text.match(/(\{[\s\S]*\})/);
            if (jsonMatch) text = jsonMatch[0];
            toolCall = JSON.parse(text);
        } catch (e) {
            const textMatch = text.match(/"text":\s*"([^"]*)"/);
            if (textMatch) return textMatch[1];
            return text.replace(/[{}]/g, '').replace(/"text":/g, '').replace(/"/g, '').trim();
        }

        if (toolCall.text) return toolCall.text;

        if (toolCall.tool) {
            console.log(`AI Tool Call: ${toolCall.tool}`, toolCall);
            let toolResult = "";

            // HELPER: Check Availability Logic
            const checkSlot = async (dateStr, timeStr, serviceDuration = 30) => {
                const reqDate = new Date(`${dateStr}T${timeStr}:00`);
                // Fix Day Name for proper Turkish mapping check (database keys might be english 'monday' or turkish 'pazartesi')
                // Assuming DB stores english keys from previous schema view (monday, tuesday...)
                const dayName = reqDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

                // Debug
                console.log(`Checking Slot: ${dateStr} ${timeStr} (${dayName})`);

                // Hours Check
                if (parsedHours) {
                    // Normalize keys to support both "Monday" and "monday"
                    const normalizedHours = {};
                    Object.keys(parsedHours).forEach(k => {
                        normalizedHours[k.toLowerCase()] = parsedHours[k];
                    });

                    let dayHours = normalizedHours[dayName];

                    if (!dayHours) {
                        // Fallback: If still not found, try TR key mapping if needed, or just return closed.
                        // But usually dayName is 'monday', 'tuesday'... 
                        return `KAPALI (Bilinmeyen gün: ${dayName})`;
                    }
                    if (!dayHours.isOpen) return `KAPALI (${dateStr} tarihinde kapalıyız).`;

                    const [openH, openM] = dayHours.start.split(':').map(Number);
                    const [closeH, closeM] = dayHours.end.split(':').map(Number);
                    const [reqH, reqM] = timeStr.split(':').map(Number);

                    const reqMin = reqH * 60 + reqM;
                    const openMin = openH * 60 + openM;
                    const closeMin = closeH * 60 + closeM;

                    if (reqMin < openMin || reqMin >= closeMin)
                        return `KAPALI (Mesai: ${dayHours.start} - ${dayHours.end})`;
                }

                const conflict = await prisma.appointment.findFirst({
                    where: { salonId: salonId, dateTime: reqDate, status: { not: 'cancelled' } }
                });
                if (conflict) return "DOLU";

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
                    const availability = await checkSlot(toolCall.date, toolCall.time, service.duration);
                    if (availability !== "MÜSAİT") {
                        toolResult = `BAŞARISIZ: ${availability}`;
                    } else {
                        const professional = await prisma.professional.findFirst({ where: { salonId: salonId } });
                        if (!professional) {
                            toolResult = "HATA: Personel yok.";
                        } else {
                            let customerName = toolCall.customerName || "Misafir";
                            let customerEmail = toolCall.customerEmail;
                            let targetPhone = toolCall.customerPhone || senderPhone;

                            console.log(`[AI DEBUG] Creating/Updating Customer: Name=${customerName}, Phone=${targetPhone}, Email=${customerEmail}`);

                            // Upsert Customer
                            let customer = await prisma.customer.findUnique({ where: { phone: targetPhone } });
                            if (customer) {
                                await prisma.customer.update({
                                    where: { id: customer.id },
                                    data: { name: customerName, email: customerEmail || customer.email }
                                });
                            } else {
                                customer = await prisma.customer.create({
                                    data: { name: customerName, phone: targetPhone, email: customerEmail }
                                });
                            }

                            const newAppt = await prisma.appointment.create({
                                data: {
                                    salonId, customerId: customer.id, serviceId: service.id, professionalId: professional.id,
                                    dateTime: new Date(`${toolCall.date}T${toolCall.time}:00`),
                                    totalPrice: service.price, status: 'confirmed',
                                    notes: `AI. Name: ${customerName} Phone: ${targetPhone}`
                                }
                            });
                            toolResult = `BAŞARILI: Randevu NO: ${newAppt.id}. Tarih: ${toolCall.date} ${toolCall.time}`;
                        }
                    }
                }
            }

            // --- STEP 3: FINAL CALL WITH RESULT ---
            const resultPrompt = `
You tried to perform: ${toolCall.tool}
Result: ${toolResult}

Now reply to the user naturally based on this result.
If Success: Confirm nicely ("Randevunuz oluşturuldu!").
If Fail: Explain nicely (e.g. "Maalesef kapalıyız" or "Dolu").
Use JSON: { "text": "..." }
`;
            const finalRes = await callGemini(apiKey, resultPrompt);
            let finalText = finalRes.text.trim();
            finalText = finalText.replace(/```json/g, '').replace(/```/g, '').trim();
            const finalJson = finalText.match(/(\{[\s\S]*\})/);
            if (finalJson) finalText = finalJson[0];
            try { return JSON.parse(finalText).text; } catch (e) {
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
