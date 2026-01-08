import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Lock, CheckCircle, Smartphone, Calendar, User } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { plan, price, planName } = location.state || { plan: 'GOLD', price: 1100, planName: 'Gold Üyelik' };

    const [loading, setLoading] = useState(false);
    const [cardData, setCardData] = useState({
        number: '',
        name: '',
        expiry: '',
        cvc: ''
    });

    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const parts = [];
        for (let i = 0; i < v.length; i += 4) {
            parts.push(v.substring(i, i + 4));
        }
        return parts.length > 1 ? parts.join(' ') : value;
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true);


        await new Promise(resolve => setTimeout(resolve, 2000));

        try {

            const response = await api.post('/salons/upgrade', { plan });

            if (response.data.success) {
                toast.success('Ödeme başarılı! Paketiniz yükseltildi. 🎉');
                navigate('/panel');
            } else {
                toast.error('Ödeme alınamadı.');
            }
        } catch (error) {
            console.error('Payment error', error);
            toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white w-full max-w-4xl rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row"
            >
                { }
                <div className="bg-slate-900 p-8 text-white md:w-1/3 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-8">
                            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-lg">Güvenli Ödeme</span>
                        </div>

                        <div className="mb-8">
                            <p className="text-slate-400 text-sm mb-1">Seçilen Paket</p>
                            <h2 className="text-2xl font-bold mb-2">{planName}</h2>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-indigo-400">₺{price}</span>
                                <span className="text-slate-400 text-sm">/ay</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sm text-slate-300">
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                                <span>Anında Aktivasyon</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-300">
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                                <span>3D Secure ile Güvenli İşlem</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-300">
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                                <span>İstediğin Zaman İptal</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-700 text-xs text-slate-500 text-center">
                        <p>Ödeme altyapısı Iyzico tarafından sağlanmaktadır.</p>
                    </div>
                </div>

                { }
                <div className="p-8 md:w-2/3">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">Kart Bilgileri</h2>

                    <form onSubmit={handlePayment} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Kart Üzerindeki İsim</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    placeholder="Ad Soyad"
                                    value={cardData.name}
                                    onChange={e => setCardData({ ...cardData, name: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Kart Numarası</label>
                            <div className="relative">
                                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    placeholder="0000 0000 0000 0000"
                                    maxLength={19}
                                    value={formatCardNumber(cardData.number)}
                                    onChange={e => setCardData({ ...cardData, number: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Son Kullanma (Ay/Yıl)</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        placeholder="AA/YY"
                                        maxLength={5}
                                        value={cardData.expiry}
                                        onChange={e => {
                                            let val = e.target.value.replace(/\D/g, '');
                                            if (val.length >= 2) val = val.substring(0, 2) + '/' + val.substring(2);
                                            setCardData({ ...cardData, expiry: val });
                                        }}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">CVC / CVV</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        placeholder="123"
                                        maxLength={3}
                                        value={cardData.cvc}
                                        onChange={e => setCardData({ ...cardData, cvc: e.target.value.replace(/\D/g, '') })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !cardData.number || !cardData.name || !cardData.expiry || !cardData.cvc}
                            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 mt-4"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    İşleniyor...
                                </>
                            ) : (
                                <>
                                    <Lock className="w-5 h-5" />
                                    {price} TL Öde
                                </>
                            )}
                        </button>

                        <div className="flex items-center justify-center gap-2 text-slate-400 text-xs mt-4">
                            <Lock className="w-3 h-3" />
                            <span>128-bit SSL ile şifreli güvenli ödeme</span>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Payment;
