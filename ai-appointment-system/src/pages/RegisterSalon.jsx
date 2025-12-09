import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, Crown, Star, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { cities } from '../data/cities';

const plans = [
    {
        id: 'STARTER',
        name: 'Başlangıç',
        price: 0,
        features: ['Aylık 50 Randevu', '1 Personel', 'Temel Müşteri Yönetimi', 'Web Paneli'],
        color: 'slate'
    },
    {
        id: 'PRO',
        name: 'Pro',
        price: 499,
        popular: true,
        features: ['Sınırsız Randevu', '5 Personel', 'Yapay Zeka Asistanı', 'Otomatik Hatırlatmalar', 'Gelişmiş Raporlar'],
        color: 'indigo'
    },
    {
        id: 'ENTERPRISE',
        name: 'Enterprise',
        price: -1,
        popular: false,
        features: ['Sınırsız Personel', 'Çoklu Şube', 'Özel Entegrasyonlar', '7/24 Öncelikli Destek'],
        color: 'purple'
    }
];

const RegisterSalon = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [step, setStep] = useState(1);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        salonName: '',
        phone: '',
        city: '',
        district: '',
        taxNumber: '',
        taxOffice: '',
        address: ''
    });

    const handleRegister = async () => {
        if (formData.password !== formData.confirmPassword) {
            toast.error('Şifreler eşleşmiyor!');
            return;
        }

        if (formData.taxNumber.length !== 10) {
            toast.error('Vergi numarası 10 haneli olmalıdır!');
            return;
        }

        if (selectedPlan.price === -1) {
            toast.success('Kurumsal başvuru talebiniz alındı! Ekibimiz size ulaşacak.');
            navigate('/');
            return;
        }

        setLoading(true);
        try {
            const salonDetails = {
                salonName: formData.salonName,
                phone: formData.phone,
                city: formData.city,
                district: formData.district,
                taxNumber: formData.taxNumber,
                taxOffice: formData.taxOffice,
                address: formData.address,
                subscriptionPlan: selectedPlan.id
            };

            const result = await register(
                formData.name,
                formData.email,
                formData.password,
                'salon_owner',
                salonDetails
            );

            if (result.success) {
                toast.success('Hesabınız oluşturuldu!');

                if (selectedPlan.price > 0) {
                    // Redirect to payment for paid plans
                    navigate('/payment', {
                        state: {
                            plan: selectedPlan.id,
                            price: selectedPlan.price,
                            planName: selectedPlan.name,
                            isRegistration: true
                        }
                    });
                } else {
                    // Direct access for free plan
                    navigate('/panel');
                }
            } else {
                toast.error(result.error || 'Kayıt başarısız');
            }
        } catch (error) {
            toast.error('Bir hata oluştu: ' + error.message);
        } finally {
            setLoading(false);
        }
    };





    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
            { }
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                    <Scissors className="w-6 h-6" />
                </div>
                <span className="text-2xl font-bold text-slate-900 tracking-tight">ODAKMANAGE</span>
            </div>

            <motion.div
                layout
                className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100"
            >
                { }
                <div className="bg-slate-50 border-b border-slate-100 p-4">
                    <div className="flex items-center justify-center gap-4">
                        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}>1</div>
                            <span>Hesap</span>
                        </div>
                        <div className="w-12 h-0.5 bg-slate-200"></div>
                        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}>2</div>
                            <span>Paket Seçimi</span>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="max-w-md mx-auto space-y-4"
                            >
                                <h2 className="text-2xl font-bold text-slate-800 text-center mb-6">İşletme Bilgileri</h2>

                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Ad Soyad"
                                        className="input-field"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="İşletme Adı"
                                        className="input-field"
                                        value={formData.salonName}
                                        onChange={e => setFormData({ ...formData, salonName: e.target.value })}
                                    />
                                </div>
                                <input
                                    type="email"
                                    placeholder="E-posta Adresi"
                                    className="input-field"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="tel"
                                        placeholder="Telefon"
                                        className="input-field"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                    <select
                                        className="input-field"
                                        value={formData.city}
                                        onChange={e => setFormData({ ...formData, city: e.target.value, district: '' })}
                                    >
                                        <option value="">İl Seçiniz</option>
                                        {cities.map(city => (
                                            <option key={city.name} value={city.name}>{city.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <select
                                        className="input-field"
                                        value={formData.district}
                                        disabled={!formData.city}
                                        onChange={e => setFormData({ ...formData, district: e.target.value })}
                                    >
                                        <option value="">İlçe Seçiniz</option>
                                        {formData.city && cities.find(c => c.name === formData.city)?.districts.map(dist => (
                                            <option key={dist} value={dist}>{dist}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="Vergi No (10 Haneli)"
                                        className="input-field"
                                        maxLength={10}
                                        value={formData.taxNumber}
                                        onChange={e => setFormData({ ...formData, taxNumber: e.target.value.replace(/\D/g, '') })}
                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Vergi Dairesi"
                                        className="input-field"
                                        value={formData.taxOffice}
                                        onChange={e => setFormData({ ...formData, taxOffice: e.target.value })}
                                    />
                                </div>
                                <textarea
                                    placeholder="Açık Adres (Mahalle, Sokak, No...)"
                                    className="input-field pt-3 h-20 resize-none"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                ></textarea>

                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="password"
                                        placeholder="Şifre"
                                        className="input-field"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    <input
                                        type="password"
                                        placeholder="Şifre Tekrar"
                                        className="input-field"
                                        value={formData.confirmPassword}
                                        onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    />
                                </div>

                                <button
                                    onClick={() => {
                                        if (formData.name && formData.email && formData.password && formData.salonName && formData.taxNumber && formData.taxOffice && formData.city && formData.district) {
                                            if (formData.taxNumber.length !== 10) {
                                                toast.error('Vergi numarası 10 haneli olmalıdır!');
                                                return;
                                            }
                                            setStep(2);
                                        } else {
                                            toast.error('Lütfen tüm zorunlu alanları (Şehir, İlçe dahil) doldurun.');
                                        }
                                    }}
                                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 mt-4"
                                >
                                    Devam Et <ArrowRight className="w-5 h-5" />
                                </button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <h2 className="text-2xl font-bold text-slate-800 text-center mb-2">Size Uygun Paketi Seçin</h2>
                                <p className="text-center text-slate-500 mb-8">İhtiyacınıza göre istediğiniz zaman paketinizi yükseltebilirsiniz.</p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    {plans.map((plan) => (
                                        <div
                                            key={plan.id}
                                            onClick={() => setSelectedPlan(plan)}
                                            className={`relative cursor-pointer rounded-2xl p-6 border-2 transition-all duration-300 hover:shadow-xl ${selectedPlan?.id === plan.id
                                                ? 'border-indigo-600 bg-indigo-50/20 shadow-lg scale-[1.02]'
                                                : 'border-slate-100 hover:border-indigo-200'
                                                }`}
                                        >
                                            {plan.popular && (
                                                <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">
                                                    POPÜLER
                                                </div>
                                            )}
                                            <div className="mb-4">
                                                <span className={`text-${plan.color}-600 font-bold block mb-1`}>{plan.name}</span>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-3xl font-bold text-slate-800">
                                                        {plan.price === 0 ? 'Ücretsiz' : plan.price === -1 ? 'Özel Fiyat' : `₺${plan.price}`}
                                                    </span>
                                                    {plan.price > 0 && <span className="text-sm text-slate-500">/ay</span>}
                                                </div>
                                            </div>
                                            <ul className="space-y-3">
                                                {plan.features.map((feature, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                                        <Check className={`w-4 h-4 text-${plan.color}-600 shrink-0`} />
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-4 max-w-md mx-auto">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition-all"
                                    >
                                        Geri Dön
                                    </button>
                                    <button
                                        onClick={handleRegister}
                                        disabled={!selectedPlan || loading}
                                        className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {loading ? 'İşlem Sürüyor...' : (selectedPlan?.price === -1 ? 'İletişime Geç' : selectedPlan?.price > 0 ? 'Ödeme ve Kayıt' : 'Ücretsiz Başla')}
                                        {!loading && <ArrowRight className="w-5 h-5" />}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterSalon;
