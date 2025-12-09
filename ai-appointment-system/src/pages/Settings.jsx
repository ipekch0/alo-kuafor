import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import {
    Save, MapPin, Clock, Building2, Smartphone, Mail,
    Store, Navigation, CalendarCheck, MessageSquare, AlertCircle, CheckCircle2
} from 'lucide-react';
import { useMySalon, useUpdateMySalon } from '../hooks/useData';
import toast from 'react-hot-toast';
import { cities } from '../data/cities';

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

    const [loadingWhatsapp, setLoadingWhatsapp] = useState(false);

    // Initialize Facebook SDK
    useEffect(() => {
        window.fbAsyncInit = function () {
            window.FB.init({
                appId: '1786919535347746',
                cookie: true,
                xfbml: true,
                version: 'v18.0'
            });
        };

        // Load SDK
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
            toast.success('Ayarlar kaydedildi! 🎉');
        } catch (error) {
            toast.error('Kaydetme başarısız.');
        }
    };

    // WhatsApp Embedded Signup
    const launchWhatsAppSignup = () => {
        setLoadingWhatsapp(true);
        if (!window.FB) {
            toast.error('Facebook SDK yüklenemedi. Lütfen reklam engelleyiciyi kapatın.');
            setLoadingWhatsapp(false);
            return;
        }

        window.FB.login(function (response) {
            if (response.authResponse) {
                // Standard Login returns accessToken.
                exchangeToken(response.authResponse.accessToken);
            } else {
                toast.error('Facebook girişi iptal edildi.');
                setLoadingWhatsapp(false);
            }
        }, {
            scope: 'whatsapp_business_management, whatsapp_business_messaging, business_management'
        });
    };

    const exchangeToken = async (accessToken) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/whatsapp-cloud/exchange-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ code: accessToken }) // Sending access token acting as code for simplicity in this flow
            });

            const data = await res.json();
            if (data.success) {
                toast.success('WhatsApp başarıyla bağlandı! 🎉');
                window.location.reload(); // Refresh to show Connected state
            } else {
                toast.error('Bağlantı hatası: ' + data.error);
            }
        } catch (error) {
            console.error('Exchange error:', error);
            toast.error('Sunucu hatası.');
        } finally {
            setLoadingWhatsapp(false);
        }
    };

    // UI Helpers
    const handleHourChange = (day, field, value) => {
        setFormData(prev => ({
            ...prev,
            workingHours: {
                ...prev.workingHours,
                [day]: { ...prev.workingHours[day], [field]: value }
            }
        }));
    };

    if (isLoading) return <div className="p-10 text-center">Yükleniyor...</div>;

    const tabs = [
        { id: 'general', label: 'İşletme', icon: Building2 },
        { id: 'location', label: 'Konum', icon: MapPin },
        { id: 'hours', label: 'Saatler', icon: Clock },
        { id: 'whatsapp', label: 'WhatsApp & AI', icon: MessageSquare },
    ];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
            {/* Sidebar */}
            <div className="lg:col-span-3 space-y-4">
                <h1 className="text-2xl font-bold mb-6">Ayarlar</h1>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 p-4 text-left border-l-4 transition-colors ${activeTab === tab.id
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-medium'
                                : 'border-transparent text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <tab.icon className="w-5 h-5" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-9">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b">
                        <h2 className="text-xl font-bold">{tabs.find(t => t.id === activeTab)?.label}</h2>
                        <button onClick={handleSave} className="btn-primary flex items-center gap-2 px-6 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700">
                            <Save className="w-4 h-4" /> Kaydet
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === 'general' && (
                            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} key="gen" className="space-y-6">
                                {/* Logo Upload */}
                                <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center relative overflow-hidden group border-2 border-slate-200">
                                        <input type="file" onChange={e => e.target.files[0] && setFormData({ ...formData, image: e.target.files[0] })} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                        {formData.image ? (
                                            <img src={typeof formData.image === 'string' ? formData.image : URL.createObjectURL(formData.image)} className="w-full h-full object-cover" />
                                        ) : <Store className="w-8 h-8 text-slate-400" />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold">Logo Değiştir</h3>
                                        <p className="text-xs text-slate-500">Önerilen: 500x500px</p>
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div><label className="label">İşletme Adı</label><input className="input-field" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
                                    <div><label className="label">Telefon</label><input className="input-field" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} /></div>
                                </div>
                                <div><label className="label">Açıklama</label><textarea className="input-field h-24" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div>
                            </motion.div>
                        )}

                        {activeTab === 'whatsapp' && (
                            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} key="wa" className="space-y-6">
                                <div className="bg-indigo-50 border-indigo-100 border rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-indigo-900 mb-2">WhatsApp Cloud API</h3>
                                    <p className="text-indigo-700 text-sm mb-6">
                                        Resmi WhatsApp Business API ile kesintisiz, güvenli ve yapay zeka destekli bir deneyim sunun.
                                        Telefonunuzun açık kalmasına gerek yoktur.
                                    </p>

                                    {salon?.whatsappAPIToken ? (
                                        <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-indigo-100">
                                            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                                            <div>
                                                <div className="font-bold text-slate-800">Bağlantı Aktif</div>
                                                <div className="text-xs text-slate-500">ID: {salon.whatsappPhoneId || 'Bilinmiyor'}</div>
                                            </div>
                                            <button className="ml-auto text-xs text-red-500 underline">Bağlantıyı Sıfırla</button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={launchWhatsAppSignup}
                                            disabled={loadingWhatsapp}
                                            className="w-full py-4 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-200"
                                        >
                                            {loadingWhatsapp ? "İşleniyor..." : "Facebook ile Bağlan"}
                                        </button>
                                    )}
                                    <p className="text-xs text-center mt-3 text-indigo-400">Meta tarafından doğrulanmış güvenli bağlantı.</p>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'location' && (
                            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} key="loc" className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Şehir</label>
                                        <select className="input-field" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value, district: '' })}>
                                            <option value="">Seçiniz</option>
                                            {cities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label">İlçe</label>
                                        <select className="input-field" value={formData.district} onChange={e => setFormData({ ...formData, district: e.target.value })}>
                                            <option value="">Seçiniz</option>
                                            {cities.find(c => c.name === formData.city)?.districts.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div><label className="label">Adres</label><textarea className="input-field h-24" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} /></div>
                            </motion.div>
                        )}

                        {activeTab === 'hours' && (
                            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} key="hours" className="space-y-2">
                                {Object.entries(formData.workingHours).map(([day, val]) => (
                                    <div key={day} className="flex items-center justify-between p-3 border rounded-xl bg-slate-50">
                                        <div className="capitalize w-24 font-medium">{day}</div>
                                        <div className="flex items-center gap-2">
                                            {val.active ? (
                                                <>
                                                    <input type="time" className="input-field py-1" value={val.start} onChange={e => handleHourChange(day, 'start', e.target.value)} />
                                                    <span>-</span>
                                                    <input type="time" className="input-field py-1" value={val.end} onChange={e => handleHourChange(day, 'end', e.target.value)} />
                                                </>
                                            ) : <span className="text-slate-400 text-sm">Kapalı</span>}
                                            <input type="checkbox" className="w-5 h-5 ml-2" checked={val.active} onChange={e => handleHourChange(day, 'active', e.target.checked)} />
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export default Settings;
