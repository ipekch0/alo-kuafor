import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Store,
    Settings,
    Activity,
    TrendingUp,
    DollarSign,
    AlertCircle,
    CheckCircle2,
    Server,
    MessageCircle,
    Power
} from 'lucide-react';

const SuperAdminDashboard = () => {
    const { token, user } = useAuth(); // Assuming useAuth exposes the user object
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({
        totalRevenue: 0,
        activeSalons: 0,
        totalAppointments: 0,
        systemStatus: 'Checking...'
    });
    const [salons, setSalons] = useState([]);
    const [systemHealth, setSystemHealth] = useState(null);
    const [messages, setMessages] = useState([]);

    // --- ADMIN AUTHENTICATION ---
    // Check if user has SUPER_ADMIN role from token/context
    const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'admin';
    
    if (!isSuperAdmin) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
                <div className="text-center text-white">
                    <h1 className="text-3xl font-bold mb-4">Erişim Reddedildi</h1>
                    <p className="text-slate-400 mb-6">Bu panele sadece yöneticiler erişebilir.</p>
                    <Link to="/" className="inline-block px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition">
                        Ana Sayfaya Dön
                    </Link>
                </div>
            </div>
        );
    }
    // -------------------------

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                // Fetch Stats
                const statsRes = await axios.get('/api/admin/stats', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(statsRes.data.stats);
                setSalons(statsRes.data.salons);

                // Fetch Health
                const healthRes = await axios.get('/api/admin/system-health', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSystemHealth(healthRes.data);

            } catch (error) {
                console.error('Admin API Error:', error);
            }
        };

        if (token && isSuperAdmin) {
            fetchAdminData();
        }
    }, [token, isSuperAdmin]);

    const handleImpersonate = async (userId) => {
        if (!confirm('Bu salon sahibinin hesabına girmek üzeresiniz. Onaylıyor musunuz?')) return;
        try {
            const res = await axios.post('/api/admin/impersonate', { userId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Save token and reload as if logged in as him
            localStorage.setItem('token', res.data.token);
            // We need to force reload or redirect
            window.location.href = '/panel';
        } catch (error) {
            alert('Giriş Başarısız: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleBan = async (userId) => {
        const action = prompt('Yasaklamak için "ban", kaldırmak için "unban" yazın:');
        if (!action) return;
        try {
            await axios.post('/api/admin/ban-user', { userId, action }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('İşlem Başarılı');
            // Refresh logic here
            window.location.reload();
        } catch (error) {
            alert('Hata: ' + (error.response?.data?.error || error.message));
        }
    };

    const fetchMessages = async () => {
        if (activeTab !== 'whatsapp') return;
        try {
            const res = await axios.get('/api/admin/messages', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(res.data);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchMessages(); }, [activeTab]);

    const statCards = [
        { title: 'Toplam Gelir', value: `${stats.totalRevenue} ₺`, change: 'Real-time', icon: DollarSign, color: 'bg-emerald-500' },
        { title: 'Aktif Salonlar', value: stats.activeSalons, change: 'Verified', icon: Store, color: 'bg-indigo-500' },
        { title: 'Toplam Randevu', value: stats.totalAppointments, change: 'All Time', icon: Calendar, color: 'bg-blue-500' },
        { title: 'Sunucu Durumu', value: stats.systemStatus, change: process.env.NODE_ENV === 'production' ? 'Prod' : 'Dev', icon: Server, color: 'bg-amber-500' },
    ];

    
    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans flex">

            {/* Sidebar */}
            <div className="w-64 border-r border-slate-800 bg-slate-900 flex flex-col">
                <div className="h-20 flex items-center px-8 border-b border-slate-800">
                    <div className="font-bold text-2xl tracking-tighter bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                        GOD MODE
                    </div>
                </div>

                <nav className="flex-1 py-6 px-4 space-y-2">
                    {[
                        { id: 'overview', label: 'Genel Bakış', icon: LayoutDashboard },
                        { id: 'salons', label: 'Salon Yönetimi', icon: Store },
                        { id: 'users', label: 'Kullanıcılar', icon: Users },
                        { id: 'system', label: 'Sistem & API', icon: Activity },
                        { id: 'whatsapp', label: 'Mesajlar (Spy)', icon: MessageCircle },
                        { id: 'settings', label: 'Ayarlar', icon: Settings },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/50">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-medium text-slate-400">BOSS Server: Online</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-slate-950 overflow-y-auto">
                {/* Header */}
                <header className="h-20 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
                    <h2 className="text-xl font-bold">Tanrı Modu Aktif</h2>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                            <div className="text-sm font-bold">Yasin (Super Admin)</div>
                            <div className="text-xs text-emerald-400 font-mono">ROOT_ACCESS</div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-lg">Y</div>
                    </div>
                </header>

                <main className="p-8 space-y-8">
                    {/* Stats Grid */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {statCards.map((stat, i) => (
                                <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
                                    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${stat.color.replace('bg-', 'text-')}`}>
                                        <stat.icon className="w-16 h-16" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="text-slate-400 text-sm font-medium mb-1">{stat.title}</div>
                                        <div className="text-3xl font-bold mb-2">{stat.value}</div>
                                        <div className={`text-xs font-bold inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-800 ${stat.change.includes('+') ? 'text-emerald-400' : 'text-slate-400'}`}>
                                            <TrendingUp className="w-3 h-3" />
                                            {stat.change}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Content Area */}
                    <div className="grid grid-cols-1 gap-8">

                        {/* Salon/User List with GOD Actions */}
                        {(activeTab === 'overview' || activeTab === 'salons') && (
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                                    <h3 className="font-bold text-lg">Salonlar ve İşlemler</h3>
                                </div>
                                <table className="w-full text-left">
                                    <thead className="bg-slate-950 text-slate-400 text-xs uppercase font-bold">
                                        <tr>
                                            <th className="px-6 py-4">Salon Adı</th>
                                            <th className="px-6 py-4">Sahibi</th>
                                            <th className="px-6 py-4">Durum</th>
                                            <th className="px-6 py-4">Ciro</th>
                                            <th className="px-6 py-4 text-right">GOD ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {salons.map(salon => (
                                            <tr key={salon.id} className="hover:bg-slate-800/50 transition-colors group">
                                                <td className="px-6 py-4 font-medium">{salon.name}</td>
                                                <td className="px-6 py-4">{salon.owner}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize
                                                    ${salon.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                                                            salon.status === 'pending' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                                                        {salon.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-300">{salon.monthlyRevenue} ₺</td>
                                                <td className="px-6 py-4 text-right space-x-2">
                                                    <button
                                                        onClick={() => handleImpersonate(salon.id)} // Assuming salon.id matches owner logic (need to fix in backend stats if ownerID not returned)
                                                        className="text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors border border-indigo-500 shadow-lg shadow-indigo-500/20"
                                                    >
                                                        Hesaba Gir
                                                    </button>
                                                    <button
                                                        onClick={() => handleBan(salon.id)}
                                                        className="text-xs font-bold bg-slate-800 hover:bg-red-900/50 text-slate-300 hover:text-red-400 px-3 py-1.5 rounded-lg transition-colors"
                                                    >
                                                        Yasakla
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* SPY MODE: MESSAGES */}
                        {activeTab === 'whatsapp' && (
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-6">
                                <h3 className="font-bold text-lg mb-4 text-emerald-400 font-mono">CANLI MESAJ AKIŞI (Gizli)</h3>
                                <div className="space-y-4">
                                    {messages.map(msg => (
                                        <div key={msg.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
                                            <div className="flex justify-between text-xs text-slate-500">
                                                <span>{msg.conversation?.salon?.name} ↔ {msg.conversation?.user?.name}</span>
                                                <span>{new Date(msg.createdAt).toLocaleString()}</span>
                                            </div>
                                            <div className={`p-3 rounded-lg text-sm ${msg.senderType === 'SALON' ? 'bg-indigo-900/20 text-indigo-300 self-end ml-10' : 'bg-slate-800 text-slate-300 self-start mr-10'}`}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    ))}
                                    {messages.length === 0 && <div className="text-slate-500">Henüz mesaj yok.</div>}
                                </div>
                            </div>
                        )}

                    </div>
                </main>
            </div>
        </div>
    );
};

// Dummy icon for Calendar
function Calendar(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
    )
}


export default SuperAdminDashboard;
