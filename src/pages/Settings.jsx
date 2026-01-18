import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Save, MapPin, Clock, Building2, Smartphone,
    Store, Navigation, MessageSquare, CheckCircle2
} from 'lucide-react';
import { useMySalon, useUpdateMySalon } from '../hooks/useData';
import toast from 'react-hot-toast';
import { cities } from '../data/cities';

// Cloud API Connection Manager (Embedded Signup + Manual Fallback)
const WhatsAppConnectionManager = () => {
    const [loading, setLoading] = useState(false);
    const [showManual, setShowManual] = useState(false);
    // TODO: Bu App ID'yi .env dosyasından veya veritabanından çekmek en doğrusu olur.
    // Şimdilik kullanıcının girmesi için bir alan bırakıyorum veya varsayılanı kullanıyoruz.
    const [fbAppId, setFbAppId] = useState('2606952183007121'); // Güncel App ID

    useEffect(() => {
        // Load Facebook SDK
        window.fbAsyncInit = function () {
            window.FB.init({
                appId: fbAppId,
                autoLogAppEvents: true,
                xfbml: true,
                version: 'v20.0'
            });
        };

        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) { return; }
            js = d.createElement(s); js.id = id;
            js.src = "https://connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    }, [fbAppId]);

    const launchWhatsAppSignup = () => {
        setLoading(true);
        window.FB.login(function (response) {
            if (response.authResponse) {
                const accessToken = response.authResponse.accessToken;
                console.log('Facebook Giriş Token:', accessToken);
                // Send token to backend
                exchangeCode(accessToken);
            } else {
                console.log('Kullanıcı girişi iptal etti veya tam olarak yetki vermedi.', response);
                setLoading(false);
                toast.error('Giriş Başarısız. Durum: ' + response.status);
            }
        }, {
            scope: 'whatsapp_business_management, whatsapp_business_messaging'
        });
    };

    const exchangeCode = async (code) => {
        try {
            const res = await fetch('/api/whatsapp/exchange-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ token: code })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('✅ WhatsApp Başarıyla Bağlandı!');
            } else {
                toast.error('Bağlantı Hatası: ' + (data.error || data.details?.error?.message));
            }
        } catch (error) {
            toast.error('Sunucu Hatası: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">☁️</span> WhatsApp Cloud API Bağlantısı
            </h2>

            <div className="space-y-6">
                {!showManual ? (
                    <div className="text-center py-8">
                        <div className="mb-6">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                <span className="text-3xl">f</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Facebook ile Otomatik Bağlan</h3>
                            <p className="text-gray-500 text-sm max-w-sm mx-auto mt-2">
                                Tek tıkla WhatsApp Business hesabınızı seçin ve bağlayın. Kopyala-yapıştır derdi yok.
                            </p>
                        </div>

                        <div className="mb-4 max-w-xs mx-auto">
                            <label className="text-xs text-gray-400 block text-left mb-1">Facebook App ID (Varsa Değiştirin)</label>
                            <input
                                type="text"
                                value={fbAppId}
                                onChange={(e) => setFbAppId(e.target.value)}
                                className="w-full text-center text-sm border-b border-gray-200 focus:border-blue-500 outline-none pb-1"
                                placeholder="App ID Giriniz"
                            />
                        </div>

                        <button
                            onClick={launchWhatsAppSignup}
                            disabled={loading}
                            className="bg-[#1877F2] text-white px-8 py-3 rounded-full font-medium hover:bg-[#166fe5] transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2 mx-auto disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Bağlanıyor...
                                </>
                            ) : (
                                'Facebook ile Bağlan'
                            )}
                        </button>

                        <button
                            onClick={() => setShowManual(true)}
                            className="text-xs text-gray-400 mt-6 underline hover:text-gray-600"
                        >
                            Veya Manuel Kuruluma Dön
                        </button>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-semibold text-gray-700">Manuel Giriş (Gelişmiş)</h3>
                            <button onClick={() => setShowManual(false)} className="text-xs text-blue-600 hover:underline">Otomatik Moda Dön</button>
                        </div>

                        {/* Manual Form Content Re-used */}
                        <div className="grid gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number ID</label>
                                <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" id="phoneIdInput" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Business Account ID</label>
                                <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" id="wabaIdInput" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Permanent Access Token</label>
                                <input type="password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" id="tokenInput" />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={async () => {
                                    const phoneId = document.getElementById('phoneIdInput').value;
                                    const wabaId = document.getElementById('wabaIdInput').value;
                                    const token = document.getElementById('tokenInput').value;
                                    if (!phoneId || !wabaId || !token) return toast.error('Eksik bilgi.');

                                    setLoading(true);
                                    try {
                                        const res = await fetch('/api/whatsapp/manual-connect', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                                            body: JSON.stringify({ phoneId, wabaId, token })
                                        });

                                        let data;
                                        try {
                                            data = await res.json();
                                        } catch (e) {
                                            const text = await res.text();
                                            console.error('API Hatası (JSON Değil):', text);
                                            throw new Error(`Sunucu Hatası (${res.status}): Bağlantı kurulamadı.`);
                                        }

                                        if (data.success) toast.success('Kaydedildi!');
                                        else toast.error('Hata: ' + data.error);
                                    } catch (err) { console.error(err); toast.error(err.message); }
                                    finally { setLoading(false); }
                                }}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                Kaydet ve Bağlan
                            </button>
                        </div>
                    </div>
                )}
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

    // Initialize Facebook SDK removed
    // useEffect(() => {
    //    window.fbAsyncInit = ...
    // }, []);

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
                                            <h2 className="text-lg font-bold text-slate-900">WhatsApp & Yapay Zeka</h2>
                                            <p className="text-sm text-slate-500">Yapay zeka asistanı yapılandırması.</p>
                                        </div>

                                        <div className="bg-gradient-to-br from-purple-900/5 to-blue-900/5 border border-purple-500/10 rounded-2xl p-8 text-center relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                            <div className="relative z-10">
                                                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/20 transform group-hover:scale-110 transition-transform duration-300">
                                                    <MessageSquare className="w-10 h-10 text-white" />
                                                </div>
                                                <h3 className="text-2xl font-bold text-slate-800 mb-3">WhatsApp Asistanı</h3>
                                                <p className="text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
                                                    Yapay zeka destekli randevu asistanımız şu anda geliştirme aşamasındadır.
                                                    Size en iyi deneyimi sunmak için çalışıyoruz.
                                                    <br /><br />
                                                    <span className="font-semibold text-indigo-600">Çok Yakında Hizmetinizde! 🚀</span>
                                                </p>
                                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full border border-indigo-100 text-sm text-indigo-700 font-medium">
                                                    <span className="relative flex h-2.5 w-2.5">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                                                    </span>
                                                    Geliştirme Aşamasında
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
