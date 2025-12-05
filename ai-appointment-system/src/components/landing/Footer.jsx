import React from 'react';
import { Scissors, Instagram, Twitter, Facebook } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                                <Scissors className="w-5 h-5" />
                            </div>
                            <span className="text-xl font-bold text-white">AloKuaför</span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Kuaför ve güzellik salonları için geliştirilmiş, yapay zeka destekli yeni nesil randevu yönetim sistemi.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Ürün</h4>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Özellikler</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Fiyatlandırma</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Entegrasyonlar</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Yol Haritası</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Şirket</h4>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Hakkımızda</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Kariyer</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">İletişim</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Yasal</h4>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Gizlilik Politikası</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Kullanım Şartları</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">KVKK</a></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-slate-500">
                        © 2024 AloKuaför. Tüm hakları saklıdır.
                    </p>
                    <div className="flex items-center gap-4">
                        <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-indigo-600 hover:text-white transition-all">
                            <Instagram className="w-4 h-4" />
                        </a>
                        <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-indigo-600 hover:text-white transition-all">
                            <Twitter className="w-4 h-4" />
                        </a>
                        <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-indigo-600 hover:text-white transition-all">
                            <Facebook className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
