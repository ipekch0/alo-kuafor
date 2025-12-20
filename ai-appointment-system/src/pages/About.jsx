import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Users, Star, TrendingUp, Award, Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
    return (
        <div className="min-h-screen bg-brand-white font-sans text-brand-text-primary selection:bg-brand-accent-violet/20 selection:text-brand-accent-violet pt-20">

            {/* 1. HERO SECTION */}
            <div className="relative overflow-hidden bg-slate-50 py-24 sm:py-32">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px]"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold tracking-wide uppercase mb-6">
                                Güzellik Sektörünün Dijital Geleceği
                            </span>
                            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 font-serif tracking-tight leading-tight">
                                Güzellik Sektörünün <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Dijital Geleceği</span>
                            </h1>
                            <p className="text-xl text-slate-500 font-light leading-relaxed mb-10">
                                ODAKMANAGE, sadece bir randevu sistemi değil; kuaförler ve müşteriler arasında köprü kuran, yapay zeka destekli bir yaşam tarzı platformudur.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* 2. STATS SECTION */}
            <div className="bg-white py-12 border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { icon: Users, number: "50k+", label: "Mutlu Müşteri", color: "text-blue-600" },
                            { icon: Award, number: "500+", label: "Partner Salon", color: "text-purple-600" },
                            { icon: Star, number: "4.9", label: "Ortalama Puan", color: "text-yellow-500" },
                            { icon: TrendingUp, number: "1M+", label: "Randevu", color: "text-green-600" }
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-6 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors"
                            >
                                <stat.icon className={`w-8 h-8 mx-auto mb-4 ${stat.color}`} />
                                <div className="text-3xl font-bold text-slate-900 mb-1">{stat.number}</div>
                                <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3. MISSION & VISION (Side by Side) */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl opacity-20 blur-2xl"></div>
                        <img
                            src="https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                            alt="Mission"
                            className="relative rounded-2xl shadow-2xl w-full object-cover h-[500px]"
                        />
                        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white p-6 rounded-2xl shadow-xl hidden md:block">
                            <div className="h-full border border-slate-100 rounded-xl flex items-center justify-center flex-col text-center p-4">
                                <Heart className="w-12 h-12 text-red-500 mb-4" />
                                <p className="text-slate-900 font-bold text-lg">Tutkuyla Bağlıyız</p>
                                <p className="text-slate-500 text-sm mt-2">İşimizi severek yapıyor, her detayda mükemmelliği arıyoruz.</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-4">Misyonumuz</h2>
                        <h3 className="text-4xl font-bold text-slate-900 mb-6 font-serif">Güzelliği Herkes İçin Erişilebilir Kılıyoruz</h3>
                        <p className="text-lg text-slate-500 leading-relaxed mb-8">
                            Teknolojinin gücünü kullanarak, güzellik hizmetlerine ulaşmayı kolaylaştırıyoruz. Salon sahiplerine işlerini büyütmeleri için güçlü araçlar sunarken, kullanıcılara kendilerini özel hissettirecek bir deneyim vaat ediyoruz.
                        </p>

                        <div className="space-y-4">
                            {[
                                "Yapay Zeka Destekli Randevu Yönetimi",
                                "7/24 Kesintisiz Müşteri Desteği",
                                "Güvenli Ödeme ve Şeffaf Fiyatlandırma",
                                "Sürdürülebilir ve Etik Güzellik Anlayışı"
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    <span className="text-slate-700 font-medium">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>




            {/* 6. FAQ SECTION (Added for richness) */}
            <div className="py-24 bg-white border-t border-slate-100">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4 font-serif">Sıkça Sorulan Sorular</h2>
                        <p className="text-slate-500">Aklınıza takılan soruları sizin için yanıtladık.</p>
                    </div>

                    <div className="space-y-6">
                        {[
                            { q: "OdakManage sadece kuaförler için mi?", a: "Hayır, berberler, güzellik merkezleri, spa ve tırnak stüdyoları gibi tüm randevu bazlı işletmeler için uygundur." },
                            { q: "Kurulum ücreti ödüyor muyum?", a: "Hayır, bulut tabanlı sistemimiz sayesinde kurulum gerekmez. Hesabınızı oluşturup hemen kullanmaya başlayabilirsiniz." },
                            { q: "Yapay zeka asistanı ne işe yarıyor?", a: "AI asistanımız, müşteri mesajlarını yanıtlar, randevu takviminizi optimize eder ve size pazarlama önerileri sunar." },
                            { q: "Verilerim güvende mi?", a: "Kesinlikle. Tüm verileriniz 256-bit SSL şifreleme ile korunur ve KVKK standartlarına uygun saklanır." }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="border border-slate-200 rounded-xl p-6 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer"
                            >
                                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.q}</h3>
                                <p className="text-slate-500 leading-relaxed">{item.a}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 5. CTA SECTION */}
            <div className="py-32">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-12 md:p-20 text-center text-white relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                        <h2 className="text-4xl md:text-5xl font-bold mb-8 font-serif relative z-10">Geleceğe Katılmaya Hazır mısınız?</h2>
                        <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto relative z-10">
                            Binlerce salon sahibi gibi siz de işinizi dijitale taşıyın, yapay zeka ile verimliliğinizi artırın.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                            <Link to="/register-salon" className="inline-flex items-center justify-center px-8 py-4 bg-white text-indigo-600 rounded-full font-bold text-lg hover:bg-indigo-50 transition-colors shadow-lg">
                                Hemen Başla
                            </Link>
                            <Link to="/iletisim" className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white/10 transition-colors">
                                İletişime Geç <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default About;
