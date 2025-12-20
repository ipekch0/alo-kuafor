import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Lock, CheckCircle, Calendar, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const PaymentModal = ({ isOpen, onClose, appointment, onPaymentSuccess }) => {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Form, 2: Processing, 3: Success

    const [cardData, setCardData] = useState({
        holderName: '',
        cardNumber: '',
        expiryDate: '',
        cvc: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        // Simple formatting logic
        if (name === 'cardNumber') {
            formattedValue = value.replace(/\D/g, '').substring(0, 16).replace(/(\d{4})/g, '$1 ').trim();
        } else if (name === 'expiryDate') {
            formattedValue = value.replace(/\D/g, '').substring(0, 4).replace(/(\d{2})(\d{1,2})/, '$1/$2');
        } else if (name === 'cvc') {
            formattedValue = value.replace(/\D/g, '').substring(0, 3);
        }

        setCardData({ ...cardData, [name]: formattedValue });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStep(2); // Show processing

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            const response = await fetch(`/api/appointments/${appointment.id}/pay`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    paymentMethod: 'credit_card',
                    cardDetails: cardData // In real app, never send raw card data to own backend if using stripe elements etc
                })
            });

            if (!response.ok) throw new Error('Ödeme alınamadı');

            setStep(3); // Show success
            setTimeout(() => {
                onPaymentSuccess();
                onClose();
                setStep(1);
                setCardData({ holderName: '', cardNumber: '', expiryDate: '', cvc: '' });
            }, 2000);

        } catch (error) {
            toast.error('Ödeme işlemi başarısız oldu.');
            setStep(1);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors z-10"
                >
                    <X className="w-5 h-5 text-slate-500" />
                </button>

                <div className="p-6">
                    {step === 1 && (
                        <>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                                    <CreditCard className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Güvenli Ödeme</h3>
                                    <p className="text-sm text-slate-500">
                                        {appointment.service.name} - {appointment.service.price} {appointment.service.currency}
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Kart Bilgileri</span>
                                        <div className="flex gap-2">
                                            <div className="w-8 h-5 bg-blue-600 rounded"></div>
                                            <div className="w-8 h-5 bg-red-600 rounded"></div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="cardNumber"
                                                placeholder="0000 0000 0000 0000"
                                                value={cardData.cardNumber}
                                                onChange={handleInputChange}
                                                className="w-full bg-transparent border-b border-slate-300 py-2 text-lg font-mono placeholder:text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
                                                required
                                            />
                                            <CreditCard className="absolute right-0 top-2.5 w-5 h-5 text-slate-400" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                name="holderName"
                                                placeholder="Kart Sahibi"
                                                value={cardData.holderName}
                                                onChange={handleInputChange}
                                                className="w-full bg-transparent border-b border-slate-300 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                                                required
                                            />
                                            <div className="flex gap-4">
                                                <input
                                                    type="text"
                                                    name="expiryDate"
                                                    placeholder="AA/YY"
                                                    value={cardData.expiryDate}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-transparent border-b border-slate-300 py-2 text-sm text-center focus:outline-none focus:border-indigo-500 transition-colors"
                                                    required
                                                />
                                                <input
                                                    type="text"
                                                    name="cvc"
                                                    placeholder="CVC"
                                                    value={cardData.cvc}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-transparent border-b border-slate-300 py-2 text-sm text-center focus:outline-none focus:border-indigo-500 transition-colors"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
                                    <Lock className="w-3 h-3" />
                                    <span>Ödemeniz 256-bit SSL şifreleme ile korunmaktadır.</span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                                >
                                    <Shield className="w-4 h-4" />
                                    <span>{appointment.service.price} {appointment.service.currency} Öde</span>
                                </button>
                            </form>
                        </>
                    )}

                    {step === 2 && (
                        <div className="py-12 flex flex-col items-center text-center">
                            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
                            <h3 className="text-lg font-bold text-slate-900">Ödeme İşleniyor</h3>
                            <p className="text-slate-500">Lütfen bekleyiniz, bankanızla iletişim kuruluyor...</p>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="py-12 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-green-700">Ödeme Başarılı!</h3>
                            <p className="text-green-600">Randevunuz onaylanmıştır.</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default PaymentModal;
