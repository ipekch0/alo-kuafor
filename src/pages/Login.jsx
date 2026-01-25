import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, UserPlus, Eye, EyeOff, Scissors, Building2, MapPin, Phone, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cities } from '../data/cities';

const Login = () => {
    const navigate = useNavigate();
    const { login, register } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [isSalonOwner, setIsSalonOwner] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        // Salon Owner Details
        salonName: '',
        taxNumber: '',
        taxOffice: '',
        address: '',
        city: '',
        district: '',
        phone: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {


            if (isLogin) {
                const result = await login(formData.email, formData.password);
                if (result.success) {
                    navigate('/panel');
                } else if (result.requireVerification) {
                    navigate('/verify-email', { state: { email: result.email } });
                } else {
                    setError(result.error || 'Giriş başarısız');
                }
            } else {
                if (formData.password !== formData.confirmPassword) {
                    setError('Şifreler eşleşmiyor');
                    setLoading(false);
                    return;
                }

                if (isSalonOwner) {

                    const salonDetails = {
                        salonName: formData.salonName,
                        taxNumber: formData.taxNumber,
                        taxOffice: formData.taxOffice,
                        address: formData.address,
                        city: formData.city,
                        district: formData.district,
                        phone: formData.phone
                    };

                    if (salonDetails.taxNumber.length !== 10) {
                        setError('Vergi numarası 10 haneli olmalıdır');
                        setLoading(false);
                        return;
                    }

                    const result = await register(formData.name, formData.email, formData.password, formData.phone, 'salon_owner', salonDetails);
                    if (result.success) {
                        if (result.requireVerification) {
                            navigate('/verify-email', { state: { email: formData.email } });
                        } else {
                            navigate('/panel');
                        }
                    } else {
                        setError(result.error || 'Kayıt başarısız');
                    }
                } else {
                    const result = await register(formData.name, formData.email, formData.password, formData.phone, 'customer');
                    if (result.success) {
                        if (result.requireVerification) {
                            navigate('/verify-email', { state: { email: formData.email, debugCode: result.debugCode } });
                        } else {
                            navigate('/panel');
                        }
                    } else {
                        setError(result.error || 'Kayıt başarısız');
                    }
                }
            }
        } catch (err) {
            setError(err.message || 'Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-white flex items-center justify-center p-4 font-sans selection:bg-brand-accent-violet/20 selection:text-brand-accent-violet">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xl"
            >
                {/* Logo Text */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', duration: 0.5 }}
                        className="inline-block"
                    >
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-brand-accent-indigo rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-accent-indigo/20">
                                <Scissors className="w-7 h-7" />
                            </div>
                            <span className="text-3xl font-black text-slate-900 tracking-tighter font-sans uppercase">ODAKMANAGE</span>
                        </div>
                        <p className="text-slate-500 text-lg font-light">Yönetici Paneli <span className="text-[10px] opacity-30">v1.3.5-stable</span></p>
                    </motion.div>
                </div>

                {/* Login/Register Form */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="card-premium p-8"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!isLogin && (
                            <div className="flex justify-center mb-6">
                                <div className="flex items-center bg-slate-100 rounded-full p-1 border border-slate-200">
                                    <button
                                        type="button"
                                        onClick={() => setIsSalonOwner(false)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${!isSalonOwner ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Müşteri
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsSalonOwner(true)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isSalonOwner ? 'bg-white text-brand-accent-indigo shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        İşletme Sahibi
                                    </button>
                                </div>
                            </div>
                        )}

                        {!isLogin && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Ad Soyad</label>
                                    <div className="relative">
                                        <UserPlus className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="input-premium pl-12"
                                            placeholder="Ad Soyad"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">E-posta</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="input-premium pl-12"
                                    placeholder="ornek@email.com"
                                />
                            </div>
                        </div>

                        {!isLogin && !isSalonOwner && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Telefon</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="input-premium pl-12"
                                        placeholder="0555 555 55 55"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className={`${isLogin ? 'md:col-span-2' : ''}`}>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Şifre</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="input-premium pl-12 pr-12"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                <div className="flex justify-end mt-1">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/forgot-password')}
                                        className="text-xs text-brand-accent-indigo hover:text-indigo-700 font-medium"
                                    >
                                        Şifremi Unuttum
                                    </button>
                                </div>
                            </div>

                            {!isLogin && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Şifre Tekrar</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            className="input-premium pl-12"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {!isLogin && isSalonOwner && (
                            <div className="space-y-4 pt-4 border-t border-slate-100 transition-all duration-300">
                                <h3 className="text-sm font-semibold text-brand-accent-indigo uppercase tracking-wider">İşletme Bilgileri</h3>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">İşletme Adı</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="text"
                                            required={isSalonOwner}
                                            value={formData.salonName}
                                            onChange={(e) => setFormData({ ...formData, salonName: e.target.value })}
                                            className="input-premium pl-12"
                                            placeholder="Örn: Stil Kuaför"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Vergi No</label>
                                        <div className="relative">
                                            <FileText className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                type="text"
                                                required={isSalonOwner}
                                                value={formData.taxNumber}
                                                className="input-premium pl-12"
                                                placeholder="Vergi No"
                                                maxLength={10}
                                                onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value.replace(/\D/g, '') })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Vergi Dairesi</label>
                                        <div className="relative">
                                            <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                type="text"
                                                required={isSalonOwner}
                                                value={formData.taxOffice}
                                                onChange={(e) => setFormData({ ...formData, taxOffice: e.target.value })}
                                                className="input-premium pl-12"
                                                placeholder="Vergi Dairesi"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Şehir</label>
                                        <select
                                            required={isSalonOwner}
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value, district: '' })}
                                            className="input-premium px-4"
                                        >
                                            <option value="">İl Seçiniz</option>
                                            {cities.map(city => (
                                                <option key={city.name} value={city.name}>{city.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">İlçe</label>
                                        <select
                                            required={isSalonOwner}
                                            value={formData.district || ''}
                                            disabled={!formData.city}
                                            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                            className="input-premium px-4"
                                        >
                                            <option value="">İlçe Seçiniz</option>
                                            {formData.city && cities.find(c => c.name === formData.city)?.districts.map(dist => (
                                                <option key={dist} value={dist}>{dist}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Telefon</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                type="tel"
                                                required={isSalonOwner}
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="input-premium pl-12"
                                                placeholder="0555 555 55 55"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Açık Adres</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-3 w-5 h-5 text-slate-400" />
                                        <textarea
                                            required={isSalonOwner}
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="input-premium pl-12 pt-2"
                                            placeholder="Adres detayları..."
                                            rows="2"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm animate-pulse">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                                    {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                                // Reset basics but keep mode toggle state for UX maybe? Or reset all. Let's reset all.
                                // Actually better to keep form state clean
                                setFormData({
                                    name: '', email: '', password: '', confirmPassword: '',
                                    salonName: '', taxNumber: '', taxOffice: '', address: '', city: '', phone: ''
                                });
                            }}
                            className="text-slate-500 hover:text-brand-accent-indigo transition-colors"
                        >
                            {isLogin ? (
                                <>Hesabınız yok mu? <span className="text-brand-accent-indigo font-semibold">Kayıt Ol</span></>
                            ) : (
                                <>Zaten hesabınız var mı? <span className="text-brand-accent-indigo font-semibold">Giriş Yap</span></>
                            )}
                        </button>
                    </div>
                </motion.div>

                <p className="text-center text-slate-400 text-sm mt-8 font-light">
                    © 2024 <span className="font-black font-sans tracking-tight">ODAKMANAGE</span>. Tüm hakları saklıdır.
                </p>
            </motion.div>
            {/* DEBUG OVERLAY */}
            {error && (
                <div className="fixed bottom-0 left-0 w-full bg-red-600 text-white p-4 text-center z-[100] font-bold">
                    DEBUG ERROR: {error}
                </div>
            )}

        </div>
    );
};

export default Login;
