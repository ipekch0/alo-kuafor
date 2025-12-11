import React from 'react';
import { motion } from 'framer-motion';
import { Phone, MapPin, Mail, Send, Instagram, Facebook, Twitter, Clock } from 'lucide-react';

const Contact = () => {
    return (
        <div className="min-h-screen pt-20 bg-slate-50 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-200/50 skew-x-12 transform translate-x-20 z-0"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl z-0"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

                    {/* Left Side: Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-10"
                    >
                        <div>
                            <span className="text-indigo-600 font-semibold tracking-wide uppercase text-sm">Bizimle İletişime Geçin</span>
                            <h1 className="text-5xl font-bold text-slate-900 mt-3 font-serif leading-tight">
                                Size Yardımcı Olmak İçin Buradayız
                            </h1>
                            <p className="text-slate-600 mt-6 text-lg leading-relaxed">
                                Görüşleriniz bizim için değerli. Randevu, öneri veya sadece bir merhaba demek için aşağıdaki kanallardan bize ulaşabilirsiniz.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {[
                                { icon: Phone, title: 'Telefon', value: '+90 (538) 740 5669', sub: 'Hafta içi 09:00 - 18:00' },
                                { icon: Mail, title: 'E-posta', value: 'info@alokuafor.com', sub: 'En geç 24 saat içinde dönüş' },
                                { icon: MapPin, title: 'Adres', value: 'Beylikdüzü, İstanbul', sub: 'Cumhuriyet Mah. No:123' },
                                { icon: Clock, title: 'Çalışma Saatleri', value: 'Pzt-Cmt: 09:00-20:00', sub: 'Pazar günleri kapalıyız' }
                            ].map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + idx * 0.1 }}
                                    className="flex items-start gap-5 p-4 rounded-xl hover:bg-white/60 transition-colors"
                                >
                                    <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-slate-900 font-bold text-lg">{item.title}</h3>
                                        <p className="text-slate-700 font-medium">{item.value}</p>
                                        <p className="text-slate-500 text-sm mt-0.5">{item.sub}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Social Media */}
                        <div className="pt-8 border-t border-slate-200">
                            <p className="text-slate-500 mb-4 font-medium">Bizi Takip Edin</p>
                            <div className="flex gap-4">
                                {[Instagram, Facebook, Twitter].map((Icon, i) => (
                                    <a key={i} href="#" className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-300">
                                        <Icon className="w-5 h-5" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Side: Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl border border-white/40 sticky top-24"
                    >
                        <h3 className="text-2xl font-bold text-slate-900 mb-2 font-serif">Bize Yazın</h3>
                        <p className="text-slate-500 mb-8 text-sm">Formu doldurun, ekibimiz en kısa sürede sizinle iletişime geçsin.</p>

                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700 ml-1">Adınız</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                        placeholder="Adınız"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700 ml-1">Soyadınız</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                        placeholder="Soyadınız"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700 ml-1">E-posta Adresi</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                    placeholder="ornek@email.com"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Konu</label>
                                <select className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-slate-600">
                                    <option>Genel Bilgi</option>
                                    <option>Randevu Talebi</option>
                                    <option>Şikayet / Öneri</option>
                                    <option>İş Birliği</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Mesajınız</label>
                                <textarea
                                    rows="4"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none resize-none"
                                    placeholder="Size nasıl yardımcı olabiliriz?"
                                ></textarea>
                            </div>

                            <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-all transform hover:scale-[1.02] shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2">
                                <Send className="w-5 h-5" />
                                Mesajı Gönder
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
