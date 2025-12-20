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
        <div className="min-h-screen relative overflow-hidden">
            {/* Background Decorations */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
            </div>

            <div className="relative z-10">
                <Navbar />
                <Hero />
                <Features />

                {/* Pricing Section */}
                <section id="pricing" className="py-24 relative">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16 space-y-4">
                            <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
                                Size Uygun <span className="text-gradient">Paketler</span>
                            </h2>
                            <p className="text-xl text-slate-600 max-w-2xl mx-auto font-light">
                                İşletmenizin ihtiyaçlarına göre şekillendirilmiş, ölçeklenebilir çözümler.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                            {pricingPlans.map((plan, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.15, duration: 0.5 }}
                                    className={`relative p-8 rounded-3xl backdrop-blur-sm transition-all duration-500 ${plan.popular
                                        ? 'bg-white/80 border-2 border-indigo-500 shadow-2xl shadow-indigo-500/20 scale-105 z-10'
                                        : 'bg-white/60 border border-white/50 shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-2'
                                        }`}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg shadow-indigo-500/30">
                                            En Popüler
                                        </div>
                                    )}

                                    <div className="mb-8">
                                        <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                                        <p className="text-slate-500 text-sm h-10">{plan.description}</p>
                                    </div>

                                    <div className="flex items-baseline gap-1 mb-8">
                                        <span className={`text-5xl font-bold ${plan.popular ? 'text-indigo-600' : 'text-slate-900'}`}>
                                            {plan.price}
                                        </span>
                                        <span className="text-slate-500 text-lg font-medium">{plan.period}</span>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        {plan.features.map((feature, i) => (
                                            <div key={i} className="flex items-center gap-3 text-slate-700 bg-white/50 p-2 rounded-lg">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${plan.popular ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'
                                                    }`}>
                                                    <Check className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-medium">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => handleSelectPlan(plan.id)}
                                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${plan.popular
                                            ? 'btn-premium hover:shadow-indigo-500/40'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200'
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
        </div>
    );
};

export default LandingPage;
