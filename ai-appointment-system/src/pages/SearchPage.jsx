import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Filter, ArrowRight, Scissors, SlidersHorizontal, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const SearchPage = () => {
    const [salons, setSalons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [filters, setFilters] = useState({
        query: '',
        city: '',
        serviceCategory: '',
        minPrice: '',
        maxPrice: ''
    });

    useEffect(() => {
        fetchSalons();
    }, []);

    const fetchSalons = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(filters);
            for (const [key, value] of params.entries()) {
                if (!value) params.delete(key);
            }
            // Simulate API delay for smooth transition feel
            // await new Promise(resolve => setTimeout(resolve, 800)); 

            const response = await fetch(`http://localhost:5000/api/salons/search?${params.toString()}`);
            const data = await response.json();
            setSalons(data);
        } catch (error) {
            console.error('Error fetching salons:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchSalons();
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-20 pb-20">
            {/* Header Section */}
            <div className="bg-white border-b border-slate-200 mb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl"
                    >
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-4">
                            Size En Uygun <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Kuaförü Bulun</span>
                        </h1>
                        <p className="text-lg text-slate-600 font-light">
                            Binlerce seçkin salon arasından tarzınıza, bütçenize ve konumunuza en uygun olanı keşfedin.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Mobile Filter Toggle */}
                    <button
                        className="lg:hidden flex items-center justify-center gap-2 bg-white p-4 rounded-xl shadow-sm border border-slate-200 font-medium text-slate-700"
                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                    >
                        <SlidersHorizontal className="w-5 h-5" />
                        Filtreleri Göster
                    </button>

                    {/* Filters Sidebar */}
                    <motion.div
                        className={`lg:w-1/4 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-24">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                                    <Filter className="w-5 h-5 text-indigo-600" />
                                    <span>Filtreler</span>
                                </div>
                                {Object.values(filters).some(x => x) && (
                                    <button
                                        onClick={() => {
                                            setFilters({ query: '', city: '', serviceCategory: '', minPrice: '', maxPrice: '' });
                                            fetchSalons();
                                        }}
                                        className="text-xs text-red-500 hover:text-red-700 font-medium"
                                    >
                                        Temizle
                                    </button>
                                )}
                            </div>

                            <form onSubmit={handleSearch} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Arama</label>
                                    <div className="relative group">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                        <input
                                            type="text"
                                            name="query"
                                            value={filters.query}
                                            onChange={handleFilterChange}
                                            placeholder="Salon adı ara..."
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Şehir</label>
                                    <select
                                        name="city"
                                        value={filters.city}
                                        onChange={handleFilterChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-sm appearance-none cursor-pointer"
                                    >
                                        <option value="">Tüm Şehirler</option>
                                        <option value="İstanbul">İstanbul</option>
                                        <option value="Ankara">Ankara</option>
                                        <option value="İzmir">İzmir</option>
                                        <option value="Bursa">Bursa</option>
                                        <option value="Antalya">Antalya</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Hizmet Kategorisi</label>
                                    <div className="space-y-2">
                                        {[
                                            { id: '', label: 'Tümü' },
                                            { id: 'hair', label: 'Saç Tasarım' },
                                            { id: 'makeup', label: 'Makyaj' },
                                            { id: 'skincare', label: 'Cilt Bakımı' },
                                            { id: 'nails', label: 'Tırnak Bakımı' }
                                        ].map(category => (
                                            <label key={category.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${filters.serviceCategory === category.id ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                                                    {filters.serviceCategory === category.id && <Check className="w-3 h-3 text-white" />}
                                                </div>
                                                <input
                                                    type="radio"
                                                    name="serviceCategory"
                                                    value={category.id}
                                                    checked={filters.serviceCategory === category.id}
                                                    onChange={handleFilterChange}
                                                    className="hidden"
                                                />
                                                <span className={`text-sm ${filters.serviceCategory === category.id ? 'font-medium text-indigo-700' : 'text-slate-600'}`}>
                                                    {category.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Fiyat Aralığı</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            name="minPrice"
                                            value={filters.minPrice}
                                            onChange={handleFilterChange}
                                            placeholder="Min"
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-sm"
                                        />
                                        <span className="text-slate-400">-</span>
                                        <input
                                            type="number"
                                            name="maxPrice"
                                            value={filters.maxPrice}
                                            onChange={handleFilterChange}
                                            placeholder="Max"
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-sm"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-indigo-600 transition-all shadow-lg shadow-slate-900/20 active:scale-95"
                                >
                                    Sonuçları Filtrele
                                </button>
                            </form>
                        </div>
                    </motion.div>

                    {/* Results Grid */}
                    <div className="w-full lg:w-3/4">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="bg-white rounded-2xl p-4 h-96 animate-pulse border border-slate-100">
                                        <div className="w-full h-48 bg-slate-200 rounded-xl mb-4"></div>
                                        <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                                        <div className="space-y-2">
                                            <div className="h-4 bg-slate-200 rounded w-full"></div>
                                            <div className="h-4 bg-slate-200 rounded w-full"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : salons.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                    <Scissors className="w-10 h-10 text-slate-300" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Sonuç Bulunamadı</h3>
                                <p className="text-slate-500 text-center max-w-md">
                                    Arama kriterlerinize uygun salon bulamadık. Lütfen filtreleri değiştirip tekrar deneyin.
                                </p>
                                <button
                                    onClick={() => {
                                        setFilters({ query: '', city: '', serviceCategory: '', minPrice: '', maxPrice: '' });
                                        fetchSalons();
                                    }}
                                    className="mt-6 text-indigo-600 font-medium hover:underline"
                                >
                                    Filtreleri Temizle
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {salons.map((salon, index) => (
                                    <motion.div
                                        key={salon.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-300 group flex flex-col"
                                    >
                                        {/* Salon Image */}
                                        <div className="h-56 bg-slate-200 relative overflow-hidden">
                                            {salon.image ? (
                                                <img
                                                    src={salon.image}
                                                    alt={salon.name}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-100">
                                                    <Scissors className="w-12 h-12 text-slate-300" />
                                                </div>
                                            )}

                                            {/* Badges */}
                                            <div className="absolute top-4 left-4 flex gap-2">
                                                {salon.isContracted && (
                                                    <span className="bg-white/90 backdrop-blur-sm text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                                                        <Star className="w-3 h-3 fill-indigo-700" />
                                                        Premium
                                                    </span>
                                                )}
                                            </div>

                                            <div className="absolute bottom-4 right-4">
                                                <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1">
                                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                    <span className="font-bold text-slate-900">{salon.rating}</span>
                                                    <span className="text-xs text-slate-500">({salon.reviewCount})</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="mb-4">
                                                <h3 className="text-xl font-serif font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                                                    {salon.name}
                                                </h3>
                                                <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                                                    <MapPin className="w-4 h-4 text-slate-400" />
                                                    <span>{salon.district}, {salon.city}</span>
                                                </div>
                                            </div>

                                            {/* Services Preview */}
                                            <div className="space-y-2 mb-6 flex-1">
                                                {salon.services.slice(0, 3).map(service => (
                                                    <div key={service.id} className="flex justify-between items-center text-sm p-2 rounded-lg bg-slate-50 group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-slate-100">
                                                        <span className="text-slate-700 font-medium">{service.name}</span>
                                                        <span className="text-indigo-600 font-bold">{service.price} ₺</span>
                                                    </div>
                                                ))}
                                                {salon.services.length > 3 && (
                                                    <p className="text-xs text-center text-slate-400 font-medium mt-2">
                                                        + {salon.services.length - 3} diğer hizmet
                                                    </p>
                                                )}
                                            </div>

                                            <Link
                                                to={`/salon/${salon.id}`}
                                                className="w-full py-3 rounded-xl border-2 border-slate-900 text-slate-900 font-bold flex items-center justify-center gap-2 hover:bg-slate-900 hover:text-white transition-all group-hover:shadow-lg group-hover:shadow-indigo-500/20"
                                            >
                                                Randevu Al
                                                <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </motion.div>
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
