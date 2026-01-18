import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar'; // Adjust path if needed
import Footer from '../components/landing/Footer'; // Adjust path if needed
import { useAuth } from '../context/AuthContext';
import { Calendar, User, Clock, MapPin, Star, Heart, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';

const UserProfile = () => {
    const { user, logout, loading } = useAuth();
    const navigate = useNavigate();
    const { favorites, toggleFavorite } = useFavorites();
    const [activeTab, setActiveTab] = useState('appointments');
    const [appointments, setAppointments] = useState([]);



    // Mock Appointments for Demo (Since we might not have real ones yet or complicated DB fetch)
    // Ideally this should fetch from /api/appointments/my-appointments
    useEffect(() => {
        if (user) {
            if (user.role === 'admin' || user.role === 'SUPER_ADMIN') {
                navigate('/panel', { replace: true });
                return;
            }
            if (user.role === 'salon_owner' || user.role === 'SALON_OWNER') {
                navigate('/panel', { replace: true });
                return;
            }
        }

        // Simulating fetch
        const mockAppointments = [
            {
                id: 1,
                salonName: "Elite Güzellik Stüdyosu",
                service: "Saç Kesimi",
                date: "2024-12-10",
                time: "14:30",
                status: "confirmed",
                price: 150
            },
            {
                id: 2,
                salonName: "Kuaför Ahmet",
                service: "Sakal Tıraşı",
                date: "2024-12-05",
                time: "10:00",
                status: "completed",
                price: 80
            }
        ];
        setAppointments(mockAppointments);
    }, [user, navigate]);

    if (loading) return <div>Yükleniyor...</div>;

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <div className="flex-grow pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="lg:w-1/4">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 sticky top-24">
                            <div className="flex flex-col items-center mb-6">
                                <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-3xl font-bold mb-4">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
                                <p className="text-slate-500 text-sm">{user.email}</p>

                            </div>

                            <div className="space-y-2">
                                <button
                                    onClick={() => setActiveTab('appointments')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'appointments' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <Calendar className="w-5 h-5" />
                                    Randevularım
                                </button>
                                <button
                                    onClick={() => setActiveTab('favorites')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'favorites' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <Heart className="w-5 h-5" />
                                    Favorilerim
                                </button>
                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'settings' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <Settings className="w-5 h-5" />
                                    Hesap Ayarları
                                </button>
                                <hr className="my-2 border-slate-100" />
                                <button
                                    onClick={() => { logout(); navigate('/'); }}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    Çıkış Yap
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="lg:w-3/4">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 min-h-[500px] p-6">
                            {activeTab === 'appointments' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-6 font-serif">Randevularım</h3>
                                    <div className="space-y-4">
                                        {appointments.map(apt => (
                                            <div key={apt.id} className="border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                                                        <Calendar className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900">{apt.salonName}</h4>
                                                        <p className="text-slate-600">{apt.service}</p>
                                                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {apt.date} - {apt.time}</span>
                                                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> İstanbul</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 w-full md:w-auto">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${apt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                                                        {apt.status === 'confirmed' ? 'Onaylandı' : 'Tamamlandı'}
                                                    </span>
                                                    <span className="font-bold text-slate-900">{apt.price} ₺</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'favorites' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-6 font-serif">Favorilerim</h3>
                                    {favorites.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {favorites.map(fav => (
                                                <div key={fav.id} className="border border-slate-200 rounded-xl p-4 flex gap-4 hover:shadow-md transition-all">
                                                    <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden">
                                                        {fav.image ? (
                                                            <img src={fav.image} alt={fav.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                                <Heart className="w-6 h-6" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-slate-900">{fav.name}</h4>
                                                        <p className="text-sm text-slate-500 mb-2">{fav.district}, {fav.city}</p>
                                                        <Link to={`/salon/${fav.id}`} className="text-sm font-bold text-indigo-600 hover:underline">
                                                            Salona Git
                                                        </Link>
                                                    </div>
                                                    <button onClick={() => toggleFavorite(fav)} className="text-slate-300 hover:text-red-500">
                                                        <Heart className="w-5 h-5 fill-current text-red-500" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 text-slate-500">
                                            <Heart className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                            <p>Henüz favori salonunuz yok.</p>
                                            <Link to="/search" className="text-indigo-600 hover:underline mt-2 inline-block">Kuaförleri Keşfet</Link>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'settings' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-6 font-serif">Hesap Ayarları</h3>
                                    <form className="space-y-6 max-w-md">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad</label>
                                            <input type="text" defaultValue={user.name} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">E-posta</label>
                                            <input type="email" defaultValue={user.email} disabled className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500" />
                                        </div>
                                        <button className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">
                                            Kaydet
                                        </button>
                                    </form>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default UserProfile;
