const axios = require('axios');
const prisma = require('../lib/prisma');
const nlpEngine = require('./nlpEngine');

function setPrisma(p) {
    prisma = p;
}

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

async function generateAIResponse(message, context = {}) {
    // 0. Extract Context
    const { salonName, services, salonId, senderPhone, workingHours, address } = context;
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    console.log(`[AI DEBUG] Processing message: "${message}"`);

    // --- STEP 1: TRY LOCAL NLP ENGINE FIRST ---
    try {
        const nlpResult = await nlpEngine.process(message, { services, address, workingHours });
        console.log('[AI DEBUG] Local NLP Result:', nlpResult);

        if (!nlpResult.fallback) {
            // Direct text response found (Greetings, Prices, Location etc.)
            if (nlpResult.text) return nlpResult.text;

            // Intent found but needs logic (Check/Create Appointment)
            // If we have an API Key, we'll still let Gemini do the complex JSON formatting for tools
            // but if we DON'T have an API key, we give a better local response.
            if (!apiKey) {
                if (nlpResult.intent === 'appointment.check' || nlpResult.intent === 'appointment.create') {
                    return "Randevu talebinizi aldım! Ancak şu an tam kapasite çalışamıyorum. Lütfen dükkanımızı doğrudan arayabilir misiniz? Veya isminizi bırakın, biz size dönelim.";
                }
            }
        }
    } catch (nlpError) {
        console.error('[NLP ERROR]', nlpError);
    }

    // --- STEP 2: FALLBACK TO GEMINI (IF KEY EXISTS) ---
    if (!apiKey) {
        return "Merhaba! Şu an size sadece temel konularda yardımcı olabilirim. Randevu için lütfen dükkanımızı arayın veya doğrudan buradan isminizi ve istediğiniz saati yazın, arkadaşlarım size dönecektir. 🌸";
    }

    // Format Data for Prompt
    let servicesText = (services && services.length > 0)
        ? services.map(s => `- ${s.name} (${s.duration} dk) - ${s.price} TL`).join('\n')
        : "Hizmet bilgisi girilmemiş.";

    let hoursText = "09:00 - 19:00";
    if (workingHours) {
        try {
            const parsed = typeof workingHours === 'string' ? JSON.parse(workingHours) : workingHours;
            hoursText = Object.entries(parsed).map(([d, h]) => `${d}: ${h.active ? `${h.start}-${h.end}` : 'KAPALI'}`).join(', ');
        } catch (e) { }
    }

    const historyText = context.history
        ? context.history.map(msg => `${msg.role === 'user' ? 'MÜŞTERİ' : 'ASİSTAN'}: ${msg.content}`).join('\n')
        : '';

    const systemPrompt = `SYSTEM: Sen "${salonName}" kuaförü asistanısın.
TARİH: ${new Date().toISOString().split('T')[0]}
HİZMETLER:\n${servicesText}
SAATLER: ${hoursText}

GÖREV: Randevu için 'check_availability' ve 'create_appointment' araçlarını JSON kullanarak çağır. İsim/zaman eksikse iste.
GEÇMİŞ:\n${historyText}`;

    try {
        const contents = [
            { role: 'user', parts: [{ text: systemPrompt }] },
            { role: 'model', parts: [{ text: "Hazırım." }] }
        ];
        if (context.history) {
            context.history.forEach(m => contents.push({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] }));
        }
        contents.push({ role: 'user', parts: [{ text: message }] });

        const geminiRes = await axios.post(`${GEMINI_API_URL}?key=${apiKey}`, { contents });
        let text = geminiRes.data.candidates[0].content.parts[0].text.trim();

        // Clean JSON
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        // Handle direct text vs tool call
        let data;
        try {
            const jsonPart = text.match(/\{[\s\S]*\}/);
            data = JSON.parse(jsonPart ? jsonPart[0] : text);
        } catch (e) { return text; }

        if (data.text) return data.text;

        if (data.tool) {
            let result = "";
            const checkSlot = async (d, t) => {
                const appt = await prisma.appointment.findFirst({
                    where: { salonId, dateTime: new Date(`${d}T${t}:00`), status: { not: 'cancelled' } }
                });
                return appt ? "DOLU" : "MÜSAİT";
            };

            if (data.tool === 'check_availability') result = await checkSlot(data.date, data.time);
            if (data.tool === 'create_appointment') {
                const srv = services.find(s => s.name.toLowerCase().includes((data.serviceName || "").toLowerCase()));
                if (!srv) result = "HİZMET BULUNAMADI";
                else {
                    const avail = await checkSlot(data.date, data.time);
                    if (avail === "DOLU") result = "DOLU";
                    else {
                        const prof = await prisma.professional.findFirst({ where: { salonId } });
                        let cust = await prisma.customer.findUnique({ where: { phone: senderPhone } });
                        if (!cust) cust = await prisma.customer.create({ data: { name: data.customerName || "Misafir", phone: senderPhone } });

                        const newA = await prisma.appointment.create({
                            data: {
                                salonId, customerId: cust.id, serviceId: srv.id, professionalId: prof.id,
                                dateTime: new Date(`${data.date}T${data.time}:00`), totalPrice: srv.price, status: 'confirmed'
                            }
                        });
                        result = `BAŞARILI: No ${newA.id}`;
                    }
                }
            }

            // Final response with result
            contents.push({ role: 'model', parts: [{ text: JSON.stringify(data) }] });
            contents.push({ role: 'user', parts: [{ text: `SONUÇ: ${result}. Müşteriye cevap ver.` }] });
            const finalRes = await axios.post(`${GEMINI_API_URL}?key=${apiKey}`, { contents });
            return finalRes.data.candidates[0].content.parts[0].text;
        }
        return text;

    } catch (err) {
        console.error('Gemini Error:', err.response?.data || err.message);
        return "Şu an biraz yoğunum, ama mesajınızı aldım! 🌸";
    }
}

const chat = async (message, sessionId, context = {}) => {
    return {
        message: await generateAIResponse(message, { ...context, senderPhone: sessionId })
    };
};

module.exports = { generateAIResponse, chat, setPrisma };
