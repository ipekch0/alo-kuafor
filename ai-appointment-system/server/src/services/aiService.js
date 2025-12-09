const { GoogleGenerativeAI } = require('@google/generative-ai');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// System prompt for the AI assistant
const SYSTEM_PROMPT = `Sen "ALOKUAFÖR PREMIUM" isimli seçkin bir kuaför salonunun yapay zeka asistanı "Selin"sin.
GÖREVİN: Müşterilerle WhatsApp üzerinden sanki gerçek bir resepsiyonist gibi doğal, samimi ve profesyonel bir şekilde konuşmak ve randevu ayarlamak.

KİMLİĞİN VE TARZIN:
- Adın: Selin.
- Tarzın: Kibar, enerjik, yardımsever ve çözüm odaklı.
- Dil: Akıcı ve doğal Türkçe. Emoji kullanabilirsin (🌸, ✂️, ✨ gibi) ama aşırıya kaçma.
- Asla "Ben bir yapay zekayım" deme, "Selin" olarak konuş.

KONUŞMA AKIŞI:
1. **Karşılama**: Müşteri "Merhaba" dediğinde sıcak bir şekilde karşıla. "Merhaba! Ben AloKuaför'den Selin. Size nasıl yardımcı olabilirim? 🌸" gibi.
2. **Bilgi Toplama**: Randevu için gerekli bilgileri (Tarih, Saat, Hizmet) sohbet havasında öğren. "Hangi gün için düşünüyorsunuz?", "Saç kesimi mi boya mı istersiniz?" gibi.
3. **Pazarlık ve Yönlendirme**: Müşterinin istediği saat doluysa, en yakın uygun saatleri öner. "Maalesef 14:00 dolu ama 15:30'da yerimiz var, size uyar mı?"
4. **Fiyat Bilgisi**: Fiyat sorulursa veritabanındaki bilgiyi ver. "Saç kesimi işlemimiz 350 TL'dir."
5. **Kapanış ve Onay**: Her şey tamamlandığında randevuyu özetle ve son onay iste.

RANDEVU OLUŞTURMA (ÖNEMLİ):
Müşteri ile tarih, saat ve hizmet konusunda TAM OLARAK anlaştığında ve müşteri "Tamam", "Onaylıyorum" dediğinde şu JSON formatını üret (bunu müşteriye gösterme, arka planda işlem yapacağım):

{
  "action": "create_appointment",
  "data": {
    "date": "YYYY-MM-DD",
    "time": "HH:MM",
    "serviceId": 123,
    "professionalId": 456, (opsiyonel, eğer müşteri özel birini istediyse)
    "notes": "Müşteri notu"
  }
}

Eğer sadece sohbet ediyorsan JSON üretme, sadece metin yanıt ver.`;

class AIService {
    constructor() {
        this.model = genAI.getGenerativeModel({
            model: 'gemini-flash-latest'
        });
        this.conversations = new Map(); // Store conversation histories
    }

    // ... (rest of the code)

    // Main chat function
    async chat(message, sessionId = 'default') {
        try {
            // ... (rest of the chat logic)

        } catch (error) {
            console.error('AI Chat Error:', error.message);
            return {
                message: 'Üzgünüm, şu anda sistemsel bir sorun yaşıyorum. Lütfen daha sonra tekrar yazın.'
            };
        }
    }

    // Get or create conversation history
    getConversationHistory(sessionId) {
        if (!this.conversations.has(sessionId)) {
            this.conversations.set(sessionId, []);
        }
        return this.conversations.get(sessionId);
    }

    // Add message to conversation history
    addToHistory(sessionId, role, content) {
        const history = this.getConversationHistory(sessionId);
        history.push({ role, content });

        // Keep only last 20 messages to avoid token limits
        if (history.length > 20) {
            history.splice(0, history.length - 20);
        }
    }

    // Parse AI response for actions
    parseAction(text) {
        try {
            // Look for JSON in the response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (error) {
            console.error('Error parsing action:', error);
        }
        return null;
    }

