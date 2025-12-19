
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
                    }[day] || day;
                    // FIX: Check 'active' first, fallback to 'isOpen', default to true if both missing implies old format but existing? No, better be safe.
                    // If 'active' is undefined, and 'isOpen' is undefined, assume it's ACTIVE if the day key exists.
                    const isOpen = (hours.active !== undefined) ? hours.active : ((hours.isOpen !== undefined) ? hours.isOpen : true);
                    return `- ${trDay}: ${isOpen ? `${hours.start} - ${hours.end}` : 'KAPALI'}`;
                })
                .join('\n');
        } catch (e) {
            console.error('Error parsing working hours:', e);
        }
    }

    // 3. Construct System Prompt
    const historyText = context.history
        ? context.history.map(msg => `${msg.role === 'user' ? 'MÜŞTERİ' : 'ASİSTAN'}: ${msg.content}`).join('\n')
        : '';
    console.log("[AI DEBUG] History Text passed to System Prompt:\n", historyText);

    const systemPrompt = `SYSTEM: Sen "${salonName}" kuaförü için profesyonel ve nazik bir randevu asistanısın.
TARİH: ${new Date().toISOString().split('T')[0]} (YYYY-MM-DD)
GÜN: ${new Date().toLocaleDateString('tr-TR', { weekday: 'long' })}
SAAT: ${new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}

HİZMETLER:
${servicesText}

ÇALIŞMA SAATLERİ:
${hoursText}

GÖREV: Müşterilerle sohbet ederek randevu oluşturmak.

KURALLAR:
1. **İLETİŞİM DİLİ:** Her zaman Türkçe, kibar ve profesyonel konuş. Samimi ama saygılı ol.
2. **BİLGİ TOPLAMA (ÇOK ÖNEMLİ):** Randevu oluşturmadan önce müşteriden MUTLAKA şu bilgileri almalısın:
   - **Ad ve Soyad**
   - **Telefon Numarası** (Zaten mesajda geliyorsa teyit etmene gerek yok: ${senderPhone})
   - **E-posta Adresi**
   *Eğer bu bilgilerden biri eksikse, nazikçe iste.*
3. **MÜSAİTLİK KONTROLÜ:**
   - Müşteri bir tarih/saat istediğinde **ÖNCE** 'check_availability' aracını kullan.
   - Asla kafandan "Müsaitiz" deme. Aracı kullanıp sonucuna göre cevap ver.
4. **RANDEVU OLUŞTURMA:**
   - Müşteri tarih/saati onayladıysa VE Ad/Soyad/E-posta bilgileri tamsa 'create_appointment' aracını çağır.
   - **ÖNEMLİ:** 'create_appointment' yaparken **GEÇMİŞ (PREVIOUS) mesajlardaki 'check_availability' kısmında konuştuğunuz Tarih ve Saati** kullan.
   - **ASLA** o anki saati (Current Time) kullanma. Müşteri "Tamam" derse, anlaşılan saati onayla.
   - Bilgiler eksikse randevu oluşturma, önce bilgileri iste.

GEÇMİŞ MESAJLAR:
${historyText}

ÖRNEK AKIŞ (SADECE FORMAT İÇİNDİR, BURADAKİ "OMBRE" veya "14:00" GİBİ VERİLERİ ASLA KOPYALAMA! MÜŞTERİNİN YAZDIĞI GERÇEK VERİYİ KULLAN):
Müşteri: "Yarın 14:00 ombre için boş musunuz?"
ASİSTAN: { "tool": "check_availability", "date": "2025-12-20", "time": "14:00", "serviceName": "Ombre" }

(Sonuç MÜSAİT ise)
ASİSTAN: { "text": "Evet, yarın 14:00 için yerimiz var. Randevunuzu oluşturmak için adınızı, soyadınızı ve e-posta adresinizi rica edebilir miyim?" }

Müşteri: "Ayşe Yılmaz, ayse@test.com"
ASİSTAN: { "tool": "create_appointment", "serviceName": "Ombre", "date": "2025-12-20", "time": "14:00", "customerName": "Ayşe Yılmaz", "customerEmail": "ayse@test.com", "customerPhone": "${senderPhone}" }
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
                if (!dateStr || !timeStr) {
                    console.log(`[AI DEBUG] checkSlot called with missing args: date=${dateStr}, time=${timeStr}`);
                    return "Tarih veya saat bilgisi eksik. Lütfen kullanıcıdan tarih ve saat isteyin.";
                }

                let reqDate;
                try {
                    reqDate = new Date(`${dateStr}T${timeStr}:00`);
                    if (isNaN(reqDate.getTime())) throw new Error("Invalid Date");
                } catch (e) {
                    return `Tarih/Saat formatı hatalı (${dateStr} ${timeStr}). Doğru formatta isteyin.`;
                }

                // Fix Day Name for proper Turkish mapping check (database keys might be english 'monday' or turkish 'pazartesi')
                // Assuming DB stores english keys from previous schema view (monday, tuesday...)
                const dayName = reqDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

                // Debug
                console.log(`[AI DEBUG] Checking Slot: ${dateStr} ${timeStr} (${dayName})`);

                // Hours Check
                let hoursToCheck = parsedHours;
                if (!hoursToCheck) {
                    // Default to 09:00 - 19:00 every day if no hours defined
                    const defaultHours = { start: "09:00", end: "19:00", isOpen: true, active: true };
                    hoursToCheck = {
                        monday: defaultHours, tuesday: defaultHours, wednesday: defaultHours,
                        thursday: defaultHours, friday: defaultHours, saturday: defaultHours, sunday: defaultHours
                    };
                }

                if (hoursToCheck) {
                    // Normalize keys to support both "Monday" and "monday"
                    // AND support Turkish keys "Pazartesi" etc.
                    const normalizedHours = {};
                    Object.keys(hoursToCheck).forEach(k => {
                        normalizedHours[k.toLowerCase()] = hoursToCheck[k];
                    });

                    // English to Turkish Map
                    const trMap = {
                        'monday': 'pazartesi', 'tuesday': 'salı', 'wednesday': 'çarşamba',
                        'thursday': 'perşembe', 'friday': 'cuma', 'saturday': 'cumartesi', 'sunday': 'pazar'
                    };

                    const trDayName = trMap[dayName] || '';

                    // Try exact match, english match, or turkish match
                    let dayHours = normalizedHours[dayName] || normalizedHours[trDayName];

                    // Log for debugging (will show in Render logs)
                    console.log(`[AI DEBUG] Date: ${dateStr}, Day: ${dayName} / ${trDayName}. Available Keys: ${Object.keys(normalizedHours).join(', ')}`);

                    if (!dayHours) {
                        return `KAPALI (DEBUG: Day=${dayName}/${trDayName} NOT FOUND in keys: ${Object.keys(normalizedHours).join(',')})`;
                    }
                    const isDayOpen = dayHours.active !== undefined ? dayHours.active : dayHours.isOpen;
                    if (!isDayOpen) {
                        return `KAPALI (DEBUG: Day=${dayName}, Active=${dayHours.active}, IsOpen=${dayHours.isOpen}, Raw=${JSON.stringify(dayHours)})`;
                    }

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

                // --- MEMORY: CACHE SUCCESSFUL CHECK ---
                if (toolResult === "MÜSAİT") {
                    global.aiSessionMemory = global.aiSessionMemory || new Map();
                    global.aiSessionMemory.set(senderPhone, {
                        date: toolCall.date,
                        time: toolCall.time,
                        serviceName: toolCall.serviceName,
                        timestamp: Date.now()
                    });
                    console.log(`[AI MEMORY] Saved slot for ${senderPhone}:`, global.aiSessionMemory.get(senderPhone));
                }
            }

            if (toolCall.tool === 'create_appointment') {
                let targetDate = toolCall.date;
                let targetTime = toolCall.time;
                let serviceName = toolCall.serviceName || "";

                const service = services.find(s => s.name.toLowerCase().includes(serviceName.toLowerCase()));
                if (!service) {
                    toolResult = "HATA: Hizmet bulunamadı.";
                } else {
                    let availability = await checkSlot(targetDate, targetTime, service.duration);

                    // --- MEMORY: RECOVER FROM HALLUCINATION ---
                    if (availability !== "MÜSAİT") {
                        console.log(`[AI MEMORY] Direct creation failed (${availability}). Checking memory...`);
                        global.aiSessionMemory = global.aiSessionMemory || new Map();
                        const cached = global.aiSessionMemory.get(senderPhone);

                        if (cached && (Date.now() - cached.timestamp < 3600000)) {
                            console.log(`[AI MEMORY] Found cached slot:`, cached);
                            // Override
                            targetDate = cached.date;
                            targetTime = cached.time;
                            // Re-check with cached values
                            availability = await checkSlot(targetDate, targetTime, service.duration);
                            console.log(`[AI MEMORY] Re-check result: ${availability}`);
                        }
                    }

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
                                    dateTime: new Date(`${targetDate}T${targetTime}:00`),
                                    totalPrice: service.price, status: 'confirmed',
                                    notes: `AI. Name: ${customerName} Phone: ${targetPhone}`
                                }
                            });
                            // Remove from memory
                            if (global.aiSessionMemory) global.aiSessionMemory.delete(senderPhone);

                            toolResult = `BAŞARILI: Randevu NO: ${newAppt.id}. Tarih: ${targetDate} ${targetTime}`;
                        }
                    }
                }
            }

            // --- STEP 3: FINAL CALL WITH RESULT ---
            // RE-INJECT SYSTEM PROMPT TO MAINTAIN PERSONA
            const resultPrompt = `
${systemPrompt}

DURUM GÜNCELLEMESİ:
Önceki Adım: '${toolCall.tool}' aracı çalıştırıldı.
Aracın Sonucu: ${toolResult}

GÖREV:
Bu sonuca göre müşteriye yanıt ver.
1. Sonuç 'BAŞARISIZ' veya 'KAPALI' ise: Üzgünüm de ve nedenini açıkla.
2. Sonuç 'BAŞARILI' ise: Randevu detaylarını onayla.
3. Sonuçta "Tarih/Saat eksik" diyorsa: Müşteriden eksik bilgileri nazikçe iste.

JSON Formatı Kullan: { "text": "..." }
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
