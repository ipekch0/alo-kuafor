import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ShieldCheck, Mail, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../api/aiApi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth(); // We might need to manually login after verification if the token is returned

    // Get email from router state or local storage
    const [email, setEmail] = useState('');
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);

    const handleResend = async () => {
        if (resendCooldown > 0) return;
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/auth/resend-verification`, { email });
            toast.success('Doğrulama kodu tekrar gönderildi.');
            if (res.data.debugCode) {
                toast.success(`TEST MODU: Kodunuz: ${res.data.debugCode}`, { duration: 10000 });
            }
            setResendCooldown(60); // 60 seconds cooldown
        } catch (err) {
            toast.error(err.response?.data?.error || 'Kod gönderilemedi.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
            if (location.state.debugCode) {
                toast.success(`TEST MODU: Kodunuz: ${location.state.debugCode}`, { duration: 10000 });
            }
        } else {
            // Fallback or redirect if no email found
            // navigate('/login');
        }
    }, [location, navigate]);

    const handleChange = (index, value) => {
        if (value.length > 1) return;
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto focus next
        if (value && index < 5) {
            const nextInput = document.getElementById(`code-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            const prevInput = document.getElementById(`code-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const fullCode = code.join('');
        if (fullCode.length !== 6) {
            setError('Lütfen 6 haneli kodu eksiksiz girin.');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/auth/verify-otp`, {
                email,
                code: fullCode
            });

            if (response.data.token) {
                // If the backend returns a token, we can manually log the user in via context or storage
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                // Reload or navigate to panel
                toast.success('Doğrulama başarılı! Yönlendiriliyorsunuz...');
                setTimeout(() => {
                    navigate('/panel');
                    window.location.reload(); // To refresh auth context
                }, 1500);
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Doğrulama başarısız. Kodu kontrol edin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
            >
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-8 text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <Mail className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white font-serif">E-Posta Doğrulama</h2>
                    <p className="text-indigo-100 mt-2 text-sm">E-postanıza gönderilen 6 haneli kodu giriniz.</p>
                </div>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <p className="text-slate-600 mb-2"><span className="font-bold text-slate-900">{email}</span> adresine kod gönderildi.</p>
                        <button onClick={() => navigate('/login')} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">Adres yanlış mı?</button>
                    </div>

                    <form onSubmit={handleVerify}>
                        <div className="flex justify-between gap-2 mb-8">
                            {code.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`code-${index}`}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-12 h-14 text-center text-2xl font-bold text-slate-800 border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-0 outline-none transition-all"
                                />
                            ))}
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center mb-6">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    Doğrula ve Tamamla <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-500 mb-2">Kod gelmedi mi?</p>
                        <button
                            onClick={handleResend}
                            disabled={loading || resendCooldown > 0}
                            className={`text-sm font-bold ${resendCooldown > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-indigo-600 hover:text-indigo-700'}`}
                        >
                            {resendCooldown > 0 ? `Tekrar gönder (${resendCooldown}s)` : 'Kodu Tekrar Gönder'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default VerifyEmail;
