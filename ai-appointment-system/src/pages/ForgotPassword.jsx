import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Since we don't have real SMTP for password reset in this demo environment,
        // we will simulate a successful request.
        setTimeout(() => {
            setIsSubmitted(true);
            toast.success('Sıfırlama bağlantısı gönderildi!');
        }, 1000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
                <Link to="/login" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-8 text-sm font-medium">
                    <ArrowLeft className="w-4 h-4" />
                    Giriş'e Dön
                </Link>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">Şifremi Unuttum</h1>
                    <p className="text-slate-500">
                        Endişelenmeyin! E-posta adresinizi girin, size şifrenizi sıfırlamanız için bir bağlantı gönderelim.
                    </p>
                </div>

                {!isSubmitted ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">E-posta Adresi</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="ornek@email.com"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30"
                        >
                            Sıfırlama Bağlantısı Gönder
                        </button>
                    </form>
                ) : (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">E-posta Gönderildi!</h3>
                        <p className="text-slate-600 mb-6">
                            Lütfen gelen kutunuzu kontrol edin. Gönderdiğimiz bağlantıya tıklayarak yeni şifrenizi oluşturabilirsiniz.
                        </p>
                        <button
                            onClick={() => setIsSubmitted(false)}
                            className="text-indigo-600 font-medium hover:underline"
                        >
                            Tekrar Gönder
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
