import React from 'react';
import { motion } from 'framer-motion';
import {
    Calendar,
    Clock,
    Users,
    DollarSign,
    Check,
    AlertCircle,
    ArrowUp,
    Briefcase,
    TrendingUp,
    Plus,
    UserPlus,
    Zap,
    Activity,
    Scissors,
    Star,
    Sparkles
} from 'lucide-react';
import { useAppointments, useProfessionals, useCustomers, useServices } from '../hooks/useData';
import useStore from '../store';
import { useAuth } from '../context/AuthContext';

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';

const Dashboard = () => {
    const { user } = useAuth();
    const { data: appointmentsData = [], isLoading: loadingAppointments } = useAppointments();
    const appointments = Array.isArray(appointmentsData) ? appointmentsData : [];
    const { data: customers = [], isLoading: loadingCustomers } = useCustomers();
    const { openModal } = useStore();

    // --- Data Processing ---
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
    });

    const revenueData = last7Days.map(date => {
        const dayAppointments = appointments.filter(i => {
            if (!i.dateTime) return false;
            const appDate = new Date(i.dateTime).toISOString().split('T')[0];
            return appDate === date && i.status === 'completed';
        });

        const dailyRevenue = dayAppointments.reduce((sum, i) => sum + (Number(i.service?.price) || 0), 0);

        return {
            name: new Date(date).toLocaleDateString('tr-TR', { weekday: 'short' }),
            value: dailyRevenue
        };
    });

    const serviceStats = appointments.reduce((acc, curr) => {
        const name = curr.service?.name || 'Diğer';
        acc[name] = (acc[name] || 0) + 1;
        return acc;
    }, {});

    const serviceData = Object.entries(serviceStats)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    const COLORS = ['#8b5cf6', '#06b6d4', '#ec4899', '#f59e0b', '#10b981'];

    const stats = {
        totalAppointments: appointments.length,
        completedAppointments: appointments.filter((i) => i.status === 'completed').length,
        pendingAppointments: appointments.filter((i) => i.status === 'pending').length,
        totalRevenue: appointments.filter((i) => i.status === 'completed')
            .reduce((sum, i) => sum + (Number(i.service?.price) || 0), 0),
    };

    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter((i) => {
        if (!i.dateTime) return false;
        const appDate = new Date(i.dateTime).toISOString().split('T')[0];
        return appDate === today;
    }).sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

    const recentActivity = [
        ...appointments.map(a => ({
            type: 'appointment',
            date: new Date(a.createdAt),
            data: a
        })),
        ...customers.map(c => ({
            type: 'customer',
            date: new Date(c.createdAt),
            data: c
        }))
    ].sort((a, b) => b.date - a.date).slice(0, 5);

    // --- Components ---

    const StatCard = ({ title, value, icon: Icon, trend, trendValue, gradientClass, delay }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay * 0.1 }}
            className={`p-6 rounded-2xl relative overflow-hidden group ${gradientClass}`}
        >
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                <Icon className="w-24 h-24 transform rotate-12 translate-x-4 -translate-y-4" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                    {trend && (
                        <div className="flex items-center gap-1 text-white/90 text-sm font-medium bg-white/10 px-2 py-1 rounded-full backdrop-blur-sm">
                            <TrendingUp className="w-3 h-3" />
                            <span>{trendValue}</span>
                        </div>
                    )}
                </div>
                <h3 className="text-white/80 text-sm font-medium mb-1">{title}</h3>
                <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
            </div>
        </motion.div>
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8 pb-10"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        Merhaba, <span className="text-gradient">{user?.name || 'Yönetici'}</span> 👋
                    </h1>
                    <p className="text-slate-500 mt-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div className="flex gap-3">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openModal('appointmentCreate')}
                        className="btn-premium flex items-center gap-2 shadow-indigo-500/20"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Yeni Randevu</span>
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openModal('customerCreate')}
                        className="btn-ghost-premium flex items-center gap-2"
                    >
                        <UserPlus className="w-5 h-5" />
                        <span>Müşteri Ekle</span>
                    </motion.button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Toplam Randevu"
                    value={stats.totalAppointments}
                    icon={Calendar}
                    trend={true}
                    trendValue="12%"
                    gradientClass="card-gradient-1"
                    delay={1}
                />
                <StatCard
                    title="Tamamlanan"
                    value={stats.completedAppointments}
                    icon={Check}
                    trend={true}
                    trendValue="8%"
                    gradientClass="card-gradient-2"
                    delay={2}
                />
                <StatCard
                    title="Bekleyen"
                    value={stats.pendingAppointments}
                    icon={Clock}
                    gradientClass="card-gradient-4"
                    delay={3}
                />
                <StatCard
                    title="Toplam Ciro"
                    value={`₺${stats.totalRevenue.toLocaleString()}`}
                    icon={DollarSign}
                    trend={true}
                    trendValue="15%"
                    gradientClass="card-gradient-3"
                    delay={4}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (Charts) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Revenue Chart */}
                    <div className="card-premium p-6 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-indigo-500" />
                                    Haftalık Gelir Analizi
                                </h3>
                                <p className="text-sm text-slate-500">Son 7 günlük performans</p>
                            </div>
                        </div>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `₺${value}`} />
                                    <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                        formatter={(value) => [`₺${value}`, 'Gelir']}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Today's Schedule */}
                    <div className="card-premium p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-indigo-500" />
                                Bugünün Randevuları
                            </h3>
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm font-medium border border-indigo-100">
                                {todayAppointments.length} Randevu
                            </span>
                        </div>

                        <div className="space-y-4">
                            {todayAppointments.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                                    <Sparkles className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                    <p className="text-slate-500 font-medium">Bugün için planlanmış randevu yok</p>
                                    <button
                                        onClick={() => openModal('appointmentCreate')}
                                        className="text-indigo-600 text-sm mt-2 font-medium hover:underline"
                                    >
                                        Hemen oluşturun
                                    </button>
                                </div>
                            ) : (
                                todayAppointments.map((appointment) => (
                                    <motion.div
                                        key={appointment.id}
                                        whileHover={{ scale: 1.01 }}
                                        className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group"
                                    >
                                        <div className="p-3 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                                            <Clock className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="text-slate-900 font-semibold truncate">
                                                    {appointment.customer?.name || 'İsimsiz Müşteri'}
                                                </h4>
                                                <span className="text-sm font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                                                    {new Date(appointment.dateTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <Scissors className="w-3 h-3 text-pink-500" />
                                                    {appointment.service?.name}
                                                </span>
                                                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-3 h-3 text-blue-500" />
                                                    {appointment.professional?.name}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${appointment.status === 'completed'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-amber-100 text-amber-800'
                                                    }`}
                                            >
                                                {appointment.status === 'completed' ? 'Tamamlandı' : 'Bekliyor'}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                    {/* Service Distribution */}
                    <div className="card-premium p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-500" />
                            Popüler Hizmetler
                        </h3>
                        <div className="h-64 w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={serviceData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {serviceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pb-8">
                                <span className="text-3xl font-bold text-slate-800">{serviceData.reduce((a, b) => a + b.value, 0)}</span>
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">İşlem</p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="card-premium p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-blue-500" />
                                Son Aktiviteler
                            </h3>
                        </div>
                        <div className="space-y-6 relative">
                            {/* Vertical Line */}
                            <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-100" />

                            {recentActivity.map((item, idx) => (
                                <div key={idx} className="flex gap-4 relative">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white shadow-sm ${item.type === 'appointment' ? 'bg-violet-100 text-violet-600' : 'bg-cyan-100 text-cyan-600'
                                        }`}>
                                        {item.type === 'appointment' ? <Calendar className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                                    </div>
                                    <div className="pt-1">
                                        <p className="text-sm text-slate-900 font-medium">
                                            {item.type === 'appointment'
                                                ? `Yeni randevu: ${item.data.customer?.name || 'Müşteri'}`
                                                : `Yeni müşteri: ${item.data.name}`}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {new Date(item.date).toLocaleString('tr-TR')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pro Widget */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 shadow-xl">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Sparkles className="w-32 h-32" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-indigo-500/20 rounded-lg backdrop-blur-sm border border-indigo-500/30">
                                    <Zap className="w-6 h-6 text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Pro Plan</h3>
                                    <p className="text-slate-400 text-xs">Premium Özellikler</p>
                                </div>
                            </div>
                            <div className="w-full bg-slate-700/50 rounded-full h-2 mb-2">
                                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full h-2 w-[75%] shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                            </div>
                            <div className="flex justify-between text-xs text-slate-400">
                                <span>Kullanım</span>
                                <span>%75</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
