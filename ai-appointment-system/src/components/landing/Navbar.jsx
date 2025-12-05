import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scissors, Menu, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Özellikler', href: '#features' },
        { name: 'Fiyatlandırma', href: '#pricing' },
        { name: 'SSS', href: '#faq' },
        { name: 'İletişim', href: '#contact' },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-4' : 'bg-transparent py-6'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                        <Scissors className="w-6 h-6" />
                    </div>
                    <span className={`text-xl font-bold tracking-tight ${isScrolled ? 'text-slate-900' : 'text-slate-900'}`}>
                        AloKuaför
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    <Link to="/search" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1">
                        <Scissors className="w-4 h-4" />
                        Kuaför Bul
                    </Link>
                    {navLinks.map((link) => (
                        <a key={link.name} href={link.href} className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                            {link.name}
                        </a>
                    ))}
                </div>

                {/* CTA Buttons */}
                <div className="hidden md:flex items-center gap-4">
                    <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors">
                        Salon Girişi
                    </Link>
                    <Link
                        to="/register"
                        className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-full hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
                    >
                        Hemen Başla <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-slate-600"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-b border-slate-100 overflow-hidden"
                    >
                        <div className="px-6 py-8 flex flex-col gap-6">
                            <Link to="/search" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-indigo-600 flex items-center gap-2">
                                <Scissors className="w-5 h-5" />
                                Kuaför Bul
                            </Link>
                            {navLinks.map((link) => (
                                <a key={link.name} href={link.href} onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-slate-900">
                                    {link.name}
                                </a>
                            ))}
                            <hr className="border-slate-100" />
                            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-slate-900">Salon Girişi</Link>
                            <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-full py-3 bg-indigo-600 text-white text-center rounded-xl font-semibold">
                                Hemen Başla
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
