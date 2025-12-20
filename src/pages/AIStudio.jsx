import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft, Wand2, Stars, Zap, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AIStudio = () => {
    const [email, setEmail] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email) {
            setIsSubscribed(true);
            // Here you would connect to a real newsletter service
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center text-white">
            {/* Animated Background Mesh */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] animate-pulse delay-1000"></div>
                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
            </div>

            {/* Content Container */}
            <div
                className="relative z-10 w-full max-w-4xl px-6 text-center"
            >
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 ring-1 ring-white/20"
                >
                    <Stars className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-medium text-slate-300">Yapay Zeka Destekli Güzellik Devrimi</span>
                </motion.div>

                {/* Main Heading */}
                <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400 drop-shadow-2xl">
                    AI Studio <br className="hidden md:block" />
                    <span className="text-white">Yükleniyor...</span>
                </h1>

                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                    Siz kahvenizi yudumlarken biz, kendinizin en iyi versiyonunu saniyeler içinde görebileceğiniz
                    <span className="text-indigo-400 font-semibold"> hyper-realistic</span> simülasyon motorumuzu eğitiyoruz.
                </p>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-16">
                    {[
                        { icon: Wand2, title: "Anlık Dönüşüm", desc: "Tek tıkla saç ve makyaj değişikliği" },
                        { icon: Zap, title: "Nöral İşleme", desc: "Milisaniyeler içinde fotogerçekçi sonuçlar" },
                        { icon: Sparkles, title: "Sınırsız Stil", desc: "Binlerce kombinasyonu risk almadan deneyin" }
                    ].map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + (idx * 0.1) }}
                            className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors group"
                        >
                            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <feature.icon className="w-6 h-6 text-indigo-400" />
                            </div>
                            <h3 className="text-white font-bold mb-2">{feature.title}</h3>
                            <p className="text-sm text-slate-400">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Waitlist Form */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="max-w-md mx-auto"
                >
                    {!isSubscribed ? (
                        <form onSubmit={handleSubscribe} className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative flex items-center bg-slate-900 rounded-xl border border-white/10 p-1 pr-1">
                                <input
                                    type="email"
                                    placeholder="E-posta adresinizi bırakın, ilk siz deneyin"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="flex-1 bg-transparent border-none text-white placeholder-slate-500 focus:ring-0 px-4 py-3 outline-none"
                                    required
                                />
                                <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2">
                                    Haber Ver <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    ) : (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-green-400 font-medium flex items-center justify-center gap-2"
                        >
                            <Sparkles className="w-5 h-5" />
                            Listeye eklendiniz! Açıldığında haber vereceğiz.
                        </motion.div>
                    )}
                </motion.div>

                {/* Footer Link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-12"
                >
                    <Link to="/" className="inline-flex items-center text-slate-500 hover:text-white transition-colors text-sm font-medium gap-2 group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Ana Sayfaya Dön
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};

export default AIStudio;