    // Get slots for a specific date
    async getDailySchedule(salonId, dateStr) {
        try {
            // Start and End of the day
            const startOfDay = new Date(`${dateStr}T00:00:00`);
            const endOfDay = new Date(`${dateStr}T23:59:59`);

            // Fetch all appointments for this day
            const appointments = await prisma.appointment.findMany({
                where: {
                    salonId: salonId,
                    dateTime: {
                        gte: startOfDay,
                        lte: endOfDay
                    },
                    status: { not: 'cancelled' }
                },
                include: {
                    professional: true,
                    service: true
                }
            });

            // Group by professional
            const schedule = {};

            appointments.forEach(app => {
                if (!app.professional) return;

                const proName = app.professional.name;
                if (!schedule[proName]) schedule[proName] = [];

                const start = new Date(app.dateTime);
                const duration = app.service?.duration || 30; // default 30 min
                const end = new Date(start.getTime() + duration * 60000);

                schedule[proName].push({
                    start: start.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                    end: end.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
                });
            });

            return schedule;
        } catch (error) {
            console.error('Error fetching schedule:', error);
            return {};
        }
    }

    // Check strict availability for booking
    async checkAvailability(salonId, professionalId, dateTime, duration) {
        // Calculate end time
        const start = new Date(dateTime);
        const end = new Date(start.getTime() + duration * 60000);

        // Find overlapping appointments for THIS professional
        const conflicts = await prisma.appointment.count({
            where: {
                salonId: salonId,
                professionalId: professionalId,
                status: { not: 'cancelled' },
                dateTime: {
                    lt: end // Existing starts before new ends
                },
                // And existing ends after new starts (hard to do purely in prisma without end time column)
                // WE NEED TO FETCH and calculate in JS for accurate checks if we don't store endTime.
                // Or simplified: Just check if start time matches or is strictly close?
                // Better: Fetch all appointments for that day and check manually.
            }
        });

        // Optimization: Just fetching potential conflicts
        // Since we don't store 'endTime' in DB (schema only has dateTime + service.duration relation), 
        // we must fetch appointments around that time and check duration.

        // Let's fetch appointments for the day to be safe and check in JS.
        const dayStart = new Date(start); dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(start); dayEnd.setHours(23, 59, 59, 999);

        const appointments = await prisma.appointment.findMany({
            where: {
                salonId: salonId,
                professionalId: professionalId,
                status: { not: 'cancelled' },
                dateTime: { gte: dayStart, lte: dayEnd }
            },
            include: { service: true }
        });

        const isBusy = appointments.some(app => {
            const appStart = new Date(app.dateTime);
            const appDuration = app.service?.duration || 30;
            const appEnd = new Date(appStart.getTime() + appDuration * 60000);

            // Check overlap
            return (start < appEnd && end > appStart);
        });

        return !isBusy;
    }

    // Query professionals from database
    async queryProfessionals() {
        try {
            const professionals = await prisma.professional.findMany({
                where: { active: true },
                select: {
                    id: true,
                    name: true,
                    title: true,
                    specialties: true
                }
            });
            return professionals;
        } catch (error) {
            console.error('Error querying professionals:', error);
            return [];
        }
    }

