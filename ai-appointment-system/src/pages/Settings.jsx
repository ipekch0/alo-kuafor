import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Save, MapPin, Clock, Building2, Smartphone,
    Store, Navigation, MessageSquare, CheckCircle2
} from 'lucide-react';
import { useMySalon, useUpdateMySalon } from '../hooks/useData';
import toast from 'react-hot-toast';
import { cities } from '../data/cities';

// Cloud API Connection Manager
const WhatsAppConnectionManager = () => {
    const [status, setStatus] = useState('DISCONNECTED'); // DISCONNECTED, CONNECTED
    const [loading, setLoading] = useState(false);
    const [connectedPhone, setConnectedPhone] = useState(null);

    // Check status on load
    useEffect(() => {
        const checkStatus = async () => {
            try {
                const token = localStorage.getItem('token');
                // We use a new endpoint or the existing salon check. 
                // For now reusing the generic status endpoint if compatible, or checking salon profile.
                // Assuming /api/salons/me returns whatsapp status
                // Correct endpoint is /mine (see salons.js)
                const res = await fetch('/api/salons/mine', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.whatsappAPIToken) {
                    setStatus('CONNECTED');
                    setConnectedPhone(data.whatsappPhoneId); // Showing ID for now, ideal would be phone number
                }
            } catch (e) { console.error(e); }
        };
        checkStatus();
    }, []);

    const launchFacebookSignup = () => {
        setLoading(true);
        toast.dismiss();

        // Safety timeout - stop spinning after 60 seconds
        setTimeout(() => {
            setLoading(prev => {
                if (prev) {
                    toast.error('Facebook yanıt vermedi (Zaman aşımı).');
                    return false;
                }
                return prev;
            });
        }, 60000);

        // Ensure FB SDK is loaded
        if (!window.FB) {
            toast.error('Facebook SDK yüklenemedi. Lütfen sayfayı yenileyin veya reklam engelleyiciyi kapatın.');
            setLoading(false);
            return;
        }

        toast.loading('Facebook penceresi açılıyor...');

        window.FB.login(async function (response) {
            if (response.authResponse) {
                const accessToken = response.authResponse.accessToken;
                toast.dismiss();
                toast.loading('Facebook onayı alındı, sunucuya bağlanıyor...');

                try {
                    const token = localStorage.getItem('token');
                    const res = await fetch('/api/whatsapp-cloud/exchange-token', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ code: accessToken })
                    });

                    const data = await res.json();

                    if (data.success) {
                        toast.dismiss();
                        toast.success('WhatsApp başarıyla bağlandı! 🎉');
                        setStatus('CONNECTED');
                        setConnectedPhone(data.phone);
                    } else {
                        throw new Error(data.error || 'Bağlantı hatası');
                    }
                } catch (error) {
                    toast.dismiss();
                    toast.error(`Hata: ${error.message}`);
                    console.error("Exchange Error:", error);
                }
            } else {
                toast.dismiss();
                toast.error('Facebook girişi iptal edildi.');
            }
            setLoading(false);
        }, {
            scope: 'whatsapp_business_management,whatsapp_business_messaging',
            extras: {
                feature: 'whatsapp_embedded_signup',
                version: 2
            }
        });
    };

    const handleDisconnect = async () => {
        if (!confirm('Bağlantıyı kesmek istediğinize emin misiniz?')) return;
        // TODO: Implement disconnect logic if needed, for now just clear local state implies logic needed on backend
        // Since backend logic for disconnect wasn't explicitly shown in cloud file, skipping backend call for safety or using generic
        toast.success('Bağlantı kesildi (Local).');
        setStatus('DISCONNECTED');
    };

    if (status === 'CONNECTED') {
        return (
            <div className="bg-white p-6 rounded-xl border border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900">WhatsApp Cloud API Aktif</h4>
                        <p className="text-sm text-slate-500">
                            İşletme hesabınız başarıyla bağlandı.
                        </p>
                    </div>
                </div>
                <button className="px-4 py-2 text-sm text-slate-400 cursor-not-allowed" disabled>
                    Bağlı
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
            <div className="py-6">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg viewBox="0 0 24 24" className="w-8 h-8 text-blue-600 fill-current">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">WhatsApp'ı Bağla</h3>
                <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
                    Meta (Facebook) hesabınızla giriş yaparak WhatsApp Business profilinizi saniyeler içinde bağlayın.
                </p>
                <button
                    onClick={launchFacebookSignup}
                    disabled={loading}
                    className="btn-primary bg-[#1877F2] hover:bg-[#166fe5] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-100 transition-transform hover:scale-105 flex items-center gap-2 mx-auto disabled:opacity-70 disabled:scale-100"
                >
                    {loading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Bağlanıyor...</span>
                        </>
                    ) : (
                        <>
                            <span>Facebook ile Bağlan</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

const Settings = () => {
    const { data: salon, isLoading } = useMySalon();
    const updateSalon = useUpdateMySalon();
    const [activeTab, setActiveTab] = useState('general');

    // Form State
    const [formData, setFormData] = useState({
        name: '', description: '', phone: '', email: '',
        address: '', city: '', district: '',
        workingHours: {
            monday: { start: '09:00', end: '19:00', active: true },
            tuesday: { start: '09:00', end: '19:00', active: true },
            wednesday: { start: '09:00', end: '19:00', active: true },
            thursday: { start: '09:00', end: '19:00', active: true },
            friday: { start: '09:00', end: '19:00', active: true },
            saturday: { start: '09:00', end: '19:00', active: true },
            sunday: { start: '09:00', end: '19:00', active: false },
        },
        image: ''
    });

    // Initialize Facebook SDK (Keep existing logic if needed for potential future use or analytics, though not used for QR)
    useEffect(() => {
        window.fbAsyncInit = function () {
            window.FB.init({
                appId: '1786919535347746',
                cookie: true,
                xfbml: true,
                version: 'v18.0'
            });
        };
        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) { return; }
            js = d.createElement(s); js.id = id;
            js.src = "https://connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    }, []);

    // Sync Data
    useEffect(() => {
        if (salon) {
            let parsedHours = salon.workingHours;
            if (typeof salon.workingHours === 'string') {
                try { parsedHours = JSON.parse(salon.workingHours); } catch (e) { }
            }
            setFormData({
                name: salon.name || '',
                description: salon.description || '',
                phone: salon.phone || '',
                email: salon.email || '',
                address: salon.address || '',
                city: salon.city || '',
                district: salon.district || '',
                workingHours: parsedHours || formData.workingHours,
                image: salon.image || ''
            });
        }
    }, [salon]);

    // Handlers
    const handleSave = async () => {
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'workingHours') data.append(key, JSON.stringify(formData[key]));
                else if (key === 'image' && formData[key]) data.append(key, formData[key]);
                else data.append(key, formData[key]);
            });
            await updateSalon.mutateAsync(data);
            toast.success('Ayarlar başarıyla güncellendi.');
        } catch (error) {
            toast.error('Güncelleme sırasında bir hata oluştu.');
        }
    };

    const handleHourChange = (day, field, value) => {
        setFormData(prev => ({
            ...prev,
            workingHours: {
                ...prev.workingHours,
                [day]: { ...prev.workingHours[day], [field]: value }
            }
        }));
    };

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    const tabs = [
        { id: 'general', label: 'Genel Bilgiler', icon: Building2, desc: 'İşletme adı ve temel bilgiler' },
        { id: 'location', label: 'Adres & Konum', icon: MapPin, desc: 'Harita ve adres detayları' },
        { id: 'hours', label: 'Çalışma Saatleri', icon: Clock, desc: 'Haftalık programınız' },
        { id: 'whatsapp', label: 'WhatsApp Entegrasyonu', icon: MessageSquare, desc: 'Otomatik mesajlar ve bildirimler' },
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">İşletme Ayarları</h1>
                        <p className="text-slate-500 mt-1">Salonunuzun görünümünü ve tercihlerini yönetin.</p>
                    </div>
                    <button
                        onClick={handleSave}
                        className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                    >
                        <Save className="w-4 h-4" />
                        <span>Değişiklikleri Kaydet</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-3">
                        <nav className="space-y-1 sticky top-8">
                            {tabs.map(tab => {
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-200 group relative overflow-hidden ${isActive
                                            ? 'bg-white shadow-md text-indigo-600 ring-1 ring-indigo-50'
                                            : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
                                            }`}
                                    >
                                        <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-indigo-50' : 'bg-slate-100 group-hover:bg-white'}`}>
                                            <tab.icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                                        </div>
                                        <div>
                                            <div className="font-medium">{tab.label}</div>
                                            <div className="text-xs text-slate-400 font-normal hidden xl:block">{tab.desc}</div>
                                        </div>
                                        {isActive && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 rounded-r-full" />
                                        )}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-9">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 md:p-8 min-h-[600px]">
                            <AnimatePresence mode="wait">
                                {activeTab === 'general' && (
                                    <motion.div
                                        key="general"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-8"
                                    >
                                        <div className="pb-6 border-b border-slate-100">
                                            <h2 className="text-lg font-bold text-slate-900">Genel Bilgiler</h2>
                                            <p className="text-sm text-slate-500">Müşterilerinizin göreceği temel bilgiler.</p>
                                        </div>

                                        {/* Logo Upload */}
                                        <div className="flex flex-col sm:flex-row items-center gap-8 p-6 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                                            <div className="relative group cursor-pointer">
                                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md">
                                                    {formData.image ? (
                                                        <img src={typeof formData.image === 'string' ? formData.image : URL.createObjectURL(formData.image)} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                                                            <Store className="w-10 h-10 text-slate-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-white text-xs font-bold">Değiştir</span>
                                                </div>
                                                <input type="file" onChange={e => e.target.files[0] && setFormData({ ...formData, image: e.target.files[0] })} className="absolute inset-0 opacity-0 cursor-pointer" />
                                            </div>
                                            <div className="flex-1 text-center sm:text-left">
                                                <h3 className="font-semibold text-slate-900 text-lg">Salon Logosu</h3>
                                                <p className="text-sm text-slate-500 mt-1 max-w-sm">
                                                    En az 500x500px boyutlarında, JPG veya PNG formatında yükleyin.
                                                    Bu logo randevu sayfasında görünecek.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-slate-700">İşletme Adı</label>
                                                <input
                                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                                                    placeholder="Örn: Studio Kuafor"
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-slate-700">İletişim Telefonu</label>
                                                <input
                                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                                                    placeholder="05..."
                                                    value={formData.phone}
                                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">Hakkında & Açıklama</label>
                                            <div className="relative">
                                                <textarea
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all min-h-[120px] resize-none"
                                                    placeholder="İşletmenizi kısaca anlatın..."
                                                    value={formData.description}
                                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                />
                                                <div className="absolute bottom-3 right-3 text-xs text-slate-400">
                                                    {formData.description.length}/500
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'whatsapp' && (
                                    <motion.div
                                        key="whatsapp"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-6"
                                    >
                                        <div className="pb-6 border-b border-slate-100">
                                            <h2 className="text-lg font-bold text-slate-900">WhatsApp & Entegrasyon</h2>
                                            <p className="text-sm text-slate-500">Otomatik bildirimler için WhatsApp Web bağlantısı.</p>
                                        </div>

                                        <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6">
                                            <div className="flex flex-col md:flex-row gap-6">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-bold text-emerald-900 mb-2">Kolay Bağlantı</h3>
                                                    <p className="text-emerald-700/80 text-sm leading-relaxed mb-4">
                                                        Müşterilerinize randevu hatırlatmaları, onay mesajları ve kampanyaları
                                                        otomatik göndermek için QR kodu okutarak bağlanın.
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-100/50 w-fit px-3 py-1.5 rounded-full">
                                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                                        Canlı Bağlantı Sistemi
                                                    </div>
                                                </div>
                                                <div className="md:w-auto w-full">
                                                    {/* Using the component defined above */}
                                                    <WhatsAppConnectionManager />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'location' && (
                                    <motion.div
                                        key="location"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-8"
                                    >
                                        <div className="pb-6 border-b border-slate-100">
                                            <h2 className="text-lg font-bold text-slate-900">İletişim & Konum</h2>
                                            <p className="text-sm text-slate-500">Müşterilerinizin sizi bulmasını kolaylaştırın.</p>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-slate-700">Şehir</label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <select
                                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none appearance-none bg-white"
                                                        value={formData.city}
                                                        onChange={e => setFormData({ ...formData, city: e.target.value, district: '' })}
                                                    >
                                                        <option value="">İl Seçiniz</option>
                                                        {cities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-slate-700">İlçe</label>
                                                <div className="relative">
                                                    <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <select
                                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none appearance-none bg-white"
                                                        value={formData.district}
                                                        onChange={e => setFormData({ ...formData, district: e.target.value })}
                                                    >
                                                        <option value="">İlçe Seçiniz</option>
                                                        {cities.find(c => c.name === formData.city)?.districts.map(d => <option key={d} value={d}>{d}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">Açık Adres</label>
                                            <textarea
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all min-h-[100px] resize-none"
                                                placeholder="Mahalle, Cadde, Sokak, No..."
                                                value={formData.address}
                                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'hours' && (
                                    <motion.div
                                        key="hours"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-8"
                                    >
                                        <div className="pb-6 border-b border-slate-100">
                                            <h2 className="text-lg font-bold text-slate-900">Çalışma Saatleri</h2>
                                            <p className="text-sm text-slate-500">Randevu alınabilecek saat aralıklarını belirleyin.</p>
                                        </div>

                                        <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                                            {Object.entries(formData.workingHours).map(([day, val]) => (
                                                <div key={day} className="flex items-center justify-between p-4 border-b last:border-0 border-slate-100 hover:bg-white transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-2 h-2 rounded-full ${val.active ? 'bg-green-500' : 'bg-slate-300'}`} />
                                                        <span className="capitalize font-medium text-slate-700 w-24">{day}</span>
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        {val.active ? (
                                                            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                                                                <input
                                                                    type="time"
                                                                    className="px-2 py-1 text-sm font-mono text-slate-600 outline-none bg-transparent"
                                                                    value={val.start}
                                                                    onChange={e => handleHourChange(day, 'start', e.target.value)}
                                                                />
                                                                <span className="text-slate-300 px-1">-</span>
                                                                <input
                                                                    type="time"
                                                                    className="px-2 py-1 text-sm font-mono text-slate-600 outline-none bg-transparent"
                                                                    value={val.end}
                                                                    onChange={e => handleHourChange(day, 'end', e.target.value)}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm font-medium text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">Kapalı</span>
                                                        )}

                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                className="sr-only peer"
                                                                checked={val.active}
                                                                onChange={e => handleHourChange(day, 'active', e.target.checked)}
                                                            />
                                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                                        </label>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
