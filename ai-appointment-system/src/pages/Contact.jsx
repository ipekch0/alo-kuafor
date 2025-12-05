import React from 'react';
import { motion } from 'framer-motion';
import { Phone, MapPin, Mail, Send } from 'lucide-react';

const Contact = () => {
    return (
        <div className="min-h-screen bg-brand-white font-sans text-brand-text-primary selection:bg-brand-accent-violet/20 selection:text-brand-accent-violet pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-20"
                >
                    <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 mb-6 font-serif">İletişim</h1>
                    <div className="w-24 h-1 bg-brand-accent-indigo mx-auto mb-6"></div>
                    <p className="text-slate-500 max-w-2xl mx-auto text-lg font-light leading-relaxed">
                        Sorularınız, önerileriniz veya iş birliği talepleriniz için bize ulaşın.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-8"
                    >
                        {[
                            { icon: Phone, title: 'Telefon', value: '+90 (212) 555 0000' },
                            { icon: Mail, title: 'E-posta', value: 'info@alokuafor.com' },
                            { icon: MapPin, title: 'Merkez Ofis', value: 'Levent, İstanbul' }
                        ].map((item, idx) => (
                            <div key={idx} className="card-premium p-8 flex items-center gap-6 group">
                                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-slate-900 font-bold text-lg font-serif">{item.title}</h3>
                                    <p className="text-slate-500 font-light">{item.value}</p>
                                </div>
                            </div>
                        ))}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="card-premium p-10"
                    >
                        <h3 className="text-3xl font-bold text-slate-900 mb-8 font-serif">Bize Yazın</h3>
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Adınız</label>
                                    <input type="text" className="input-premium" placeholder="Adınız" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Soyadınız</label>
                                    <input type="text" className="input-premium" placeholder="Soyadınız" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">E-posta</label>
                                <input type="email" className="input-premium" placeholder="ornek@email.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Mesajınız</label>
                                <textarea rows="4" className="input-premium resize-none" placeholder="Mesajınızı buraya yazın..."></textarea>
                            </div>
                            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                                <Send className="w-5 h-5" />
                                Gönder
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
