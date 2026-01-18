import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
    Building2,
    MapPin,
    Phone,
    Clock,
    Save,
    Upload,
    Image as ImageIcon,
    Loader2,
    Globe,
    Instagram,
    CheckCircle2
} from 'lucide-react';
import { useMySalon, useUpdateMySalon } from '../hooks/useData';
import { cities } from '../data/cities';

const BusinessProfile = () => {
    const { data: salon, isLoading } = useMySalon();
    const updateSalonMutation = useUpdateMySalon();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: '',
        city: '',
        district: '',
        phone: '',
        email: '',
        website: '',
        instagram: '',
        image: '', // For logo/cover
        workingHours: {
            monday: { start: '09:00', end: '19:00', closed: false },
            tuesday: { start: '09:00', end: '19:00', closed: false },
            wednesday: { start: '09:00', end: '19:00', closed: false },
            thursday: { start: '09:00', end: '19:00', closed: false },
            friday: { start: '09:00', end: '19:00', closed: false },
            saturday: { start: '09:00', end: '19:00', closed: false },
            sunday: { start: '09:00', end: '19:00', closed: true },
        }
    });

    useEffect(() => {
        if (salon) {
            setFormData(prev => ({
                ...prev,
                name: salon.name || '',
                description: salon.description || '',
                address: salon.address || '',
                city: salon.city || '',
                district: salon.district || '',
                phone: salon.phone || '',
                email: salon.email || '',
                website: salon.website || '',
                instagram: salon.instagram || '',
                image: salon.image || '',
                workingHours: salon.workingHours ? JSON.parse(salon.workingHours) : prev.workingHours
            }));
        }
    }, [salon]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleWorkingHoursChange = (day, field, value) => {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'workingHours') {
                    data.append(key, JSON.stringify(formData[key]));
                } else if (key === 'image') {
                    if (formData[key]) data.append(key, formData[key]);
                } else {
                    data.append(key, formData[key]);
                }
            });

            await updateSalonMutation.mutateAsync(data);
            toast.success('İşletme profili ve logo başarıyla güncellendi.');
        } catch (error) {
            console.error('Güncelleme hatası:', error);
            toast.error('Güncelleme başarısız: ' + (error.message || 'Bir hata oluştu'));
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="mt-4 text-indigo-600 font-medium">Yükleniyor...</div>
                </div>
            </div>
        );
    }

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
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto space-y-8 pb-20"
        >
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-900 text-white shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <Building2 className="w-64 h-64 transform rotate-12" />
                </div>
                <div className="relative z-10 p-8 md:p-12">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
                            <Building2 className="w-12 h-12 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">İşletme Profili</h1>
                            <p className="text-indigo-200 mt-2 text-lg max-w-2xl">
                                Müşterilerinizin sizi nasıl gördüğünü buradan yönetin. Profesyonel bir profil, güven oluşturmanın ilk adımıdır.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* General Information Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <Building2 className="w-5 h-5 text-indigo-600" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800">Genel Bilgiler</h2>
                        </div>

                        <div className="p-8 space-y-6">
                            {/* Logo Upload Section - Reverted to useRef pattern as requested */}
                            {/* Logo Upload Section - Fixed to use Label pattern */}
                            <label className="flex items-center gap-6 pb-6 border-b border-slate-100 cursor-pointer group relative -mx-4 px-4 hover:bg-slate-50 transition-colors rounded-xl">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setFormData({ ...formData, image: file });
                                        }
                                    }}
                                    className="hidden"
                                />

                                <div className="relative">
                                    <div className="w-24 h-24 rounded-2xl bg-slate-100 border-2 border-slate-200 overflow-hidden flex items-center justify-center relative z-10">
                                        {formData.image ? (
                                            <img
                                                src={typeof formData.image === 'string' ? formData.image : URL.createObjectURL(formData.image)}
                                                alt="Logo"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <ImageIcon className="w-8 h-8 text-slate-400" />
                                        )}
                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                                            <Upload className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    {/* Additional visual hint */}
                                    <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-1.5 rounded-full shadow-lg z-30 group-hover:scale-110 transition-transform">
                                        <Upload className="w-3 h-3" />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors">İşletme Logosu</h3>
                                    <div className="text-sm text-indigo-600 font-medium mt-1">
                                        Fotoğrafı Değiştir
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">Önerilen boyut: 500x500px (JPG, PNG)</p>
                                </div>
                            </label>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">İşletme Adı</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none bg-slate-50 focus:bg-white"
                                        placeholder="Örn: Studio Kuaför"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Telefon</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none bg-slate-50 focus:bg-white"
                                            placeholder="0555 555 55 55"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Hakkımızda</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none bg-slate-50 focus:bg-white min-h-[120px] resize-y"
                                    placeholder="İşletmenizi ve hizmetlerinizi anlatan kısa bir yazı..."
                                />
                                <p className="text-xs text-slate-500 text-right">Müşterileriniz bu açıklamayı randevu alırken görecekler.</p>
                            </div>
                        </div>
                    </div>

                    {/* Location Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <MapPin className="w-5 h-5 text-emerald-600" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800">Konum & Adres</h2>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">İl</label>
                                    <select
                                        name="city"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value, district: '' })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none bg-slate-50 focus:bg-white appearance-none cursor-pointer"
                                        required
                                    >
                                        <option value="">İl Seçiniz</option>
                                        {cities.map(city => (
                                            <option key={city.name} value={city.name}>{city.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">İlçe</label>
                                    <select
                                        name="district"
                                        value={formData.district}
                                        onChange={handleInputChange}
                                        disabled={!formData.city}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none bg-slate-50 focus:bg-white appearance-none cursor-pointer disabled:opacity-50"
                                        required
                                    >
                                        <option value="">İlçe Seçiniz</option>
                                        {formData.city && cities.find(c => c.name === formData.city)?.districts.map(dist => (
                                            <option key={dist} value={dist}>{dist}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Açık Adres</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none bg-slate-50 focus:bg-white min-h-[100px]"
                                    placeholder="Mahalle, Cadde, Sokak, No..."
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Social Media & Contact */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                            <div className="p-2 bg-pink-100 rounded-lg">
                                <Globe className="w-5 h-5 text-pink-600" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800">Sosyal Medya & Web</h2>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Instagram</label>
                                    <div className="relative">
                                        <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="text"
                                            name="instagram"
                                            value={formData.instagram}
                                            onChange={handleInputChange}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none bg-slate-50 focus:bg-white"
                                            placeholder="@kullaniciadi"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Web Sitesi</label>
                                    <div className="relative">
                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="url"
                                            name="website"
                                            value={formData.website}
                                            onChange={handleInputChange}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none bg-slate-50 focus:bg-white"
                                            placeholder="www.siteniz.com"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Working Hours & Actions */}
                <div className="space-y-8">
                    {/* Working Hours Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                            <div className="p-2 bg-amber-100 rounded-lg">
                                <Clock className="w-5 h-5 text-amber-600" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800">Çalışma Saatleri</h2>
                        </div>

                        <div className="p-6 space-y-4">
                            {days.map((day) => (
                                <div key={day.key} className="group">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-slate-700">{day.label}</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={!formData.workingHours[day.key]?.closed}
                                                onChange={(e) => handleWorkingHoursChange(day.key, 'closed', !e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                            <span className="ml-2 text-xs font-medium text-slate-500">
                                                {formData.workingHours[day.key]?.closed ? 'Kapalı' : 'Açık'}
                                            </span>
                                        </label>
                                    </div>

                                    <motion.div
                                        initial={false}
                                        animate={{
                                            height: formData.workingHours[day.key]?.closed ? 0 : 'auto',
                                            opacity: formData.workingHours[day.key]?.closed ? 0 : 1
                                        }}
                                        className="overflow-hidden"
                                    >
                                        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <input
                                                type="time"
                                                value={formData.workingHours[day.key]?.start}
                                                onChange={(e) => handleWorkingHoursChange(day.key, 'start', e.target.value)}
                                                className="bg-white border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2"
                                            />
                                            <span className="text-slate-400 font-medium">-</span>
                                            <input
                                                type="time"
                                                value={formData.workingHours[day.key]?.end}
                                                onChange={(e) => handleWorkingHoursChange(day.key, 'end', e.target.value)}
                                                className="bg-white border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2"
                                            />
                                        </div>
                                    </motion.div>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50">
                            <button
                                type="submit"
                                disabled={updateSalonMutation.isPending}
                                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-700 text-white rounded-xl font-bold hover:bg-indigo-800 transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
                            >
                                {updateSalonMutation.isPending ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="w-5 h-5" />
                                )}
                                <span>Değişiklikleri Kaydet</span>
                            </button>
                            <p className="text-center text-xs text-slate-400 mt-3">
                                Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </motion.div>
    );
};

export default BusinessProfile;
