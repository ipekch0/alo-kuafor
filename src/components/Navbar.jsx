import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scissors, Menu, X, LayoutDashboard, Sparkles, User, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const { isAuthenticated, user } = useAuth();

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
        { name: 'AI Studio', path: '/ai-studio', isSpecial: true },
        { name: 'Kuaför Bul', path: '/search' },
        { name: 'Hizmetler', path: '/hizmetler' },
        { name: 'Hakkımızda', path: '/hakkimizda' },
        { name: 'Paketler', path: '/subscriptions' },
        { name: 'Galeri', path: '/galeri' },
        { name: 'İletişim', path: '/iletisim' },
    ];

    const isSearchPage = location.pathname === '/search';

    const getDashboardPath = () => {
        if (user?.role === 'admin' || user?.role === 'SUPER_ADMIN') return '/panel';
        if (user?.role === 'salon_owner' || user?.role === 'SALON_OWNER') return '/panel';
        return '/profile';
    };

    const getDashboardLabel = () => {
        return 'Profilim';
    };

    return (
        <>
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isSearchPage ? 'bg-white shadow-md py-3' : (isScrolled ? 'glass-premium py-3' : 'bg-transparent py-6')}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
                            <Scissors className="w-5 h-5" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter font-sans text-slate-900 group-hover:text-indigo-600 transition-colors uppercase">
                            ODAKMANAGE
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center gap-8">
                        {navLinks.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`text-sm font-medium transition-all duration-300 relative group flex items-center gap-2
                                    ${isActive ? 'text-indigo-600 font-bold' : (item.isSpecial ? 'text-indigo-600 font-bold' : 'text-slate-600 hover:text-indigo-600')}
                                `}
                            >
                                {(item.isSpecial || isActive) && <Sparkles className="w-4 h-4 animate-pulse text-indigo-500" />}
                                {item.name}
                                <span className={`absolute -bottom-1 left-0 h-0.5 bg-indigo-600 transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                            </Link>
                            );
                        })}
                    </div>

                    <div className="hidden lg:flex items-center gap-4">
                        {isAuthenticated && (
                            <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors relative group">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 p-4 hidden group-hover:block z-50">
                                    <h4 className="text-sm font-bold text-slate-900 mb-3">Bildirimler</h4>
                                    <div className="space-y-3">
                                        <div className="flex gap-3 items-start">
                                            <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                                            <div>
                                                <p className="text-sm text-slate-800 font-medium">Hoş geldiniz! 🎉</p>
                                                <p className="text-xs text-slate-500">Aramıza katıldığınız için teşekkürler.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        )}
                        {isAuthenticated ? (
                            <div className="flex items-center gap-3">
                                <Link
                                    to={location.pathname.startsWith('/panel') || location.pathname.startsWith('/super-admin') ? '/' : getDashboardPath()}
                                    className="btn-premium py-2 px-6 text-sm flex items-center gap-2"
                                >
                                    <User className="w-4 h-4" />
                                    {getDashboardLabel()}
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                                    Giriş Yap
                                </Link>
                                <Link
                                    to="/search"
                                    className="btn-premium py-2 px-6 text-sm hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
                                >
                                    Randevu Al
                                </Link>
                            </div>
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

            {/* Mobile Menu Drawer (Side Panel) */}
            <AnimatePresence mode="wait">
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop Blur Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                        />

                        {/* Side Drawer */}
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[70] shadow-2xl flex flex-col h-full overflow-hidden"
                        >
                            {/* Drawer Header */}
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md">
                                        <Scissors className="w-4 h-4" />
                                    </div>
                                    <span className="text-xl font-black tracking-tighter text-slate-900 uppercase">
                                        ODAK
                                    </span>
                                </Link>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Drawer Links */}
                            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                                {navLinks.map((item) => {
                                    const isActive = location.pathname === item.path;
                                    return (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                                            ${isActive || item.isSpecial
                                                ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                                            }
                                        `}
                                    >
                                        {(item.isSpecial || isActive) ? (
                                            <Sparkles className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" />
                                        ) : (
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-indigo-500 transition-colors" />
                                        )}
                                        {item.name}
                                    </Link>
                                    );
                                })}

                                <hr className="border-slate-100 my-4" />

                                {/* Auth Actions in Drawer */}
                                {isAuthenticated ? (
                                    <Link
                                        to={getDashboardPath()}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all font-semibold"
                                    >
                                        <User className="w-5 h-5" />
                                        {getDashboardLabel()}
                                    </Link>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <Link
                                            to="/login"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="w-full py-3 px-4 rounded-xl text-slate-600 font-bold border border-slate-200 hover:bg-slate-50 transition-colors text-center"
                                        >
                                            Giriş Yap
                                        </Link>
                                        <Link
                                            to="/search"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="w-full py-3 px-4 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-colors text-center"
                                        >
                                            Randevu Al
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Drawer Footer */}
                            <div className="p-4 border-t border-slate-100 bg-slate-50/30 text-center">
                                <p className="text-xs text-slate-400 font-medium">© 2025 OdakManage AI</p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
