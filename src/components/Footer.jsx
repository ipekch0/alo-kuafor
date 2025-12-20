import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Scissors } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-slate-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                                <Scissors className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white tracking-tight uppercase">ODAKMANAGE</span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            Güzellik salonları ve müşteriler için yapay zeka destekli yeni nesil randevu ve yönetim platformu.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all">
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-bold mb-6">Hızlı Bağlantılar</h3>
                        <ul className="space-y-4 text-sm">
                            <li><Link to="/hizmetler" className="hover:text-indigo-400 transition-colors">Hizmetler</Link></li>
                            <li><Link to="/about" className="hover:text-indigo-400 transition-colors">Hakkımızda</Link></li>
                            <li><Link to="/register-salon" className="hover:text-indigo-400 transition-colors">Salon Kaydı</Link></li>
                            <li><Link to="/contact" className="hover:text-indigo-400 transition-colors">İletişim</Link></li>
                            <li><Link to="/blog" className="hover:text-indigo-400 transition-colors">Blog</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-white font-bold mb-6">Kurumsal</h3>
                        <ul className="space-y-4 text-sm">
                            <li><Link to="/legal" className="hover:text-indigo-400 transition-colors">Kullanım Koşulları</Link></li>
                            <li><Link to="/privacy" className="hover:text-indigo-400 transition-colors">Gizlilik Politikası</Link></li>
                            <li><Link to="/cookie" className="hover:text-indigo-400 transition-colors">Çerez Politikası</Link></li>
                            <li><Link to="/kvkk" className="hover:text-indigo-400 transition-colors">KVKK Aydınlatma Metni</Link></li>
                        </ul>
                    </div>

                    {/* Contact - Newsletter */}
                    <div>
                        <h3 className="text-white font-bold mb-6">İletişim</h3>
                        <ul className="space-y-4 text-sm mb-8">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-indigo-500 shrink-0" />
                                <span>Maslak Mah. Büyükdere Cad. No:123<br />Sarıyer/İstanbul</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-indigo-500 shrink-0" />
                                <span>+90 (212) 123 45 67</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-indigo-500 shrink-0" />
                                <span>info@odakmanage.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm text-slate-500">
                    <p>&copy; {new Date().getFullYear()} OdakManage. Tüm hakları saklıdır.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
