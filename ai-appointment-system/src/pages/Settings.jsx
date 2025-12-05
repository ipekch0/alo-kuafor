import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, MapPin, Clock, Building, Layout, Image as ImageIcon } from 'lucide-react';
import { useMySalon, useUpdateMySalon } from '../hooks/useData';
import toast from 'react-hot-toast';

const Settings = () => {
    const { data: salon, isLoading } = useMySalon();
    const updateSalon = useUpdateMySalon();

    const [activeTab, setActiveTab] = useState('general');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        district: '',
        workingHours: {
            monday: { start: '09:00', end: '19:00', active: true },
            tuesday: { start: '09:00', end: '19:00', active: true },
            wednesday: { start: '09:00', end: '19:00', active: true },
            thursday: { start: '09:00', end: '19:00', active: true },
            friday: { start: '09:00', end: '19:00', active: true },
            saturday: { start: '09:00', end: '19:00', active: true },
            sunday: { start: '09:00', end: '19:00', active: false },
        }
    });

    useEffect(() => {
        if (salon) {
            let parsedHours = salon.workingHours;
            if (typeof salon.workingHours === 'string') {
                try {
                    parsedHours = JSON.parse(salon.workingHours);
                } catch (e) {
                    console.error("Error parsing working hours", e);
                }
            }

            setFormData({
                name: salon.name || '',
                description: salon.description || '',
                phone: salon.phone || '',
                email: salon.email || '',
                address: salon.address || '',
                city: salon.city || '',
                district: salon.district || '',
                workingHours: parsedHours || formData.workingHours
            });
        }
    }, [salon]);

    const handleSave = async () => {
        try {
            await updateSalon.mutateAsync(formData);
            toast.success('Ayarlar başarıyla kaydedildi');
        } catch (error) {
            console.error('Error updating salon:', error);
            toast.error('Kaydetme başarısız');
        }
    };

    const handleHourChange = (day, field, value) => {
        setFormData(prev => ({
            ...prev,
            workingHours: {
                ...prev.workingHours,
                [day]: {
                    ...prev.workingHours[day],
                    [field]: value
                }
            }
        }));
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const tabs = [
        { id: 'general', label: 'Genel Bilgiler', icon: Building },
        { id: 'location', label: 'Konum', icon: MapPin },
        { id: 'hours', label: 'Çalışma Saatleri', icon: Clock },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 max-w-5xl mx-auto pb-10"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Salon Ayarları</h2>
                    <p className="text-slate-500">İşletme bilgilerinizi ve tercihlerinizi yönetin</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={updateSalon.isPending}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-700 text-white rounded-xl font-semibold hover:bg-indigo-800 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
                >
                    <Save className="w-5 h-5" />
                    {updateSalon.isPending ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-200 w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {activeTab === 'general' && (
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Salon Adı</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field"
                                    placeholder="Örn: Studio Elegance"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Telefon</label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="input-field"
                                    placeholder="0212 123 45 67"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Açıklama</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="input-field h-32 resize-none"
                                    placeholder="Salonunuz hakkında kısa bir açıklama..."
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'location' && (
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">İl</label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="input-field"
                                    placeholder="İstanbul"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">İlçe</label>
                                <input
                                    type="text"
                                    value={formData.district}
                                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                    className="input-field"
                                    placeholder="Kadıköy"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Açık Adres</label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="input-field h-24 resize-none"
                                    placeholder="Mahalle, Cadde, Sokak, No..."
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'hours' && (
                    <div className="p-8">
                        <div className="space-y-4">
                            {Object.entries(formData.workingHours).map(([day, hours]) => (
                                <div key={day} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="w-32 font-medium text-slate-700 capitalize">
                                        {day === 'monday' ? 'Pazartesi' :
                                            day === 'tuesday' ? 'Salı' :
                                                day === 'wednesday' ? 'Çarşamba' :
                                                    day === 'thursday' ? 'Perşembe' :
                                                        day === 'friday' ? 'Cuma' :
                                                            day === 'saturday' ? 'Cumartesi' : 'Pazar'}
                                    </div>

                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={hours.active}
                                            onChange={(e) => handleHourChange(day, 'active', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </label>

                                    {hours.active ? (
                                        <div className="flex items-center gap-2 ml-auto">
                                            <input
                                                type="time"
                                                value={hours.start}
                                                onChange={(e) => handleHourChange(day, 'start', e.target.value)}
                                                className="input-field w-32 py-1"
                                            />
                                            <span className="text-slate-400">-</span>
                                            <input
                                                type="time"
                                                value={hours.end}
                                                onChange={(e) => handleHourChange(day, 'end', e.target.value)}
                                                className="input-field w-32 py-1"
                                            />
                                        </div>
                                    ) : (
                                        <div className="ml-auto text-slate-400 text-sm italic">Kapalı</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Settings;