    // Query services from database
    async queryServices() {
        try {
            const services = await prisma.service.findMany({
                where: { active: true },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    duration: true,
                    price: true
                }
            });
            return services;
        } catch (error) {
            console.error('Error querying services:', error);
            return [];
        }
    }

    // Create appointment
    async createAppointment(data, customerPhone) {
        try {
            // Find or create customer
            let customer = await prisma.customer.findUnique({
                where: { phone: customerPhone }
            });

            if (!customer) {
                customer = await prisma.customer.create({
                    data: {
                        name: 'WhatsApp Müşterisi',
                        phone: customerPhone,
                        email: `${customerPhone}@whatsapp.user`
                    }
                });
            }

            // Combine date and time
            const startDateTime = new Date(`${data.date}T${data.time}:00`);

            // Get main salon ID
            const salon = await prisma.salon.findFirst();
            if (!salon) throw new Error('Salon not found');

            // Get service details (needed for duration)
            const service = await prisma.service.findUnique({ where: { id: data.serviceId } });
            if (!service) throw new Error('Hizmet bulunamadı');

            // Handle Professional Selection
            let professionalId = data.professionalId;

            // If NO professional selected, find one who is AVAILABLE
            if (!professionalId) {
                // Fetch all active professionals
                const professionals = await prisma.professional.findMany({ where: { salonId: salon.id, active: true } });

                // Check availability for each
                for (const pro of professionals) {
                    const isAvailable = await this.checkAvailability(salon.id, pro.id, startDateTime, service.duration);
                    if (isAvailable) {
                        professionalId = pro.id;
                        break; // Found one!
                    }
                }

                if (!professionalId) {
                    throw new Error('Seçilen saatte uygun personel bulunmamaktadır.');
                }
            } else {
                // Verify availability for SPECIFIC professional
                const isAvailable = await this.checkAvailability(salon.id, professionalId, startDateTime, service.duration);
                if (!isAvailable) {
                    throw new Error('Seçilen personel bu saatte dolu.');
                }
            }

            // Create appointment
            const appointment = await prisma.appointment.create({
                data: {
                    customerId: customer.id,
                    salonId: salon.id,
                    professionalId: professionalId,
                    serviceId: data.serviceId,
                    dateTime: startDateTime,
                    status: 'confirmed',
                    totalPrice: service.price,
                    notes: `WhatsApp üzerinden oluşturuldu. ${data.notes || ''}`
                },
                include: {
                    customer: true,
                    professional: true,
                    service: true
                }
            });

            return appointment;
        } catch (error) {
            console.error('Error creating appointment:', error);
            throw error;
        }
    }

    // Main chat function
    async chat(message, sessionId = 'default', salon = null) {
        try {
            // Add user message to history
            this.addToHistory(sessionId, 'user', message);

            // Build context with conversation history
            const history = this.getConversationHistory(sessionId);
            const contextMessages = history.slice(-10).map(msg =>
                `${msg.role === 'user' ? 'Müşteri' : 'Asistan'}: ${msg.content}`
            ).join('\n');

            // 1. Context: Professionals and Services
            let professionals = [];
            let services = [];
            let salonName = "ALOKUAFÖR PREMIUM";
            let salonId = null;

            if (salon) {
                salonId = salon.id;
                salonName = salon.name;
                professionals = await prisma.professional.findMany({ where: { salonId: salon.id, active: true }, select: { id: true, name: true, title: true } });
                services = salon.services || await prisma.service.findMany({ where: { salonId: salon.id, active: true } });
            } else {
                professionals = await this.queryProfessionals();
                services = await this.queryServices();
            }

            // 2. Context: Availability (Today + Tomorrow)
            // Injecting schedule for AI to be aware of busy slots
            const todayStr = new Date().toISOString().split('T')[0];
            const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split('T')[0];

            let scheduleText = "Henüz randevu yok.";
            if (salonId) {
                const scheduleToday = await this.getDailySchedule(salonId, todayStr);
                const scheduleTomorrow = await this.getDailySchedule(salonId, tomorrowStr);

                const formatSchedule = (sched, dateLabel) => {
                    const lines = Object.entries(sched).map(([name, slots]) => {
                        const busyTimes = slots.map(s => `${s.start}-${s.end}`).join(', ');
                        return `- ${name}: ${busyTimes} DOLU`;
                    });
                    return lines.length > 0 ? `${dateLabel}:\n${lines.join('\n')}` : `${dateLabel}: Tamamen Boş`;
                };

                scheduleText = `\n${formatSchedule(scheduleToday, "BUGÜN (" + todayStr + ")")}\n\n${formatSchedule(scheduleTomorrow, "YARIN (" + tomorrowStr + ")")}`;
            }

            const dynamicPrompt = `Sen "${salonName}" isimli seçkin bir kuaför salonunun yapay zeka asistanı "Selin"sin.
GÖREVİN: Müşterilerle WhatsApp üzerinden sanki gerçek bir resepsiyonist gibi doğal, samimi ve profesyonel bir şekilde konuşmak ve randevu ayarlamak.

KİMLİĞİN VE TARZIN:
- Adın: Selin.
- Tarzın: Kibar, enerjik, yardımsever ve çözüm odaklı.
- Dil: Akıcı ve doğal Türkçe. Emoji kullanabilirsin (🌸, ✂️, ✨ gibi) ama aşırıya kaçma.
- Asla "Ben bir yapay zekayım" deme, "Selin" olarak konuş.

ÖNEMLİ KURALLAR:
1. **DOLU SAATLERE RANDEVU VERME**: Aşağıdaki "PERSONEL DOLULUK DURUMU" listesini kontrol et. Eğer bir personel o saatte doluysa, başka bir saati öner veya başka bir personeli kontrol et.
2. **ÇAKIŞMA KONTROLÜ**: Müşteri bir saat istediğinde, o saatte boş olan bir personel var mı bak. Eğer herkes doluysa kibarca reddet.
3. **HİZMET SÜRESİ**: Randevular ${services[0]?.duration || 30} dakika sürer (ortalama). Bunu hesaba kat.

BİLGİLER:
BUGÜNÜN TARİHİ: ${todayStr}

MEVCUT ÇALIŞANLAR (ID ile):
${professionals.map(e => `- ID: ${e.id}, İsim: ${e.name} (${e.title || 'Uzman'})`).join('\n')}

MEVCUT HİZMETLER VE FİYATLAR (ID ile):
${services.map(s => `- ID: ${s.id}, İsim: ${s.name} (${s.duration} dk) - Fiyat: ${s.price} TL`).join('\n')}

**PERSONEL DOLULUK DURUMU (DİKKAT ET):**
${scheduleText}

KONUŞMA AKIŞI:
1. **Karşılama**: "Merhaba! Ben ${salonName}'den Selin. Size nasıl yardımcı olabilirim? 🌸"
2. **Bilgi Toplama**: Tarih, Saat, Hizmet.
3. **Müsaitlik Kontrolü**: Müşteri saat verince yukarıdaki listeye bak. Müsaitse onayla, değilse alternatif öner.
4. **Fiyat**: Sorulursa listeden söyle.
5. **Kapanış**: JSON üret.

RANDEVU OLUŞTURMA (ÖNEMLİ):
Tamamlanan randevu için:
{
  "action": "create_appointment",
  "data": {
    "date": "YYYY-MM-DD",
    "time": "HH:MM",
    "serviceId": 123, (Listeden ID)
    "professionalId": 456, (Eğer müşteri özel isim verdiyse ID, YOKSA null bırak sistem atasın)
    "notes": "Müşteri notu"
  }
}`;

            const contextInfo = `
${dynamicPrompt}

KONUŞMA GEÇMİŞİ:
${contextMessages}

SON MESAJ:
Müşteri: ${message}
`;

            // Generate response
            const result = await this.model.generateContent(contextInfo);
            const response = result.response.text();

            // Parse for actions
            const action = this.parseAction(response);
            let cleanResponse = response.replace(/\{[\s\S]*\}/, '').trim();

            // Execute action if found
            if (action && action.action === 'create_appointment') {
                try {
                    const appointment = await this.createAppointment(action.data, sessionId);
                    cleanResponse += `\n\n✅ Harika! ${appointment.professional ? appointment.professional.name + ' ile ' : ''}${appointment.dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} randevunuz oluşturuldu.`;
                } catch (err) {
                    console.error('Appointment creation failed:', err);
                    cleanResponse += `\n\n⚠️ Üzgünüm, ${err.message || 'Randevu oluşturulamadı.'}`; // Send specific error to user (e.g. "Dolu")
                }
            }

            // Add AI response to history
            this.addToHistory(sessionId, 'assistant', cleanResponse);

            return {
                message: cleanResponse,
                action: action
            };

        } catch (error) {
            console.error('AI Chat Error:', error.message);
            return {
                message: 'Merhaba! Ben Asistan Selin. 🌸\n\nŞu an kısa bir bakımdayım, lütfen biraz sonra tekrar deneyin. ✨'
            };
        }
    }

    // Clear conversation history
    clearHistory(sessionId) {
        this.conversations.delete(sessionId);
    }
}

module.exports = new AIService();
