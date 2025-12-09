import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Filter, ArrowRight, ChevronDown } from 'lucide-react';
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
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Top Bar - Minimal */}
            <div className="border-b border-gray-100 bg-white sticky top-0 z-40">
                <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">İsteklerinize Özel Salonlar Bulun</h1>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>{salons.length} işletme listeleniyor</span>
                    </div>
                </div>
            </div>

            <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Filters Sidebar - Shopier Style */}
                    <aside className={`lg:w-80 flex-shrink-0 ${showMobileFilters ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto' : 'hidden lg:block'}`}>
                        {showMobileFilters && (
                            <div className="flex justify-between items-center mb-6 lg:hidden">
                                <h2 className="text-xl font-bold">Filtrele</h2>
                                <button onClick={() => setShowMobileFilters(false)} className="p-2 bg-gray-100 rounded-full">
                                    <Filter size={20} />
                                </button>
                            </div>
                        )}

                        <div className="space-y-8 sticky top-24 bg-white border border-gray-100 shadow-xl shadow-gray-200/50 rounded-2xl p-6">
                            {/* Search Input */}
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="Salon veya hizmet ara..."
                                    value={filters.query}
                                    onChange={(e) => handleFilterChange('query', e.target.value)}
                                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3.5 pl-11 text-sm font-medium text-slate-700 outline-none transition-all duration-300 hover:border-gray-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-gray-400"
                                />
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                            </div>

                            {/* Location Filter */}
                            <div className="border-b border-gray-100 pb-6">
                                <button
                                    onClick={() => toggleSection('location')}
                                    className="flex items-center justify-between w-full font-bold text-xs uppercase tracking-widest mb-4 text-slate-400 hover:text-indigo-600 transition-colors"
                                >
                                    Konum
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${openSections.location ? 'rotate-180' : ''}`} />
                                </button>
                                {openSections.location && (
                                    <div className="space-y-3 animation-slide-down">
                                        <div className="relative">
                                            <select
                                                value={filters.city}
                                                onChange={(e) => {
                                                    handleFilterChange('city', e.target.value);
                                                    handleFilterChange('district', '');
                                                }}
                                                className="w-full p-3.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-medium text-slate-700 cursor-pointer outline-none appearance-none transition-all duration-300 hover:border-gray-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-50"
                                            >
                                                <option value="">Tüm Şehirler</option>
                                                {cities.map(city => (
                                                    <option key={city.name} value={city.name}>{city.name}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                <ChevronDown size={16} strokeWidth={2.5} />
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <select
                                                value={filters.district}
                                                onChange={(e) => handleFilterChange('district', e.target.value)}
                                                disabled={!filters.city}
                                                className="w-full p-3.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-medium text-slate-700 cursor-pointer outline-none appearance-none transition-all duration-300 hover:border-gray-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <option value="">Tüm İlçeler</option>
                                                {filters.city && cities.find(c => c.name === filters.city)?.districts.map(dist => (
                                                    <option key={dist} value={dist}>{dist}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                <ChevronDown size={16} strokeWidth={2.5} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Price Filter */}
                            <div className="border-b border-gray-100 pb-6">
                                <button
                                    onClick={() => toggleSection('price')}
                                    className="flex items-center justify-between w-full font-bold text-xs uppercase tracking-widest mb-4 text-slate-400 hover:text-indigo-600 transition-colors"
                                >
                                    Fiyat Aralığı
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${openSections.price ? 'rotate-180' : ''}`} />
                                </button>
                                {openSections.price && (
                                    <div className="flex items-center gap-2 animation-slide-down">
                                        <input
                                            type="number"
                                            placeholder="Min TL"
                                            value={filters.minPrice}
                                            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                            className="w-full p-3.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-medium outline-none transition-all duration-300 hover:border-gray-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                                        />
                                        <span className="text-gray-400 font-medium">-</span>
                                        <input
                                            type="number"
                                            placeholder="Max TL"
                                            value={filters.maxPrice}
                                            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                            className="w-full p-3.5 bg-slate-50 border border-gray-200 rounded-xl text-sm font-medium outline-none transition-all duration-300 hover:border-gray-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Category Filter - Button List Style */}
                            <div className="border-b border-gray-100 pb-6">
                                <button
                                    onClick={() => toggleSection('category')}
                                    className="flex items-center justify-between w-full font-bold text-xs uppercase tracking-widest mb-4 text-slate-400 hover:text-indigo-600 transition-colors"
                                >
                                    Kategori
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${openSections.category ? 'rotate-180' : ''}`} />
                                </button>
                                {openSections.category && (
                                    <div className="space-y-2 animation-slide-down">
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
                                                className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200 text-sm font-medium ${filters.serviceCategory === cat.id ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'text-slate-600 hover:bg-slate-100'}`}
                                            >
                                                <div className={`w-2 h-2 rounded-full ${filters.serviceCategory === cat.id ? 'bg-indigo-400' : 'bg-slate-300'}`} />
                                                {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Reset Button */}
                            {Object.values(filters).some(x => x) && (
                                <button
                                    onClick={() => setFilters({ query: '', city: '', district: '', serviceCategory: '', minPrice: '', maxPrice: '' })}
                                    className="w-full py-3.5 text-sm font-bold text-red-600 border border-red-100 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                                >
                                    Filtreleri Temizle
                                </button>
                            )}
                        </div>
                    </aside>

                    {/* Main Content Grid */}
                    <div className="flex-1">
                        {/* Mobile Toggle */}
                        <div className="lg:hidden mb-6 sticky top-20 z-30 bg-white/80 backdrop-blur-md py-4 -mx-4 px-4 border-b border-gray-100">
                            <button
                                onClick={() => setShowMobileFilters(true)}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 active:scale-95 transition-all"
                            >
                                <Filter size={18} />
                                Filtrele ve Sırala
                            </button>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                                    <div key={n} className="animate-pulse bg-white rounded-2xl border border-gray-100 overflow-hidden">
                                        <div className="bg-gray-200 aspect-square" />
                                        <div className="p-5 space-y-3">
                                            <div className="h-5 bg-gray-200 rounded w-3/4" />
                                            <div className="h-4 bg-gray-200 rounded w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : salons.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-8 h-8 text-gray-300" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">Sonuç bulunamadı</h3>
                                <p className="text-slate-500 mt-2">Arama kriterlerinizi değiştirerek tekrar deneyebilirsiniz.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {salons.map((salon) => (
                                    <Link
                                        to={`/salon/${salon.id}`}
                                        key={salon.id}
                                        className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative"
                                    >
                                        <div className="relative aspect-square bg-gray-100 overflow-hidden">
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors z-10" />
                                            <img
                                                src={salon.image || `https://source.unsplash.com/random/800x800/?salon,beauty,${salon.id}`}
                                                alt={salon.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            {/* Rating Badge */}
                                            <div className="absolute top-3 right-3 z-20 bg-white/95 backdrop-blur px-2.5 py-1 rounded-full text-xs font-bold text-slate-900 shadow-sm flex items-center gap-1">
                                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                {salon.rating || 'Yeni'}
                                            </div>
                                        </div>

                                        <div className="p-5">
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-indigo-600 transition-colors line-clamp-1">
                                                    {salon.name}
                                                </h3>
                                            </div>

                                            <div className="flex items-center text-sm text-slate-500 mb-4">
                                                <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                                <span className="line-clamp-1">{salon.district}, {salon.city}</span>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {salon.services?.slice(0, 2).map((s, i) => (
                                                    <span key={i} className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 bg-slate-50 text-slate-600 rounded-lg border border-slate-100 group-hover:border-indigo-100 group-hover:text-indigo-600 transition-colors">
                                                        {s.name}
                                                    </span>
                                                ))}
                                                {salon.services?.length > 2 && (
                                                    <span className="text-[10px] font-bold px-2 py-1 bg-slate-50 text-slate-400 rounded-lg border border-slate-100">
                                                        +{salon.services.length - 2}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchPage;
