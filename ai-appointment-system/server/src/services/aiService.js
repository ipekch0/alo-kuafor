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
            model: 'gemini-2.0-flash'
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
            // Find or create customer based on phone number (WhatsApp ID)
            let customer = await prisma.customer.findUnique({
                where: { phone: customerPhone }
            });

            if (!customer) {
                customer = await prisma.customer.create({
                    data: {
                        name: 'WhatsApp Müşterisi', // Placeholder
                        phone: customerPhone,
                        email: `${customerPhone}@whatsapp.user` // Placeholder email
                    }
                });
            }

            // Combine date and time
            const dateTime = new Date(`${data.date}T${data.time}:00`);

            // Get main salon ID (assuming single salon for now or first one)
            const salon = await prisma.salon.findFirst();
            if (!salon) throw new Error('Salon not found');

            // If no professional selected, pick the first available one (logic simplified)
            let professionalId = data.professionalId;
            if (!professionalId) {
                const pro = await prisma.professional.findFirst({ where: { salonId: salon.id } });
                professionalId = pro.id;
            }

            // Get service price
            const service = await prisma.service.findUnique({ where: { id: data.serviceId } });

            // Create appointment
            const appointment = await prisma.appointment.create({
                data: {
                    customerId: customer.id,
                    salonId: salon.id,
                    professionalId: professionalId,
                    serviceId: data.serviceId,
                    dateTime: dateTime,
                    status: 'confirmed', // Auto-confirm for now
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
    async chat(message, sessionId = 'default') {
        try {
            // Add user message to history
            this.addToHistory(sessionId, 'user', message);

            // Build context with conversation history
            const history = this.getConversationHistory(sessionId);
            const contextMessages = history.slice(-10).map(msg =>
                `${msg.role === 'user' ? 'Müşteri' : 'Asistan'}: ${msg.content}`
            ).join('\n');

            // Get professionals and services for context
            const professionals = await this.queryProfessionals();
            const services = await this.queryServices();

            const contextInfo = `
${SYSTEM_PROMPT}

BUGÜNÜN TARİHİ: ${new Date().toISOString().split('T')[0]}

MEVCUT ÇALIŞANLAR:
${professionals.map(e => `- ${e.name} (${e.title}) - ID: ${e.id}`).join('\n')}

MEVCUT HİZMETLER VE FİYATLAR:
${services.map(s => `- ${s.name} (${s.duration} dk) - Fiyat: ${s.price} TL - ID: ${s.id}`).join('\n')}

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
                    cleanResponse += `\n\n✅ Harika! Randevunuz ${appointment.dateTime.toLocaleString('tr-TR')} tarihi için oluşturuldu.`;
                } catch (err) {
                    console.error('Appointment creation failed:', err);
                    cleanResponse += `\n\n⚠️ Randevu oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.`;
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
                message: 'Üzgünüm, şu anda sistemsel bir sorun yaşıyorum. Hata detayı: ' + error.message
            };
        }
    }

    // Clear conversation history
    clearHistory(sessionId) {
        this.conversations.delete(sessionId);
    }
}

module.exports = new AIService();
