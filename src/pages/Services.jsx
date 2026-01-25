import React, { useState } from 'react';
import {
    Scissors, Sparkles, Star, Calendar,
    Smartphone, BarChart3, Users, Clock,
    ShieldCheck, Bell, Briefcase, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Services = () => {
    const [activeTab, setActiveTab] = useState('business'); // 'business' or 'customer'

    const businessFeatures = [
        {
            title: 'Yapay Zeka Destekli Randevu',
            desc: 'Çakışmaları önleyen ve kapasitenizi optimize eden akıllı takvim yönetimi.',
            icon: Calendar,
            color: 'bg-indigo-50 text-indigo-600',
            border: 'border-indigo-100'
        },
        {
            title: 'Gelişmiş CRM & Müşteri Takibi',
            desc: 'Müşteri alışkanlıklarını analiz edin, özel notlar alın ve sadakati artırın.',
            icon: Users,
            color: 'bg-blue-50 text-blue-600',
            border: 'border-blue-100'
        },
        {
            title: 'Finansal Raporlama',
            desc: 'Gelir/Gider takibi, personel performansı ve büyüme grafiklerinizi tek ekrandan izleyin.',
            icon: BarChart3,
            color: 'bg-emerald-50 text-emerald-600',
            border: 'border-emerald-100'
        },
        {
            title: 'Otomatik Hatırlatmalar',
            desc: 'SMS ve WhatsApp bildirimleri ile randevu kaçırma oranını %80 azaltın.',
            icon: Bell,
            color: 'bg-amber-50 text-amber-600',
            border: 'border-amber-100'
        },
        {
            title: 'Personel Yönetimi',
            desc: 'Ekibinizin çalışma saatlerini, izinlerini ve prim hakedişlerini kolayca yönetin.',
            icon: Briefcase,
            color: 'bg-purple-50 text-purple-600',
            border: 'border-purple-100'
        },
        {
            title: 'Dijital Marka & Profil',
            desc: 'İşletmenizi binlerce potansiyel müşteriye şık bir profil ile tanıtın.',
            icon: GlobeIcon,
            color: 'bg-rose-50 text-rose-600',
            border: 'border-rose-100'
        }
    ];

    const customerFeatures = [
        {
            title: '7/24 Online Randevu',
            desc: 'Telefon trafiğine takılmadan, dilediğiniz an müsaitlik durumuna göre randevu alın.',
            icon: Smartphone,
            color: 'bg-indigo-50 text-indigo-600',
            border: 'border-indigo-100'
        },
        {
            title: 'Doğrulanmış Yorumlar',
            desc: 'Sadece hizmet almış gerçek kullanıcıların yorumlarını okuyarak en iyi salonu seçin.',
            icon: Star,
            color: 'bg-amber-50 text-amber-600',
            border: 'border-amber-100'
        },
        {
            title: 'Portfolyo İnceleme',
            desc: 'Uzmanların daha önceki çalışmalarını görerek tarzınıza en uygun ismi bulun.',
            icon: Scissors,
            color: 'bg-rose-50 text-rose-600',
            border: 'border-rose-100'
        },
        {
            title: 'Hızlı & Güvenli İşlem',
            desc: 'Saniyeler içinde randevu oluşturun, geçmiş işlemlerinizi ve favorilerinizi yönetin.',
            icon: Zap,
            color: 'bg-emerald-50 text-emerald-600',
            border: 'border-emerald-100'
        },
        {
            title: 'Randevu Hatırlatıcı',
            desc: 'Randevunuz yaklaşırken bildirim alın, bakımınızı asla aksatmayın.',
            icon: Clock,
            color: 'bg-blue-50 text-blue-600',
            border: 'border-blue-100'
        },
        {
            title: 'Güvenilir Hizmet',
            desc: 'Onaylı ve puanlanmış işletmelerle sürprizlere yer yok, kalite garanti.',
            icon: ShieldCheck,
            color: 'bg-purple-50 text-purple-600',
            border: 'border-purple-100'
        }
    ];

    // Helper for missing icon
    function GlobeIcon(props) {
        return (
            <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" x2="22" y1="12" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FC] font-sans">
            {/* Header Section */}
            <div className="bg-slate-900 text-white py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/50 to-purple-900/50"></div>
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#F8F9FC] to-transparent"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-bold font-serif mb-6   "
                    >
                        Platform Hizmetlerimiz
                    </motion.h1>
                    <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
                        Güzellik dünyasını teknolojiyle buluşturuyoruz. İster işletmenizi büyütün, ister kendinizi şımartın.
                    </p>
                </div>
            </div>

            {/* Toggle Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
                <div className="bg-white p-2 rounded-2xl shadow-xl shadow-slate-900/10 max-w-md mx-auto flex items-center border border-gray-100">
                    <button
                        onClick={() => setActiveTab('business')}
                        className={`flex-1 py-4 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'business' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-gray-50'}`}
                    >
                        <Briefcase className="w-4 h-4" />
                        İşletmeler İçin
                    </button>
                    <button
                        onClick={() => setActiveTab('customer')}
                        className={`flex-1 py-4 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'customer' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-gray-50'}`}
                    >
                        <Sparkles className="w-4 h-4" />
                        Müşteriler İçin
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <AnimatePresence mode="wait">
                    {activeTab === 'business' ? (
                        <motion.div
                            key="business"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="text-center mb-16">
                                <h2 className="text-3xl font-bold text-slate-900 mb-4">İşletmenizi Dijital Çağa Taşıyın</h2>
                                <p className="text-slate-600 max-w-2xl mx-auto">
                                    ODAKMANAGE ile randevularınızı, ekibinizi ve kazancınızı tek bir panelden zahmetsizce yönetin. Size zaman kalsın.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {businessFeatures.map((feature, index) => (
                                    <div key={index} className="bg-white p-8 rounded-[32px] border border-gray-100 hover:border-indigo-100 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] transition-all group h-full">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${feature.color} ${feature.border} border`}>
                                            <feature.icon className="w-7 h-7" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                        <p className="text-slate-500 leading-relaxed text-sm">
                                            {feature.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* CTA Banner */}
                            <div className="mt-20 bg-slate-900 rounded-[40px] p-12 text-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-12 opacity-10">
                                    <Briefcase size={200} className="text-white" />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-3xl font-bold text-white mb-6">Hemen Başlayın ve Farkı Görün</h3>
                                    <p className="text-slate-300 max-w-xl mx-auto mb-8">
                                        İlk 14 gün ücretsiz deneyin. Kredi kartı gerekmez. İşletmenizin potansiyelini keşfedin.
                                    </p>
                                    <button className="bg-white text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg">
                                        Ücretsiz İşletme Hesabı Oluştur
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="customer"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="text-center mb-16">
                                <h2 className="text-3xl font-bold text-slate-900 mb-4">Güzellik Parmaklarınızın Ucunda</h2>
                                <p className="text-slate-600 max-w-2xl mx-auto">
                                    Aradığınız hizmeti bulun, en iyi uzmanı seçin ve saniyeler içinde randevunuzu oluşturun.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {customerFeatures.map((feature, index) => (
                                    <div key={index} className="bg-white p-8 rounded-[32px] border border-gray-100 hover:border-indigo-100 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] transition-all group h-full">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${feature.color} ${feature.border} border`}>
                                            <feature.icon className="w-7 h-7" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                        <p className="text-slate-500 leading-relaxed text-sm">
                                            {feature.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* CTA Banner */}
                            <div className="mt-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[40px] p-12 text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 p-12 opacity-10">
                                    <Sparkles size={200} className="text-white" />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-3xl font-bold text-white mb-6">Kendinizi Şımartmaya Hazır Mısınız?</h3>
                                    <p className="text-indigo-100 max-w-xl mx-auto mb-8">
                                        Size en yakın, en iyi puanlı salonları keşfedin ve hemen yerinizi ayırtın.
                                    </p>
                                    <button className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg">
                                        Hemen Randevu Al
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Services;
