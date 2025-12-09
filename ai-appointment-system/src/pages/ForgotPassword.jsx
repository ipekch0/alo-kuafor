import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();

            if (res.ok) {
                setSent(true);
                toast.success('Sıfırlama bağlantısı gönderildi!');
            } else {
                toast.error(data.error || 'Bir hata oluştu.');
            }
        } catch (error) {
            toast.error('Sunucu hatası.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8"
            >
                <Link to="/login" className="inline-flex items-center text-slate-500 hover:text-indigo-600 mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Giriş'e Dön
                </Link>

                <h1 className="text-2xl font-bold text-slate-900 mb-2">Şifrenizi mi Unuttunuz?</h1>
                <p className="text-slate-500 mb-8">
                    E-posta adresinizi girin, size şifrenizi sıfırlamanız için bir bağlantı gönderelim.
                </p>

                {sent ? (
                    <div className="bg-green-50 text-green-700 p-4 rounded-xl text-center">
                        <p className="font-medium">E-posta Gönderildi!</p>
                        <p className="text-sm mt-1">Lütfen gelen kutunuzu (ve spam klasörünü) kontrol edin.</p>
                        <button onClick={() => setSent(false)} className="text-sm underline mt-4 hover:text-green-800">
                            Tekrar dene
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">E-posta Adresi</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-600 placeholder:text-slate-400"
                                    placeholder="ornek@email.com"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center transition-all shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sıfırlama Linki Gönder'}
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
