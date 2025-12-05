import React, { useState } from 'react';
import { Search, MapPin, Sparkles, TrendingUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Hero = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-50">
            {/* Background Gradients - Subtle & Clean */}
            <div className="absolute top-0 left-0 right-0 h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-slate-50 to-slate-50 -z-10" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-100/40 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-100/30 rounded-full blur-3xl -z-10" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex flex-col items-center text-center max-w-5xl mx-auto">

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full"
                    >
                        {/* Badge */}
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-indigo-100 text-indigo-600 rounded-full text-sm font-semibold mb-8 shadow-sm hover:shadow-md transition-shadow cursor-default">
                            <Sparkles className="w-4 h-4" />
                            Yapay Zeka Destekli Randevu Sistemi
                        </span>

                        {/* Headline */}
                        <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 leading-tight mb-6 font-serif tracking-tight">
                            Güzelliğinizi <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Keşfedin</span>
                        </h1>

                        {/* Subheadline */}
                        <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto font-light">
                            Şehrinizdeki en iyi kuaförleri ve güzellik merkezlerini bulun.
                            Yapay zeka ile size en uygun stili keşfedin.
                        </p>

                        {/* Search Box Container - Clean & Wide */}
                        <div className="bg-white p-2 rounded-[2.5rem] shadow-2xl shadow-indigo-900/10 border border-slate-200 max-w-5xl mx-auto relative">

                            {/* Inputs Row */}
                            <div className="flex flex-col md:flex-row items-center p-2 gap-2">
                                {/* Location Input */}
                                <div className="flex-1 w-full relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 group-focus-within:bg-indigo-600 group-focus-within:text-white transition-colors">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="İlçe veya semt..."
                                        className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white rounded-[2rem] pl-16 pr-6 py-5 outline-none text-slate-900 font-bold text-lg placeholder:text-slate-400 border border-transparent focus:border-indigo-100 focus:shadow-lg focus:shadow-indigo-500/5 transition-all"
                                    />
                                </div>

                                {/* Divider (Desktop) */}
                                <div className="hidden md:block w-px h-10 bg-slate-200 mx-1"></div>

                                {/* Search Input */}
                                <div className="flex-[1.5] w-full relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 group-focus-within:bg-indigo-600 group-focus-within:text-white transition-colors">
                                        <Search className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Salon adı, hizmet (örn: ombre)..."
                                        className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white rounded-[2rem] pl-16 pr-6 py-5 outline-none text-slate-900 font-bold text-lg placeholder:text-slate-400 border border-transparent focus:border-indigo-100 focus:shadow-lg focus:shadow-indigo-500/5 transition-all"
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                                    />
                                </div>

                                {/* Search Button */}
                                <button
                                    onClick={handleSearch}
                                    className="w-full md:w-auto bg-slate-900 text-white p-5 rounded-[2rem] hover:bg-indigo-600 hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-xl shadow-slate-900/20 hover:shadow-indigo-600/30 flex items-center justify-center gap-3 min-w-[140px]"
                                >
                                    <Search className="w-6 h-6" />
                                    <span className="font-bold text-lg">Ara</span>
                                </button>
                            </div>
                        </div>

                        {/* Popular Tags */}
                        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-500">
                            <span className="flex items-center gap-1 font-semibold text-slate-400">
                                <TrendingUp className="w-4 h-4" />
                                Popüler:
                            </span>
                            <Link to="/search?q=gelin-basi" className="px-4 py-1.5 bg-white border border-slate-200 rounded-full hover:border-indigo-300 hover:text-indigo-600 hover:shadow-sm transition-all">Gelin Başı</Link>
                            <Link to="/search?q=protez-tirnak" className="px-4 py-1.5 bg-white border border-slate-200 rounded-full hover:border-indigo-300 hover:text-indigo-600 hover:shadow-sm transition-all">Protez Tırnak</Link>
                            <Link to="/search?q=cilt-bakimi" className="px-4 py-1.5 bg-white border border-slate-200 rounded-full hover:border-indigo-300 hover:text-indigo-600 hover:shadow-sm transition-all">Cilt Bakımı</Link>
                        </div>

                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
