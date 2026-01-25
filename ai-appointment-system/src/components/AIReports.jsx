import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    Users,
    Calendar,
    Bot,
    Sparkles,
    ArrowUpRight,
    ArrowDownRight,
    Loader2
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';
import { useAppointments } from '../hooks/useData';

const AIReports = () => {
    const [loading, setLoading] = useState(true);
    const { data: appointmentsData = [] } = useAppointments(); // Use real Hook
    const appointments = Array.isArray(appointmentsData) ? appointmentsData : [];

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    // --- 1. Real Revenue Data ---
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
    });

    const predictionData = last7Days.map(date => {
        const dayAppointments = appointments.filter(i => {
            if (!i.dateTime) return false;
            const appDate = new Date(i.dateTime).toISOString().split('T')[0];
            return appDate === date && i.status === 'completed';
        });

        const actual = dayAppointments.reduce((sum, i) => sum + (Number(i.service?.price) || 0), 0);

        // Simple mock prediction: Actual + small random variation to simulate "AI"
        const predicted = Math.round(actual * (1 + (Math.random() * 0.2 - 0.05)));

        return {
            name: new Date(date).toLocaleDateString('tr-TR', { weekday: 'short' }),
            actual,
            predicted: predicted > 0 ? predicted : 0 // Show 0 if no data
        };
    });

    // --- 2. Real Customer Insights (Based on Services) ---
    // Instead of fake Ages, let's show Appointment Status Distribution which is real
    const statusStats = {
        completed: appointments.filter(a => a.status === 'completed').length,
        pending: appointments.filter(a => a.status === 'pending').length,
        cancelled: appointments.filter(a => a.status === 'cancelled').length
    };

    const customerInsights = [
        { name: 'Tamamlanan', value: statusStats.completed, fill: '#10b981' },
        { name: 'Bekleyen', value: statusStats.pending, fill: '#f59e0b' },
        { name: 'İptal', value: statusStats.cancelled, fill: '#ef4444' },
    ];

    // --- 3. Dynamic Suggestions ---
    const totalRev = appointments.reduce((sum, i) => sum + (Number(i.service?.price) || 0), 0);
    const popularService = appointments.length > 0
        ? Object.entries(appointments.reduce((acc, curr) => {
            const n = curr.service?.name || 'Diğer';
            acc[n] = (acc[n] || 0) + 1;
            return acc;
        }, {})).sort((a, b) => b[1] - a[1])[0]
        : ['Henüz veri yok', 0];

    const suggestions = [
        {
            title: "Ciro Durumu",
            desc: `Toplam cironuz ₺${totalRev.toLocaleString()} seviyesine ulaştı.`,
            type: "success"
        },
        {
            title: "Popüler Hizmet",
            desc: `En çok talep gören hizmetiniz '${popularService[0]}'. Buna özel kampanya yapabilirsiniz.`,
            type: "info"
        },
        {
            title: "Randevu Doluluğu",
            desc: `Toplam ${appointments.length} randevu kaydınız var.`,
            type: "warning"
        }
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <Bot className="w-8 h-8 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 animate-pulse">
                    AI Verilerinizi Analiz Ediyor...
                </h3>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8 pb-10"
        >
            <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 p-8 rounded-3xl text-white relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <Sparkles className="w-6 h-6 text-yellow-400" />
                        <span className="text-indigo-200 font-medium tracking-wide text-sm uppercase">Haftalık AI Özeti</span>
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Genel Görünüm: <span className="text-emerald-400">Veriye Dayalı Büyüme</span></h2>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl -ml-10 -mb-10"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Prediction Chart */}
                <div className="card-premium p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-indigo-600" />
                                Gelir Analizi
                            </h3>
                            <p className="text-sm text-slate-500">Son 7 günlük gerçek veriler</p>
                        </div>
                    </div>
                    <div className="h-72 w-full" style={{ minHeight: '300px' }}>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={predictionData}>
                                <defs>
                                    <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                                <CartesianGrid vertical={false} stroke="#f1f5f9" />
                                <Tooltip />
                                <Area type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={3} fill="url(#colorPredicted)" name="Gerçekleşen Ciro" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Segmentation (Instead of Age) */}
                <div className="card-premium p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Users className="w-5 h-5 text-pink-500" />
                                Randevu Durumları
                            </h3>
                            <p className="text-sm text-slate-500">Gerçekleşen vs Bekleyen</p>
                        </div>
                    </div>
                    <div className="h-72 w-full" style={{ minHeight: '300px' }}>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={customerInsights}>
                                <CartesianGrid vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                                <Tooltip />
                                <Bar dataKey="value" name="Adet" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Smart Suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {suggestions.map((item, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ y: -5 }}
                        className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${item.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                            item.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                            }`}>
                            <Bot className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-slate-800 mb-2">{item.title}</h4>
                        <p className="text-sm text-slate-500 mb-4">{item.desc}</p>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default AIReports;
