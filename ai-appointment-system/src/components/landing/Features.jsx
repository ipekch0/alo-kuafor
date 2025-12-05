import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Calendar, Users, BarChart, MessageSquare, Shield } from 'lucide-react';

const features = [
    {
        icon: Bot,
        title: "Yapay Zeka Asistanı",
        description: "WhatsApp üzerinden gelen mesajları otomatik yanıtlar, randevuları oluşturur ve müşterilerinize 7/24 hizmet verir.",
        color: "bg-indigo-100 text-indigo-600"
    },
    {
        icon: Calendar,
        title: "Akıllı Takvim",
        description: "Tüm randevularınızı tek bir yerden yönetin. Çakışmaları önleyin ve boş saatlerinizi otomatik doldurun.",
        color: "bg-purple-100 text-purple-600"
    },
    {
        icon: Users,
        title: "Müşteri Yönetimi (CRM)",
        description: "Müşteri geçmişini, notlarını ve tercihlerini saklayın. Onlara özel kampanyalar sunarak sadakati artırın.",
        color: "bg-pink-100 text-pink-600"
    },
    {
        icon: MessageSquare,
        title: "Otomatik Hatırlatmalar",
        description: "Randevu öncesi otomatik WhatsApp hatırlatmaları ile gelmeme (no-show) oranlarını %80 azaltın.",
        color: "bg-green-100 text-green-600"
    },
    {
        icon: BarChart,
        title: "Gelişmiş Raporlar",
        description: "Hangi personel ne kadar kazandırdı? En çok hangi hizmet satılıyor? İşletmenizin röntgenini çekin.",
        color: "bg-orange-100 text-orange-600"
    },
    {
        icon: Shield,
        title: "Güvenli Altyapı",
        description: "Verileriniz bulut tabanlı sunucularımızda şifrelenerek saklanır. Yedekleme derdiniz olmaz.",
        color: "bg-blue-100 text-blue-600"
    }
];

const Features = () => {
    return (
        <section id="features" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                        İşletmenizi Büyütmek İçin İhtiyacınız Olan Her Şey
                    </h2>
                    <p className="text-lg text-slate-600">
                        AloKuaför, sadece bir randevu sistemi değil, salonunuzun dijital ortağıdır.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:shadow-indigo-100 transition-all group"
                        >
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${feature.color} group-hover:scale-110 transition-transform`}>
                                <feature.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                            <p className="text-slate-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
