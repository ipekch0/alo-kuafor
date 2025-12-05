import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scissors, Menu, X, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Only show navbar on public pages, hide on admin panel
    if (location.pathname.startsWith('/panel')) {
        return null;
    }

    const navLinks = [
        { name: 'Anasayfa', path: '/' },
        { name: 'Hakkımızda', path: '/hakkimizda' },
        { name: 'Hizmetler', path: '/hizmetler' },
        { name: 'Kuaför Bul', path: '/search' },
        { name: 'Galeri', path: '/galeri' },
        { name: 'AI Studio', path: '/ai-studio' },
    ];

    return (
        <>
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled || location.pathname !== '/' ? 'bg-white shadow-md py-3' : 'bg-transparent py-6'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isScrolled ? 'bg-slate-900 text-white' : 'bg-white text-slate-900 shadow-lg'}`}>
                            <Scissors className="w-5 h-5" />
                        </div>
                        <span className={`text-2xl font-bold tracking-tight font-serif ${isScrolled || location.pathname !== '/' ? 'text-slate-900' : 'text-slate-900'} transition-colors`}>
                            ALOKUAFÖR
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center gap-8">
                        {navLinks.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`text-sm font-medium transition-all duration-300 hover:text-brand-accent-indigo relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-0.5 after:bg-brand-accent-indigo after:transition-all after:duration-300 hover:after:w-full ${location.pathname === item.path ? 'text-brand-accent-indigo font-semibold' : 'text-slate-600'}`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden lg:flex items-center gap-4">
                        {isAuthenticated ? (
                            <Link
                                to="/panel"
                                className="btn-primary py-2.5 px-6 text-sm flex items-center gap-2"
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                Yönetim Paneli
                            </Link>
                        ) : (
                            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                                Giriş Yap
                            </Link>
                        )}
                        {!isAuthenticated && (
                            <Link
                                to="/search"
                                className="btn-primary py-2.5 px-6 text-sm"
                            >
                                Randevu Al
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-40 bg-white/95 backdrop-blur-xl pt-28 px-6 lg:hidden"
                    >
                        <div className="flex flex-col gap-6 text-2xl font-serif font-medium text-slate-900">
                            {navLinks.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="hover:text-brand-accent-indigo transition-colors"
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <hr className="border-slate-100 my-4" />
                            {isAuthenticated ? (
                                <Link
                                    to="/panel"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-lg font-sans text-brand-accent-indigo font-bold flex items-center gap-2"
                                >
                                    <LayoutDashboard className="w-5 h-5" />
                                    Yönetim Paneli
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-sans text-slate-600">Giriş Yap</Link>
                                    <Link to="/search" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-sans text-brand-accent-indigo font-bold">Randevu Al</Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
