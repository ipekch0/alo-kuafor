import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, UserPlus, Eye, EyeOff, Scissors } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const { login, register } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
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
                } else {
                    setError(result.error || 'Giriş başarısız');
                }
            } else {
                if (formData.password !== formData.confirmPassword) {
                    setError('Şifreler eşleşmiyor');
                    setLoading(false);
                    return;
                }

                const result = await register(formData.name, formData.email, formData.password);
                if (result.success) {
                    navigate('/panel');
                } else {
                    setError(result.error || 'Kayıt başarısız');
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
                className="w-full max-w-md"
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
                            <span className="text-3xl font-bold text-slate-900 tracking-tight font-serif">ALOKUAFÖR</span>
                        </div>
                        <p className="text-slate-500 text-lg font-light">Yönetici Paneli</p>
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
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Ad Soyad
                                </label>
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
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                E-posta
                            </label>
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

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Şifre
                            </label>
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
                        </div>

                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Şifre Tekrar
                                </label>
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

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm"
                            >
                                {error}
                            </motion.div>
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
                                setFormData({ name: '', email: '', password: '', confirmPassword: '' });
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
                    © 2024 ALOKUAFÖR. Tüm hakları saklıdır.
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
