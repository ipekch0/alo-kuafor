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
                        {navLinks.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`text-sm font-medium transition-all duration-300 relative group flex items-center gap-2
                                    ${item.isSpecial ? 'text-indigo-600 font-bold' : 'text-slate-600 hover:text-indigo-600'}
                                `}
                            >
                                {item.isSpecial && <Sparkles className="w-4 h-4 animate-pulse text-indigo-500" />}
                                {item.name}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full"></span>
                            </Link>
                        ))}
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
                                        <div className="flex gap-3 items-start">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                            <div>
                                                <p className="text-sm text-slate-800 font-medium">Hesabınız Onaylandı</p>
                                                <p className="text-xs text-slate-500">Artık tüm özellikleri kullanabilirsiniz.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        )}
                        {isAuthenticated ? (
                            <div className="flex items-center gap-3">
                                <Link
                                    to={location.pathname.startsWith('/panel') ? '/' : user?.role === 'salon_owner' ? '/panel' : '/profile'}
                                    className="btn-premium py-2 px-6 text-sm flex items-center gap-2"
                                >
                                    {user?.role === 'salon_owner' ? (
                                        <>
                                            <LayoutDashboard className="w-4 h-4" />
                                            Yönetim Paneli
                                        </>
                                    ) : (
                                        <>
                                            <User className="w-4 h-4" />
                                            Profilim
                                        </>
                                    )}
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
                                    className="hover:text-indigo-600 transition-colors flex items-center gap-3"
                                >
                                    {item.isSpecial && <Sparkles className="w-6 h-6 text-indigo-500" />}
                                    {item.name}
                                </Link>
                            ))}
                            <hr className="border-slate-200 my-4" />
                            {isAuthenticated ? (
                                <Link
                                    to="/panel"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-lg font-sans text-indigo-600 font-bold flex items-center gap-2"
                                >
                                    <LayoutDashboard className="w-5 h-5" />
                                    Yönetim Paneli
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-sans text-slate-600">Giriş Yap</Link>
                                    <Link to="/search" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-sans text-indigo-600 font-bold">Randevu Al</Link>
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
