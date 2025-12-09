import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
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
    ArrowRight,
    Shield,
    Heart
} from 'lucide-react';
import { useSalon } from '../hooks/useData';
import { useFavorites } from '../context/FavoritesContext';
import PublicBookingModal from '../components/PublicBookingModal';
import ChatWindow from '../components/ChatWindow';

const SalonDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: salon, isLoading } = useSalon(id);
    const { isFavorite, toggleFavorite } = useFavorites();
    const [selectedService, setSelectedService] = useState(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('services');
    const [reviews, setReviews] = useState([]);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '', userName: '' });
    const [isChatOpen, setIsChatOpen] = useState(false);

    React.useEffect(() => {
        if (salon?.id) {
            fetchReviews();
        }
    }, [salon?.id]);

    const fetchReviews = async () => {
        try {
            const res = await fetch(`/api/reviews/${salon.id}`);
            if (res.ok) {
                const data = await res.json();
                setReviews(data);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    salonId: salon.id,
                    ...newReview
                })
            });

            if (res.ok) {
                fetchReviews(); // Refresh list
                setIsReviewModalOpen(false);
                setNewReview({ rating: 5, comment: '', userName: '' });
                // Optimistically update salon rating/count locally if needed, or re-fetch salon
                // For demo, just showing the review is enough.
            }
        } catch (error) {
            console.error('Submit review error:', error);
        }
    };

    const handleBookClick = (serviceId = null) => {
        if (serviceId) setSelectedService(serviceId);
        setIsBookingModalOpen(true);
    };

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
                                <button
                                    onClick={() => handleBookClick()}
                                    className="flex-1 lg:flex-none btn-primary px-8 py-4 text-lg shadow-xl shadow-indigo-500/30 flex rounded-xl items-center justify-center gap-2 hover:scale-105 transition-transform text-white"
                                >
                                    <Calendar className="w-5 h-5" />
                                    Hemen Randevu Al
                                </button>
                                <button
                                    onClick={() => toggleFavorite(salon)}
                                    className={`px-4 py-4 backdrop-blur-md border rounded-xl transition-colors flex items-center justify-center ${isFavorite(salon.id) ? 'bg-white text-red-500 border-white' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}`}
                                >
                                    <Heart className={`w-6 h-6 ${isFavorite(salon.id) ? 'fill-current' : ''}`} />
                                </button>
                                <button
                                    onClick={() => {
                                        const token = localStorage.getItem('token');
                                        if (!token) {
                                            toast.error('Mesaj göndermek için giriş yapmalısınız.');
                                            navigate('/login');
                                            return;
                                        }
                                        setIsChatOpen(true);
                                    }}
                                    className="px-6 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl hover:bg-white/20 transition-colors flex items-center gap-2"
                                >
                                    <span className="font-bold">Mesaj Gönder</span>
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
                                                        onClick={() => handleBookClick(service.id)}
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

                            {activeTab === 'reviews' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                        <div>
                                            <h3 className="font-serif font-bold text-2xl text-slate-900">Değerlendirmeler</h3>
                                            <div className="flex items-center gap-2 mt-2">
                                                <div className="flex text-amber-400">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-5 h-5 ${i < Math.round(salon.rating) ? 'fill-current' : 'text-slate-200'}`} />
                                                    ))}
                                                </div>
                                                <span className="font-bold text-slate-900">{salon.rating}</span>
                                                <span className="text-slate-500">({salon.reviewCount} yorum)</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setIsReviewModalOpen(true)}
                                            className="px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-indigo-600 transition-colors shadow-lg shadow-slate-900/10"
                                        >
                                            Yorum Yap
                                        </button>
                                    </div>

                                    <div className="grid gap-6">
                                        {reviews.length > 0 ? (
                                            reviews.map((review) => (
                                                <div key={review.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                                                                {review.userName.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-slate-900">{review.userName}</h4>
                                                                <span className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString('tr-TR')}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex text-amber-400">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-slate-200'}`} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="text-slate-600 leading-relaxed">{review.comment}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
                                                <p className="text-slate-500">Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Business Verification Card */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <div className="flex items-center gap-2 mb-4">
                                <Shield className={`w-5 h-5 ${salon.isVerified ? 'text-emerald-500' : 'text-slate-400'}`} />
                                <h3 className="font-bold text-slate-900 text-lg">Kurumsal Bilgiler</h3>
                            </div>

                            {salon.isVerified ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg text-sm font-medium border border-emerald-100">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Onaylı İşletme
                                    </div>

                                    <div className="space-y-2 text-sm text-slate-600">
                                        {salon.ownerName && (
                                            <div className="flex justify-between border-b border-slate-50 pb-2">
                                                <span className="text-slate-400">Ünvan:</span>
                                                <span className="font-medium text-right">{salon.ownerName}</span>
                                            </div>
                                        )}
                                        {salon.taxOffice && (
                                            <div className="flex justify-between border-b border-slate-50 pb-2">
                                                <span className="text-slate-400">Vergi Dairesi:</span>
                                                <span className="font-medium text-right">{salon.taxOffice}</span>
                                            </div>
                                        )}
                                        {salon.taxNumber && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Vergi No:</span>
                                                <span className="font-medium text-right font-mono">{salon.taxNumber}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <Shield className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                    <p className="text-slate-400 text-sm">Bu işletme henüz doğrulanmamış.</p>
                                </div>
                            )}
                        </div>

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

            <PublicBookingModal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                salon={salon}
                selectedService={selectedService}
            />

            {/* Review Modal */}
            <AnimatePresence>
                {isReviewModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                            onClick={() => setIsReviewModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed inset-0 m-auto w-full max-w-md h-fit bg-white p-8 rounded-3xl shadow-2xl z-50 overflow-hidden"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-serif font-bold text-2xl text-slate-900">Değerlendirme Yap</h3>
                                <button onClick={() => setIsReviewModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    X
                                </button>
                            </div>

                            <form onSubmit={handleSubmitReview} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Puanınız</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setNewReview({ ...newReview, rating: star })}
                                                className="transition-transform hover:scale-110 focus:outline-none"
                                            >
                                                <Star
                                                    className={`w-8 h-8 ${star <= newReview.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                                                        }`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Adınız</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Adınız Soyadınız"
                                        value={newReview.userName}
                                        onChange={(e) => setNewReview({ ...newReview, userName: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Yorumunuz</label>
                                    <textarea
                                        required
                                        rows={4}
                                        placeholder="Deneyiminizi paylaşın..."
                                        value={newReview.comment}
                                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 text-lg"
                                >
                                    Gönder
                                </button>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Chat Modal */}
            <AnimatePresence>
                {isChatOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                            onClick={() => setIsChatOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-3xl shadow-2xl z-50 overflow-hidden"
                        >
                            <ChatWindow
                                salonId={salon.id}
                                salonName={salon.name}
                                onClose={() => setIsChatOpen(false)}
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SalonDetail;
