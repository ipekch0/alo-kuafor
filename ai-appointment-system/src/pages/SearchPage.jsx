import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Filter, ArrowRight, ChevronDown, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { cities } from '../data/cities';

const SearchPage = () => {
    const [salons, setSalons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const location = useLocation();

    // Filters State
    const [filters, setFilters] = useState({
        query: '',
        city: '',
        district: '',
        serviceCategory: '',
        minPrice: '',
        maxPrice: ''
    });

    // Expand/Collapse state for filter sections
    const [openSections, setOpenSections] = useState({
        location: true,
        category: true,
        price: true
    });

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setFilters(prev => ({
            ...prev,
            query: params.get('query') || '',
            city: params.get('city') || '',
            district: params.get('district') || '',
            serviceCategory: params.get('category') || ''
        }));
    }, [location.search]);

    useEffect(() => {
        fetchSalons();
    }, [filters]);

    const fetchSalons = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(filters);
            for (const [key, value] of params.entries()) {
                if (!value) params.delete(key);
            }
            const response = await fetch(`/api/salons/search?${params.toString()}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setSalons(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching salons:', error);
            setSalons([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-screen bg-gray-50/50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
            {/* Top Bar - Premium Gradient */}
            <div className="relative bg-white border-b border-gray-100 sticky top-0 z-40 backdrop-blur-xl bg-white/80 supports-[backdrop-filter]:bg-white/60">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-purple-500/5 to-fuchsia-500/5 pointer-events-none" />
                <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between relative">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                            <Star className="w-5 h-5 fill-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">Keşfet</h1>
                            <p className="text-xs font-medium text-slate-500 mt-1">Sizin için seçilen seçkin salonlar</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-medium text-slate-500 bg-white/50 px-4 py-2 rounded-full border border-gray-100 shadow-sm">
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            {salons.length} işletme aktif
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Filters Sidebar - Premium Glassy Look */}
                    <aside className={`lg:w-80 flex-shrink-0 ${showMobileFilters ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto' : 'hidden lg:block'}`}>
                        {showMobileFilters && (
                            <div className="flex justify-between items-center mb-6 lg:hidden">
                                <h2 className="text-xl font-bold">Filtrele</h2>
                                <button onClick={() => setShowMobileFilters(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                                    <ChevronDown size={20} className="rotate-90" />
                                </button>
                            </div>
                        )}

                        <div className="space-y-6 sticky top-24">
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                                {/* Search Input */}
                                <div className="relative group mb-8">
                                    <input
                                        type="text"
                                        placeholder="Salon veya hizmet ara..."
                                        value={filters.query}
                                        onChange={(e) => handleFilterChange('query', e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 pl-11 text-sm font-medium text-slate-700 outline-none transition-all duration-300 hover:border-indigo-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-gray-400 shadow-sm"
                                    />
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                </div>

                                {/* Location Filter */}
                                <div className="border-b border-gray-50 pb-6 mb-6">
                                    <button
                                        onClick={() => toggleSection('location')}
                                        className="flex items-center justify-between w-full font-bold text-xs uppercase tracking-widest mb-4 text-slate-400 hover:text-indigo-600 transition-colors"
                                    >
                                        Konum
                                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${openSections.location ? 'rotate-180' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                        {openSections.location && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="space-y-3 overflow-hidden"
                                            >
                                                <div className="relative">
                                                    <select
                                                        value={filters.city}
                                                        onChange={(e) => {
                                                            handleFilterChange('city', e.target.value);
                                                            handleFilterChange('district', '');
                                                        }}
                                                        className="w-full p-3.5 bg-gray-50 border border-t-0 border-r-0 border-l-0 border-b-2 border-gray-200 rounded-lg text-sm font-medium text-slate-700 cursor-pointer outline-none transition-all duration-300 hover:border-indigo-400 focus:border-indigo-600 focus:bg-indigo-50/10"
                                                    >
                                                        <option value="">Tüm Şehirler</option>
                                                        {cities.map(city => (
                                                            <option key={city.name} value={city.name}>{city.name}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="relative">
                                                    <select
                                                        value={filters.district}
                                                        onChange={(e) => handleFilterChange('district', e.target.value)}
                                                        disabled={!filters.city}
                                                        className="w-full p-3.5 bg-gray-50 border border-t-0 border-r-0 border-l-0 border-b-2 border-gray-200 rounded-lg text-sm font-medium text-slate-700 cursor-pointer outline-none transition-all duration-300 hover:border-indigo-400 focus:border-indigo-600 focus:bg-indigo-50/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <option value="">Tüm İlçeler</option>
                                                        {filters.city && cities.find(c => c.name === filters.city)?.districts.map(dist => (
                                                            <option key={dist} value={dist}>{dist}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Category Filter */}
                                <div className="border-b border-gray-50 pb-6 mb-6">
                                    <button
                                        onClick={() => toggleSection('category')}
                                        className="flex items-center justify-between w-full font-bold text-xs uppercase tracking-widest mb-4 text-slate-400 hover:text-indigo-600 transition-colors"
                                    >
                                        Kategori
                                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${openSections.category ? 'rotate-180' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                        {openSections.category && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="space-y-2 overflow-hidden"
                                            >
                                                {[
                                                    { id: '', label: 'Tümü' },
                                                    { id: 'hair', label: 'Saç Tasarım' },
                                                    { id: 'makeup', label: 'Makyaj' },
                                                    { id: 'skincare', label: 'Cilt Bakımı' },
                                                    { id: 'nails', label: 'Tırnak Bakımı' },
                                                    { id: 'spa', label: 'Spa & Masaj' }
                                                ].map(cat => (
                                                    <button
                                                        key={cat.id}
                                                        onClick={() => handleFilterChange('serviceCategory', cat.id)}
                                                        className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200 text-sm font-medium border ${filters.serviceCategory === cat.id ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'border-transparent text-slate-600 hover:bg-gray-50 hover:border-gray-100'}`}
                                                    >
                                                        <div className={`w-2 h-2 rounded-full transition-colors ${filters.serviceCategory === cat.id ? 'bg-indigo-500' : 'bg-gray-300'}`} />
                                                        {cat.label}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Price Filter */}
                                <div>
                                    <button
                                        onClick={() => toggleSection('price')}
                                        className="flex items-center justify-between w-full font-bold text-xs uppercase tracking-widest mb-4 text-slate-400 hover:text-indigo-600 transition-colors"
                                    >
                                        Fiyat Aralığı
                                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${openSections.price ? 'rotate-180' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                        {openSections.price && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="flex items-center gap-3 overflow-hidden"
                                            >
                                                <div className="relative flex-1">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₺</span>
                                                    <input
                                                        type="number"
                                                        placeholder="Min"
                                                        value={filters.minPrice}
                                                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                                        className="w-full p-3 pl-6 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none transition-all duration-300 hover:border-indigo-300 focus:bg-white focus:border-indigo-500 text-center"
                                                    />
                                                </div>
                                                <span className="text-gray-300 font-medium">-</span>
                                                <div className="relative flex-1">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₺</span>
                                                    <input
                                                        type="number"
                                                        placeholder="Max"
                                                        value={filters.maxPrice}
                                                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                                        className="w-full p-3 pl-6 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none transition-all duration-300 hover:border-indigo-300 focus:bg-white focus:border-indigo-500 text-center"
                                                    />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Reset Button */}
                                {Object.values(filters).some(x => x) && (
                                    <motion.button
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onClick={() => setFilters({ query: '', city: '', district: '', serviceCategory: '', minPrice: '', maxPrice: '' })}
                                        className="w-full mt-6 py-4 text-sm font-bold text-red-600 border border-red-100 bg-red-50 hover:bg-red-100 hover:shadow-lg hover:shadow-red-500/10 rounded-xl transition-all duration-300"
                                    >
                                        Filtreleri Sıfırla
                                    </motion.button>
                                )}
                            </div>
                        </div>
                    </aside>

                    {/* Main Content Grid */}
                    <div className="flex-1">
                        {/* Mobile Toggle */}
                        <div className="lg:hidden mb-6 sticky top-20 z-30 pointer-events-none">
                            <div className="bg-white/90 backdrop-blur-xl border border-gray-100/50 p-2 rounded-2xl shadow-lg shadow-gray-200/50 pointer-events-auto mx-4 mt-2">
                                <button
                                    onClick={() => setShowMobileFilters(true)}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 active:scale-95 transition-all"
                                >
                                    <Filter size={18} />
                                    Filtrele ve Sırala
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                                    <div key={n} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
                                        <div className="bg-gray-100 rounded-xl aspect-[4/3] animate-pulse" />
                                        <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse" />
                                        <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse" />
                                    </div>
                                ))}
                            </div>
                        ) : salons.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm"
                            >
                                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Search className="w-10 h-10 text-indigo-300" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Sonuç bulunamadı</h3>
                                <p className="text-slate-500 mt-2 max-w-md mx-auto">Aradığınız kriterlere uygun salon bulamadık. Lütfen filtreleri değiştirerek tekrar deneyin.</p>
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                                {salons.map((salon, index) => {
                                    // Calculate Min Price
                                    const prices = salon.services?.map(s => parseFloat(s.price)) || [];
                                    const minPrice = prices.length > 0 ? Math.min(...prices) : null;

                                    // Check Status (Real-time)
                                    let isOpen = false;
                                    try {
                                        if (salon.workingHours) {
                                            const hours = typeof salon.workingHours === 'string' ? JSON.parse(salon.workingHours) : salon.workingHours;
                                            const now = new Date();
                                            const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                                            const today = days[now.getDay()];

                                            const todayHours = hours[today];
                                            if (todayHours && todayHours.isOpen !== false) { // Check if explicitly closed
                                                const [startH, startM] = todayHours.start.split(':').map(Number);
                                                const [endH, endM] = todayHours.end.split(':').map(Number);

                                                const currentMinutes = now.getHours() * 60 + now.getMinutes();
                                                const startMinutes = startH * 60 + startM;
                                                const endMinutes = endH * 60 + endM;

                                                if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
                                                    isOpen = true;
                                                }
                                            }
                                        }
                                    } catch (e) {
                                        console.warn('Error parsing working hours', e);
                                    }

                                    return (
                                        <motion.div
                                            key={salon.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.4, delay: index * 0.05 }}
                                        >
                                            <Link
                                                to={`/salon/${salon.id}`}
                                                className="group block bg-white border border-gray-100 rounded-[24px] overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-500 relative h-full flex flex-col"
                                            >
                                                {/* Image Container */}
                                                <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 opacity-60" />
                                                    <img
                                                        src={salon.image || `https://source.unsplash.com/random/800x600/?beauty_salon,hair_${salon.id}`}
                                                        alt={salon.name}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                        onError={(e) => { e.target.src = 'https://source.unsplash.com/random/800x600/?beauty_salon'; }} // Fallback
                                                    />

                                                    {/* Open Status Badge */}
                                                    {salon.workingHours && (
                                                        <div className="absolute top-4 left-4 z-20 flex gap-2">
                                                            <span className={`backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm border ${isOpen ? 'bg-emerald-500/90 border-emerald-400/20' : 'bg-red-500/90 border-red-400/20'}`}>
                                                                {isOpen ? 'AÇIK' : 'KAPALI'}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Rating Badge */}
                                                    <div className="absolute top-4 right-4 z-20">
                                                        <div className="bg-white/95 backdrop-blur-md pl-2 pr-3 py-1 rounded-full text-xs font-bold text-slate-900 shadow-xl flex items-center gap-1.5 box-border border-2 border-white/20">
                                                            <Star className={`w-3 h-3 ${salon.rating > 0 ? 'text-orange-400 fill-orange-400' : 'text-gray-300'}`} />
                                                            {salon.rating ? salon.rating.toFixed(1) : 'Yeni'}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Content Body */}
                                                <div className="p-5 flex flex-col flex-1 ">
                                                    {/* Header & Location */}
                                                    <div className="mb-4">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h3 className="font-serif font-bold text-slate-900 text-xl group-hover:text-indigo-600 transition-colors line-clamp-1">
                                                                {salon.name}
                                                            </h3>
                                                            <Shield className="w-4 h-4 text-sky-500 fill-sky-500/20" />
                                                        </div>
                                                        <div className="flex items-center text-xs text-slate-500 font-medium">
                                                            <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                                                            {salon.district ? `${salon.district}, ${salon.city}` : salon.city}
                                                        </div>
                                                    </div>

                                                    {/* Middle: Staff & Price */}
                                                    <div className="flex items-center justify-between mb-5 pb-5 border-b border-gray-50 border-dashed">
                                                        {/* Real Staff Avatars or Count */}
                                                        <div className="flex items-center -space-x-2">
                                                            {salon.professionals && salon.professionals.length > 0 ? (
                                                                <>
                                                                    {salon.professionals.slice(0, 3).map((pro, i) => (
                                                                        <div key={pro.id || i} className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 overflow-hidden relative" title={pro.name}>
                                                                            {pro.photo ? (
                                                                                <img
                                                                                    src={pro.photo}
                                                                                    alt={pro.name}
                                                                                    className="w-full h-full object-cover"
                                                                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                                                />
                                                                            ) : null}
                                                                            <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-700 text-[9px] font-bold absolute inset-0 -z-10" style={{ display: pro.photo ? 'none' : 'flex' }}>
                                                                                {pro.name ? pro.name.charAt(0) : 'U'}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                    {salon.professionals.length > 3 && (
                                                                        <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-[9px] font-bold text-slate-500">
                                                                            +{salon.professionals.length - 3}
                                                                        </div>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <span className="text-xs text-slate-400 font-medium italic">Henüz ekip yok</span>
                                                            )}
                                                        </div>

                                                        {/* Real Min Price Badge */}
                                                        {minPrice !== null && (
                                                            <div className="text-right">
                                                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Başlangıç</p>
                                                                <p className="text-sm font-bold text-indigo-600">{minPrice} ₺</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Bottom: Services & Button */}
                                                    <div className="flex items-center justify-between mt-auto gap-3">
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {salon.services?.slice(0, 2).map((s, i) => (
                                                                <span key={i} className="text-[10px] font-semibold px-2 py-1 bg-indigo-50/50 text-indigo-700 rounded-md border border-indigo-100/50">
                                                                    {s.name}
                                                                </span>
                                                            ))}
                                                        </div>

                                                        <button className="bg-slate-900 text-white p-2.5 rounded-xl shadow-lg shadow-slate-900/10 hover:bg-indigo-600 hover:shadow-indigo-600/20 transition-all active:scale-95 group-hover:scale-110">
                                                            <ArrowRight size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchPage;
