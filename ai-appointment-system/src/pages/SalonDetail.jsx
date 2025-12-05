import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin,
    Phone,
    Clock,
    Star,
    Scissors,
    Calendar,
    ChevronLeft,
    CheckCircle2,
    Instagram,
    Globe,
    User,
    ArrowRight
} from 'lucide-react';
import { useSalon } from '../hooks/useData';

const SalonDetail = () => {
    const { id } = useParams();
    const { data: salon, isLoading } = useSalon(id);
    const [selectedService, setSelectedService] = useState(null);
    const [activeTab, setActiveTab] = useState('services');

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!salon) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Salon Bulunamadı</h2>
                <Link to="/search" className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors">
                    Aramaya Dön
                </Link>
            </div>
        );
    }

    const workingHours = salon.workingHours ? JSON.parse(salon.workingHours) : null;
    const days = [
        { key: 'monday', label: 'Pazartesi' },
        { key: 'tuesday', label: 'Salı' },
        { key: 'wednesday', label: 'Çarşamba' },
        { key: 'thursday', label: 'Perşembe' },
        { key: 'friday', label: 'Cuma' },
        { key: 'saturday', label: 'Cumartesi' },
        { key: 'sunday', label: 'Pazar' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Hero Section */}
            <div className="relative h-[500px] lg:h-[600px] bg-slate-900 overflow-hidden">
                {salon.image ? (
                    <motion.img
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 1.5 }}
                        src={salon.image}
                        alt={salon.name}
                        className="w-full h-full object-cover opacity-50"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-indigo-900 opacity-90" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />

                {/* Navigation Back */}
                <div className="absolute top-24 left-4 lg:left-8 z-10">
                    <Link to="/search" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 hover:bg-white/20">
                        <ChevronLeft className="w-5 h-5" />
                        <span>Geri Dön</span>
                    </Link>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-12 z-10">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col lg:flex-row items-end justify-between gap-8"
                        >
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                    {salon.isContracted && (
                                        <span className="bg-amber-400 text-slate-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-slate-900" />
                                            Premium Salon
                                        </span>
                                    )}
                                    <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                        <span className="font-bold text-white">{salon.rating}</span>
                                        <span className="text-white/60 text-sm">({salon.reviewCount} değerlendirme)</span>
                                    </div>
                                </div>

                                <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4 leading-tight">
                                    {salon.name}
                                </h1>

                                <div className="flex flex-wrap items-center gap-6 text-white/80 text-lg">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-indigo-400" />
                                        <span>{salon.district}, {salon.city}</span>
                                    </div>
                                    {salon.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-5 h-5 text-indigo-400" />
                                            <span>{salon.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4 w-full lg:w-auto">
                                <button className="flex-1 lg:flex-none btn-primary px-8 py-4 text-lg shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2 hover:scale-105 transition-transform">
                                    <Calendar className="w-5 h-5" />
                                    Hemen Randevu Al
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* Tabs */}
                        <div className="flex gap-4 border-b border-slate-200 pb-1 overflow-x-auto">
                            {['services', 'about', 'team', 'reviews'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-3 font-medium text-sm transition-all relative whitespace-nowrap ${activeTab === tab
                                            ? 'text-indigo-600'
                                            : 'text-slate-500 hover:text-slate-900'
                                        }`}
                                >
                                    {tab === 'services' && 'Hizmetler & Fiyatlar'}
                                    {tab === 'about' && 'Hakkında'}
                                    {tab === 'team' && 'Uzman Kadro'}
                                    {tab === 'reviews' && 'Değerlendirmeler'}

                                    {activeTab === tab && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <AnimatePresence mode="wait">
                            {activeTab === 'services' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                            <h3 className="font-serif font-bold text-xl text-slate-900">Hizmet Menüsü</h3>
                                        </div>
                                        {salon.services?.length > 0 ? (
                                            <div className="divide-y divide-slate-100">
                                                {salon.services.map((service) => (
                                                    <div
                                                        key={service.id}
                                                        className="p-6 hover:bg-slate-50 transition-all flex items-center justify-between group cursor-pointer"
                                                        onClick={() => setSelectedService(service.id === selectedService ? null : service.id)}
                                                    >
                                                        <div className="flex items-center gap-5">
                                                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                                                <Scissors className="w-6 h-6" />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{service.name}</h3>
                                                                <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                                                    <span className="flex items-center gap-1">
                                                                        <Clock className="w-3 h-3" />
                                                                        {service.duration} dk
                                                                    </span>
                                                                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                                    <span>Kadın / Erkek</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-6">
                                                            <span className="font-bold text-xl text-slate-900">{service.price} ₺</span>
                                                            <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:border-indigo-600 hover:text-white transition-all">
                                                                <ArrowRight className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-12 text-center text-slate-500">
                                                Henüz hizmet eklenmemiş.
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'about' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100"
                                >
                                    <h3 className="font-serif font-bold text-2xl text-slate-900 mb-6">Salon Hakkında</h3>
                                    <p className="text-slate-600 leading-relaxed text-lg font-light">
                                        {salon.description || 'Bu salon için henüz detaylı açıklama girilmemiş.'}
                                    </p>

                                    <div className="mt-8 flex gap-4">
                                        {salon.instagram && (
                                            <a href={`https://instagram.com/${salon.instagram}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 bg-pink-50 text-pink-600 rounded-xl font-medium hover:bg-pink-100 transition-colors">
                                                <Instagram className="w-5 h-5" />
                                                <span>Instagram'da Takip Et</span>
                                            </a>
                                        )}
                                        {salon.website && (
                                            <a href={salon.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-medium hover:bg-indigo-100 transition-colors">
                                                <Globe className="w-5 h-5" />
                                                <span>Web Sitesini Ziyaret Et</span>
                                            </a>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'team' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        {salon.professionals?.map((pro) => (
                                            <div key={pro.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 hover:border-indigo-200 transition-all group hover:shadow-lg hover:shadow-indigo-900/5">
                                                <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden relative">
                                                    {pro.photo ? (
                                                        <img src={pro.photo} alt={pro.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-600">
                                                            <User className="w-8 h-8" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{pro.name}</h3>
                                                    <p className="text-indigo-600 font-medium text-sm bg-indigo-50 px-3 py-1 rounded-full w-fit">{pro.title}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Location Card */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-lg">
                                <MapPin className="w-5 h-5 text-indigo-600" />
                                Konum
                            </h3>
                            <p className="text-slate-600 mb-6 leading-relaxed">{salon.address}</p>
                            <div className="h-48 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-200 relative overflow-hidden group cursor-pointer">
                                <div className="absolute inset-0 bg-slate-200 group-hover:scale-110 transition-transform duration-700" />
                                <span className="relative z-10 font-medium bg-white/80 backdrop-blur px-4 py-2 rounded-lg shadow-sm">Haritada Göster</span>
                            </div>
                        </div>

                        {/* Working Hours Card */}
                        {workingHours && (
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2 text-lg">
                                    <Clock className="w-5 h-5 text-indigo-600" />
                                    Çalışma Saatleri
                                </h3>
                                <div className="space-y-4">
                                    {days.map((day) => {
                                        const hours = workingHours[day.key];
                                        const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() === day.key;

                                        return (
                                            <div key={day.key} className={`flex justify-between items-center text-sm p-2 rounded-lg ${isToday ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600'}`}>
                                                <span>{day.label}</span>
                                                <span className="font-medium">
                                                    {hours?.closed ? (
                                                        <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded text-xs">Kapalı</span>
                                                    ) : (
                                                        `${hours?.start} - ${hours?.end}`
                                                    )}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SalonDetail;
