import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSalon } from '../hooks/useData';
import { useFavorites } from '../context/FavoritesContext';
import { MapPin, Phone, Star, Clock, Heart, Shield, CheckCircle2, User, Scissors, Globe } from 'lucide-react';
import PublicBookingModal from '../components/PublicBookingModal';
import ChatWidget from '../components/Chat/ChatWidget';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const SalonDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const { data: salon, isLoading } = useSalon(id);
    const { isFavorite, toggleFavorite } = useFavorites();
    const [selectedService, setSelectedService] = useState(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('reviews'); // Default to reviews to match screenshot initially, or 'services'
    const [reviews, setReviews] = useState([]);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '', userName: '' });

    useEffect(() => {
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
            console.error('Yorumlar yüklenirken hata:', error);
        }
    };

    const handleBookClick = (service) => {
        setSelectedService(service.id);
        setIsBookingModalOpen(true);
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
                fetchReviews();
                setIsReviewModalOpen(false);
                setNewReview({ rating: 5, comment: '', userName: '' });
                toast.success('Değerlendirmeniz alındı!');
            }
        } catch (error) {
            toast.error('Hata oluştu.');
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Yükleniyor...</div>;
    if (!salon) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Salon bulunamadı.</div>;

    const tabs = [
        { id: 'services', label: 'Hizmetler & Fiyatlar' },
        { id: 'about', label: 'Hakkında' },
        { id: 'team', label: 'Uzman Kadro' },
        { id: 'reviews', label: 'Değerlendirmeler' }
    ];

    return (
        <div className="min-h-screen bg-[#F8F9FC] font-sans text-slate-800">
            {/* Header / Top Bar */}
            {/* Hero Header with Background Image */}
            <div className="relative w-full h-[400px] bg-slate-900 group">
                {salon.image ? (
                    <img
                        src={salon.image}
                        alt={salon.name}
                        className="w-full h-full object-cover opacity-70"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800"></div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#F8F9FC] via-slate-900/50 to-transparent"></div>

                {/* Top Navigation Bar */}
                <div className="absolute top-0 left-0 right-0 p-6 z-10">
                    <div className="max-w-7xl mx-auto flex justify-between items-start">
                        <Link to="/search" className="text-white/90 hover:text-white flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full backdrop-blur-md transition-all hover:bg-black/30 text-sm font-medium border border-white/10">
                            &larr; Geri Dön
                        </Link>
                        <button onClick={() => toggleFavorite(salon)} className="bg-black/20 p-3 rounded-full backdrop-blur-md hover:bg-white/10 transition-colors border border-white/10 group-fav">
                            <Heart className={`w-6 h-6 ${isFavorite(salon.id) ? 'fill-red-500 text-red-500' : 'text-white group-fav-hover:scale-110 transition-transform'}`} />
                        </button>
                    </div>
                </div>

                {/* Salon Info (Bottom Left of Header) */}
                <div className="absolute bottom-0 left-0 right-0 pb-12 pt-32">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="animate-fade-in-up">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="bg-white/10 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border border-white/10">
                                        Premium Salon
                                    </span>
                                    {salon.rating > 0 && (
                                        <div className="flex items-center gap-1 bg-amber-400 text-slate-900 px-2 py-1 rounded-lg font-bold text-xs shadow-lg shadow-amber-400/20">
                                            <Star className="w-3 h-3 fill-current" /> {salon.rating}
                                        </div>
                                    )}
                                </div>
                                <h1 className="text-4xl md:text-6xl font-bold text-slate-800 mb-2 font-serif tracking-tight drop-shadow-sm">{salon.name}</h1>

                                <div className="flex flex-wrap items-center gap-6 text-slate-600 text-sm font-medium">
                                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-indigo-600" /> {salon.district}, {salon.city}</span>
                                    {salon.phone && <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-indigo-600" /> {salon.phone}</span>}
                                    <span className="flex items-center gap-1.5 text-emerald-600"><CheckCircle2 className="w-4 h-4" /> Doğrulanmış İşletme</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Tabs */}
                <div className="flex space-x-8 border-b border-gray-200 mb-8 overflow-x-auto no-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-4 text-sm font-medium transition-colors whitespace-nowrap relative ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTabUnderline"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"
                                />
                            )}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area (Left) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Services Content */}
                        {activeTab === 'services' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-xl font-bold text-slate-900 mb-6">Hizmetlerimiz</h2>
                                <div className="space-y-4">
                                    {salon.services?.map(service => (
                                        <div key={service.id} className="flex justify-between items-center p-4 border border-gray-100 rounded-xl hover:border-indigo-100 hover:bg-indigo-50/30 transition-all cursor-pointer" onClick={() => handleBookClick(service)}>
                                            <div>
                                                <h3 className="font-bold text-slate-800">{service.name}</h3>
                                                <div className="text-sm text-slate-500 mt-1 flex items-center">
                                                    <Clock className="w-3.5 h-3.5 mr-1" /> {service.duration} dk
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-indigo-600 text-lg">{service.price} ₺</div>
                                                <button className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mt-1">Randevu Al</button>
                                            </div>
                                        </div>
                                    ))}
                                    {!salon.services?.length && <div className="text-slate-400 text-center py-8">Hizmet bulunamadı.</div>}
                                </div>
                            </div>
                        )}

                        {/* Reviews Content (Matches Screenshot) */}
                        {activeTab === 'reviews' && (
                            <div className="space-y-6">
                                {/* Summary Card */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex justify-between items-center">
                                    <div>
                                        <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Değerlendirmeler</h2>
                                        <div className="flex items-center gap-2">
                                            <div className="flex text-amber-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`w-5 h-5 ${i < Math.round(salon.rating) ? 'fill-current' : 'text-gray-200'}`} />
                                                ))}
                                            </div>
                                            <span className="font-bold text-slate-900 text-lg">{salon.rating}</span>
                                            <span className="text-slate-400">({salon.reviewCount ?? reviews.length} yorum)</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsReviewModalOpen(true)}
                                        className="bg-[#0F172A] text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
                                    >
                                        Yorum Yap
                                    </button>
                                </div>

                                {/* Review List */}
                                <div className="space-y-4">
                                    {reviews.map(review => (
                                        <div key={review.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
                                                        {review.userName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900">{review.userName}</h4>
                                                        <span className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString('tr-TR')}</span>
                                                    </div>
                                                </div>
                                                <div className="flex text-amber-400">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-slate-600 leading-relaxed font-light">
                                                {review.comment}
                                            </p>
                                        </div>
                                    ))}
                                    {!reviews.length && <div className="text-center text-slate-400 py-8">Henüz yorum yok.</div>}
                                </div>
                            </div>
                        )}

                        {/* About, Team place holders for structure */}
                        {activeTab === 'about' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">Hakkında</h2>
                                <p className="text-slate-600 leading-relaxed">{salon.description}</p>
                            </div>
                        )}

                        {activeTab === 'team' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">Uzman Kadro</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    {salon.professionals?.map(pro => (
                                        <div key={pro.id} className="text-center p-4 border border-gray-100 rounded-xl hover:shadow-lg transition-shadow bg-gray-50/50">
                                            <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm relative">
                                                {pro.photo ? (
                                                    <img
                                                        src={pro.photo}
                                                        alt={pro.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                    />
                                                ) : null}
                                                <div className={`absolute inset-0 bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-2xl ${pro.photo ? 'hidden' : 'flex'}`}>
                                                    {pro.name ? pro.name.charAt(0).toUpperCase() : <User />}
                                                </div>
                                            </div>
                                            <div className="font-bold text-slate-800">{pro.name}</div>
                                            <div className="text-sm text-slate-500 font-medium">{pro.title}</div>
                                        </div>
                                    ))}
                                    {!salon.professionals?.length && <div className="text-slate-400">Ekip bilgisi eklenmemiş.</div>}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar (Right) */}
                    <div className="space-y-6">
                        {/* Custom Card: Kurumsal Bilgiler */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-slate-400" />
                                Kurumsal Bilgiler
                            </h3>
                            <div className="bg-[#F8F9FC] rounded-xl p-8 flex flex-col items-center justify-center text-center">
                                <Shield className="w-12 h-12 text-slate-200 mb-2" />
                                <span className="text-slate-400 text-sm font-medium">Bu işletme henüz doğrulanmamış.</span>
                            </div>
                        </div>

                        {/* Custom Card: Konum */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-indigo-600" />
                                Konum
                            </h3>
                            <p className="text-slate-600 text-sm mb-4">
                                {salon.district}, {salon.city} <br />
                                <span className="text-slate-400 text-xs">{salon.address}</span>
                            </p>
                            <div className="bg-slate-200 w-full h-32 rounded-xl flex items-center justify-center relative overflow-hidden group cursor-pointer">
                                {/* Mock Map */}
                                <div className="absolute inset-0 bg-slate-300 opacity-50"></div>
                                <button className="relative bg-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm text-slate-700 hover:text-indigo-600 transition-colors">
                                    Haritada Göster
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <PublicBookingModal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                salon={salon}
                selectedService={selectedService}
            />

            {isReviewModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl relative">
                        <button onClick={() => setIsReviewModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">✕</button>
                        <h3 className="text-xl font-bold mb-6">Yorum Yap</h3>
                        <form onSubmit={handleSubmitReview} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Puan</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <button type="button" key={s} onClick={() => setNewReview({ ...newReview, rating: s })}>
                                            <Star className={`w-8 h-8 ${s <= newReview.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <input
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
                                placeholder="Adınız"
                                value={newReview.userName}
                                onChange={e => setNewReview({ ...newReview, userName: e.target.value })}
                            />
                            <textarea
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 h-24 resize-none"
                                placeholder="Yorumunuz..."
                                value={newReview.comment}
                                onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                            />
                            <button type="submit" className="w-full bg-[#0F172A] text-white py-3 rounded-xl font-bold">Gönder</button>
                        </form>
                    </div>
                </div>
            )}

            <ChatWidget
                salonId={salon.id}
                salonName={salon.name}
                user={user}
                whatsappEnabled={!!salon.whatsappPhoneId}
                salonPhone={salon.phone}
            />
        </div>
    );
};

export default SalonDetail;
