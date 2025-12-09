import React from 'react';
import { Scissors, Sparkles, Star, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Services = () => {
    return (
        <div className="min-h-screen pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-20"
                >
                    <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 mb-6 font-serif">Hizmetlerimiz</h1>
                    <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mb-6"></div>
                    <p className="text-slate-500 max-w-2xl mx-auto text-lg font-light leading-relaxed">
                        Platformumuzdaki seçkin salonlarda bulabileceğiniz ayrıcalıklı hizmetler.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        { title: 'Saç Tasarımı', desc: 'Modern kesimler ve kişiye özel stiller.', icon: Scissors },
                        { title: 'Renklendirme', desc: 'Premium boyalarla ışıltılı dokunuşlar.', icon: Sparkles },
                        { title: 'Gelin & Özel Gün', desc: 'En özel anlarınız için kusursuz hazırlık.', icon: Star },
                        { title: 'Bakım Kürleri', desc: 'Yıpranmış saçlara özel onarıcı terapiler.', icon: CheckCircle },
                        { title: 'El & Ayak Bakımı', desc: 'Spa tadında manikür ve pedikür deneyimi.', icon: Clock },
                        { title: 'Cilt Bakımı', desc: 'Profesyonel ürünlerle derinlemesine yenilenme.', icon: Sparkles },
                    ].map((service, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="glass-card p-8 group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>

                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm border border-indigo-100/50">
                                    <service.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-3 font-serif">{service.title}</h3>
                                <p className="text-slate-600 mb-8 font-light leading-relaxed">{service.desc}</p>
                                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                                    <span className="text-indigo-600 text-sm font-medium group-hover:text-indigo-700 transition-colors">Detaylı Bilgi</span>
                                    <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Services;
