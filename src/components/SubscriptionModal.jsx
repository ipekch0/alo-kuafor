import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Star, Zap, Crown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const plans = [
    {
        id: 'STARTER',
        name: 'Başlangıç',
        price: 0,
        icon: <Star className="w-6 h-6" />,
        color: 'slate',
        features: [
            'Aylık 50 Randevu',
            '1 Personel',
            'Temel Müşteri Yönetimi',
            'Web Paneli'
        ],
        missing: [
            'Yapay Zeka Asistanı',
            'Otomatik Hatırlatmalar',
            'Gelişmiş Raporlar',
            'Çoklu Şube'
        ]
    },
    {
        id: 'PRO',
        name: 'Pro',
        price: 499,
        popular: true,
        icon: <Zap className="w-6 h-6" />,
        color: 'indigo',
        features: [
            'Sınırsız Randevu',
            '5 Personel',
            'Yapay Zeka Asistanı (WhatsApp)',
            'Otomatik Hatırlatmalar',
            'Gelişmiş Raporlar'
        ],
        missing: [
            'Çoklu Şube Yönetimi',
            'Özel Entegrasyonlar',
            '7/24 Öncelikli Destek'
        ]
    },
    {
        id: 'ENTERPRISE',
        name: 'Enterprise',
        price: -1,
        popular: false,
        icon: <Crown className="w-6 h-6" />,
        color: 'purple',
        features: [
            'Sınırsız Personel',
            'Çoklu Şube Yönetimi',
            'Özel Entegrasyonlar',
            '7/24 Öncelikli Destek',
            'Size Özel Alan Adı'
        ],
        missing: []
    }
];

const SubscriptionModal = ({ isOpen, onClose, currentPlan = 'STARTER' }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleUpgrade = (plan) => {
        if (plan.price === -1) {
            toast.success('Hemen sizinle iletişime geçeceğiz! 📞');
            onClose();
            return;
        }

        navigate('/payment', {
            state: {
                plan: plan.id,
                price: plan.price,
                planName: plan.name
            }
        });
        onClose();
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-3xl w-full max-w-6xl p-6 relative"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-slate-400" />
                    </button>

                    <div className="text-center mb-10 mt-4">
                        <h2 className="text-3xl font-bold text-slate-900 mb-3">
                            İşletmenizi Büyütün 🚀
                        </h2>
                        <p className="text-slate-500 max-w-2xl mx-auto">
                            Daha fazla personel, sınırsız hizmet ve yapay zeka özellikleri için paketinizi yükseltin.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`relative rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-xl ${plan.popular
                                    ? 'border-indigo-600 shadow-indigo-100 bg-indigo-50/10'
                                    : 'border-slate-100 hover:border-slate-200'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg shadow-indigo-200">
                                        En Popüler
                                    </div>
                                )}

                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${plan.id === 'STARTER' ? 'bg-slate-100 text-slate-600' :
                                    plan.id === 'PRO' ? 'bg-indigo-100 text-indigo-600' :
                                        'bg-purple-100 text-purple-600'
                                    }`}>
                                    {plan.icon}
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 mb-1">{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-3xl font-bold text-slate-900">
                                        {plan.price === 0 ? 'Ücretsiz' : plan.price === -1 ? 'Özel Fiyat' : `₺${plan.price}`}
                                    </span>
                                    {plan.price > 0 && <span className="text-slate-500">/ay</span>}
                                </div>

                                <button
                                    onClick={() => handleUpgrade(plan)}
                                    disabled={plan.id === currentPlan}
                                    className={`w-full py-3 px-4 rounded-xl font-bold mb-6 transition-all ${plan.id === currentPlan
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        : plan.id === 'PRO'
                                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:-translate-y-1'
                                            : plan.id === 'ENTERPRISE'
                                                ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-200 hover:-translate-y-1'
                                                : 'bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50'
                                        }`}
                                >
                                    {plan.id === currentPlan ? 'Mevcut Paket' : 'Seç ve Yükselt'}
                                </button>

                                <div className="space-y-3">
                                    {plan.features.map((feature, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <Check className={`w-5 h-5 flex-shrink-0 ${plan.id === 'STARTER' ? 'text-slate-500' :
                                                plan.id === 'PRO' ? 'text-indigo-600' : 'text-purple-600'
                                                }`} />
                                            <span className="text-sm text-slate-700">{feature}</span>
                                        </div>
                                    ))}
                                    {plan.missing.map((feature, i) => (
                                        <div key={i} className="flex items-start gap-3 opacity-50">
                                            <X className="w-5 h-5 flex-shrink-0 text-slate-400" />
                                            <span className="text-sm text-slate-500">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default SubscriptionModal;
