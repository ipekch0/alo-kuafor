import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
    return (
        <div className="min-h-screen bg-brand-white font-sans text-brand-text-primary selection:bg-brand-accent-violet/20 selection:text-brand-accent-violet pt-20">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-100 text-slate-900 text-sm font-medium mb-6">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-900"></span>
                            </span>
                            Hikayemiz
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 mb-8 font-serif leading-tight">
                            Güzelliği <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent-indigo to-brand-accent-violet">Sanata</span> Dönüştürüyoruz
                        </h1>
                        <div className="space-y-6 text-slate-500 text-lg font-light leading-relaxed">
                            <p>
                                ODAKMANAGE, 2010 yılından bu yana güzellik ve bakım sektöründe standartları yeniden belirliyor. Amacımız sadece saç kesimi veya bakım değil, size özel bir deneyim tasarlamak.
                            </p>
                            <p>
                                Teknolojinin gücünü estetikle birleştiriyoruz. Yapay zeka destekli stil önerilerimiz ve online randevu sistemimizle, kişisel bakımınızı modern çağın hızına ve konforuna taşıyoruz.
                            </p>
                        </div>
                    </motion.div>

                    <div className="relative">
                        <div className="grid grid-cols-2 gap-4">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="space-y-4 mt-12"
                            >
                                <img src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="About 1" className="rounded-2xl w-full h-64 object-cover hover:scale-105 transition-transform duration-500 shadow-soft-md" />
                                <img src="https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="About 2" className="rounded-2xl w-full h-48 object-cover hover:scale-105 transition-transform duration-500 shadow-soft-md" />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="space-y-4"
                            >
                                <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="About 3" className="rounded-2xl w-full h-48 object-cover hover:scale-105 transition-transform duration-500 shadow-soft-md" />
                                <img src="https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="About 4" className="rounded-2xl w-full h-64 object-cover hover:scale-105 transition-transform duration-500 shadow-soft-md" />
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-32 border-y border-slate-100 py-16">
                    {[
                        { number: "10+", label: "Yıllık Deneyim" },
                        { number: "50k+", label: "Mutlu Müşteri" },
                        { number: "25+", label: "Uzman Stilist" },
                        { number: "100%", label: "Müşteri Memnuniyeti" }
                    ].map((stat, idx) => (
                        <div key={idx} className="text-center">
                            <h3 className="text-4xl font-bold text-slate-900 mb-2 font-serif">{stat.number}</h3>
                            <p className="text-slate-500 font-medium">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Values Section */}
                <div className="mb-32">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 font-serif">Değerlerimiz</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto">Bizi biz yapan ve size en iyisini sunmamızı sağlayan prensiplerimiz.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: "Hijyen & Güven", desc: "En üst düzey hijyen standartları ile sağlığınız kullanıcılarımıız için önceliktir." },
                            { title: "Süreklilik", desc: "Ekibimiz dünyadaki trendleri takip ediyor ve sürekli olarak ilerliyor." },
                            { title: "Premium Ürünler", desc: "Saçınıza ve cildinize sadece dünyanın en iyi markalarıyla dokunuyoruz." }
                        ].map((value, idx) => (
                            <div key={idx} className="card-premium p-8 group">
                                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-900 mb-6 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                    <span className="text-xl font-bold font-serif">{idx + 1}</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 font-serif">{value.title}</h3>
                                <p className="text-slate-500 leading-relaxed font-light">{value.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
