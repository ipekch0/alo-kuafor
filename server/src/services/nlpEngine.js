const { NlpManager } = require('node-nlp');
const path = require('path');
const fs = require('fs');

class NLPEngine {
    constructor() {
        this.manager = new NlpManager({ languages: ['tr'], forceNER: true });
        this.modelPath = path.join(__dirname, '../../model.nlp');
        this.isTrained = false;
    }

    async init() {
        if (fs.existsSync(this.modelPath)) {
            await this.manager.load(this.modelPath);
            this.isTrained = true;
            console.log('✅ Local NLP Model loaded from disk.');
        } else {
            await this.train();
        }
    }

    async train() {
        console.log('🧠 Training Local NLP Model...');

        // --- GREETINGS ---
        this.manager.addDocument('tr', 'merhaba', 'greeting');
        this.manager.addDocument('tr', 'selam', 'greeting');
        this.manager.addDocument('tr', 'selamün aleyküm', 'greeting');
        this.manager.addDocument('tr', 'günaydın', 'greeting');
        this.manager.addDocument('tr', 'hayırlı işler', 'greeting');
        this.manager.addDocument('tr', 'iyi günler', 'greeting');
        this.manager.addDocument('tr', 'orada kimse var mı', 'greeting');

        // --- APPOINTMENT CREATE / CHECK ---
        this.manager.addDocument('tr', 'randevu almak istiyorum', 'appointment.create');
        this.manager.addDocument('tr', 'randevu alabilir miyim', 'appointment.create');
        this.manager.addDocument('tr', 'müsait misiniz', 'appointment.check');
        this.manager.addDocument('tr', 'boş yeriniz var mı', 'appointment.check');
        this.manager.addDocument('tr', '%date% için randevu istiyorum', 'appointment.create');
        this.manager.addDocument('tr', '%date% saat %time% uygun mu', 'appointment.check');
        this.manager.addDocument('tr', '%service% yaptırmak istiyorum', 'appointment.create');
        this.manager.addDocument('tr', 'saat %time% için yer var mı', 'appointment.check');

        // --- PRICING / SERVICES ---
        this.manager.addDocument('tr', 'fiyatlar ne kadar', 'service.pricing');
        this.manager.addDocument('tr', 'ücretler nedir', 'service.pricing');
        this.manager.addDocument('tr', 'kaç para', 'service.pricing');
        this.manager.addDocument('tr', '%service% ne kadar', 'service.pricing');
        this.manager.addDocument('tr', 'neler yapıyorsunuz', 'service.list');
        this.manager.addDocument('tr', 'hizmetleriniz neler', 'service.list');

        // --- HOURS / LOCATION ---
        this.manager.addDocument('tr', 'kaça kadar açıksınız', 'salon.hours');
        this.manager.addDocument('tr', 'açılış saati nedir', 'salon.hours');
        this.manager.addDocument('tr', 'kaçar arası çalışıyorsunuz', 'salon.hours');
        this.manager.addDocument('tr', 'neredesiniz', 'salon.location');
        this.manager.addDocument('tr', 'adresiniz nedir', 'salon.location');
        this.manager.addDocument('tr', 'konum atar mısınız', 'salon.location');

        // --- ENTITIES (Simple list for better extraction) ---
        this.manager.addNamedEntityText('service', 'saç kesimi', ['tr'], ['saç kesim', 'saçımı kestireceğim', 'berber', 'kestirmek']);
        this.manager.addNamedEntityText('service', 'sakal kesimi', ['tr'], ['sakal', 'sakal düzeltme', 'traş']);
        this.manager.addNamedEntityText('service', 'boya', ['tr'], ['saç boyama', 'boyatmak']);
        this.manager.addNamedEntityText('service', 'fön', ['tr'], ['fön çekmek', 'fom']);

        await this.manager.train();
        this.manager.save(this.modelPath);
        this.isTrained = true;
        console.log('🚀 Local NLP Model training complete.');
    }

    async process(message, context = {}) {
        if (!this.isTrained) await this.init();

        const result = await this.manager.process('tr', message);
        console.log('[NLP DEBUG] Intent:', result.intent, 'Score:', result.score);
        console.log('[NLP DEBUG] Entities:', result.entities);

        // Simple Rule Engine based on Intent
        switch (result.intent) {
            case 'greeting':
                return { text: "Merhaba! 😊 Size nasıl yardımcı olabilirim? Randevu mu almak istersiniz yoksa hizmetlerimize mi bakmak istersiniz?" };

            case 'service.pricing':
            case 'service.list':
                let priceText = "Hizmetlerimiz ve fiyatlarımız şu şekildedir:\n";
                if (context.services && context.services.length > 0) {
                    priceText += context.services.map(s => `- ${s.name}: ${s.price} TL`).join('\n');
                } else {
                    priceText = "Hizmetlerimizi şu an listeleyemiyorum ama isterseniz dükkanımıza uğrayıp öğrenebilirsiniz.";
                }
                return { text: priceText };

            case 'salon.hours':
                return { text: "Çalışma saatlerimizi sistemden kontrol ediyorum ama genelde haftanın her günü sabah 09:00 ile akşam 20:00 arası hizmet veriyoruz." };

            case 'salon.location':
                return { text: `Şu an konumumuz: ${context.address || 'Adresimiz sistemde kayıtlı değil ama telefonla bizi arayarak detaylı bilgi alabilirsiniz.'}` };

            case 'appointment.create':
            case 'appointment.check':
                // Pass it back to logic handler for date/time check
                return {
                    intent: result.intent,
                    entities: result.entities,
                    fallback: false // We understood, but need logic
                };

            default:
                return { fallback: true };
        }
    }
}

module.exports = new NLPEngine();
