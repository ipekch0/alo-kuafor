import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Navbar from '../components/Navbar';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import Footer from '../components/landing/Footer';

const LandingPage = () => {
    const navigate = useNavigate();

    const handleSelectPlan = (planId) => {
        const plans = [
            {
                id: 'STARTER',
                name: "Başlangıç",
                price: "700 ₺"
            },
            {
                id: 'PRO',
                name: "Pro",
                price: "1100 ₺"
            }
        ];

        const plan = plans.find(p => p.id === planId);

        if (planId === 'ENTERPRISE') {
            window.open('https://wa.me/905387405669?text=Enterprise%20paket%20hakkında%20bilgi%20almak%20istiyorum', '_blank');
        } else {
            const numericPrice = parseInt(plan.price.replace(/\D/g, ''));
            navigate('/payment', { state: { plan: planId, price: numericPrice, planName: plan.name + ' Paket' } });
        }
    };

    const pricingPlans = [
        {
            id: 'STARTER',
            name: "Başlangıç",
            price: "700 ₺",
            period: "/ay",
            description: "Küçük salonlar ve bireysel çalışanlar için ideal.",
            features: [
                "Aylık 50 Randevu",
                "1 Personel",
                "Temel Müşteri Yönetimi",
                "Web Paneli"
            ],
            cta: "Satın Al",
            popular: false
        },
        {
            id: 'PRO',
            name: "Pro",
            price: "1100 ₺",
            period: "/ay",
            description: "Büyüyen işletmeler için tam kapsamlı çözüm.",
            features: [
                "Sınırsız Randevu",
                "5 Personel",
                "Yapay Zeka Asistanı (WhatsApp)",
                "Otomatik Hatırlatmalar",
                "Gelişmiş Raporlar"
            ],
            cta: "Satın Al",
            popular: true
        },
        {
            id: 'ENTERPRISE',
            name: "Enterprise",
            price: "Özel",
            period: "",
            description: "Zincir salonlar ve büyük işletmeler için.",
            features: [
                "Sınırsız Personel",
                "Çoklu Şube Yönetimi",
                "Özel Entegrasyonlar",
                "7/24 Öncelikli Destek",
                "Size Özel Alan Adı"
            ],
            cta: "İletişime Geç",
            popular: false
        }
    ];

    return (
        <div className="min-h-screen">
            <Navbar />
            <Hero />
            <Features />
            {/* Pricing Section */}
            <section id="pricing" className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Paketlerimiz</h2>
                    <p className="text-xl text-center text-gray-600 mb-16 max-w-3xl mx-auto">
                        İşletmenize en uygun paketi seçin ve randevu yönetiminizi kolaylaştırın.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {pricingPlans.map((plan, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className={`relative p-8 rounded-2xl bg-white border ${plan.popular
                                    ? 'border-indigo-500 shadow-2xl shadow-indigo-100 scale-105 z-10'
                                    : 'border-slate-200 shadow-sm'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                                        En Popüler
                                    </div>
                                )}

                                <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                                <p className="text-slate-500 text-sm mb-6">{plan.description}</p>

                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                                    <span className="text-slate-500">{plan.period}</span>
                                </div>

                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3 text-slate-700">
                                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                                                <Check className="w-3 h-3" />
                                            </div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handleSelectPlan(plan.id)}
                                    className={`w-full py-3 rounded-xl font-bold transition-all ${plan.popular
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                                        : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                                        }`}
                                >
                                    {plan.cta}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
};

export default LandingPage;
