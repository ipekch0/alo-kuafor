import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wallet, TrendingUp, TrendingDown, Plus, Trash2, Calendar,
    Download, PieChart as PieIcon, ArrowUpRight, DollarSign,
    FileSpreadsheet, FileText
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { toast } from 'react-hot-toast';

const Finance = () => {
    // State for Real Data
    const [stats, setStats] = useState({ revenue: 0, expenses: 0, profit: 0, breakdown: {} });
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    // Form state
    const [newExpense, setNewExpense] = useState({
        category: 'supplies',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    // Professional Color Palette
    const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6'];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch Real Data from Backend
            const [statsRes, expensesRes] = await Promise.all([
                fetch('/api/accounting/stats', { headers }),
                fetch('/api/accounting/expenses', { headers })
            ]);

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData);
            }
            if (expensesRes.ok) {
                const expensesData = await expensesRes.json();
                setExpenses(expensesData);
            }
        } catch (error) {
            console.error('Error fetching finance data:', error);
            toast.error('Veriler güncellenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/accounting/expenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...newExpense,
                    // Salon ID is handled by backend via user token
                })
            });

            if (res.ok) {
                toast.success('Gider başarıyla eklendi');
                setShowAddModal(false);
                setNewExpense({ category: 'supplies', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
                fetchData(); // Refresh data
            } else {
                toast.error('Gider eklenemedi');
            }
        } catch (error) {
            toast.error('Bir hata oluştu');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Bu gider kaydını silmek istediğinize emin misiniz?')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/accounting/expenses/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                toast.success('Kayıt silindi');
                fetchData();
            }
        } catch (e) {
            toast.error('Silme başarısız');
        }
    };

    const handleExportExcel = () => {
        const headers = ['Tarih', 'Kategori', 'Aciklama', 'Tutar'];
        const rows = expenses.map(e => [
            new Date(e.date).toLocaleDateString('tr-TR'),
            e.category,
            `"${e.description || ''}"`,
            e.amount
        ]);

        const summary = [
            ['Finans Raporu', new Date().toLocaleDateString('tr-TR')],
            [''],
            ['Toplam Gelir', stats.revenue],
            ['Toplam Gider', stats.expenses],
            ['Net Kar', stats.profit],
            [''],
            headers
        ];

        const csvContent = "\uFEFF" +
            summary.map(e => e.join(";")).join("\n") + "\n" +
            rows.map(e => e.join(";")).join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `finans_raporu_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPDF = () => {
        window.print();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
    };

    const pieData = Object.entries(stats.breakdown || {}).map(([name, value]) => ({ name, value }));

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium">Finans verileri analiz ediliyor...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6 lg:p-10 font-sans text-slate-900">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Print Header (Visible only in print) */}
                <div className="print-header hidden pb-8 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-slate-900">ODAKMANAGE - Finans Raporu</h1>
                    <p className="text-slate-500">{new Date().toLocaleDateString('tr-TR', { dateStyle: 'full' })}</p>
                </div>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Finans Yönetimi (v3)</h1>
                        <p className="text-slate-500 mt-1">İşletmenizin nakit akışını gerçek zamanlı takip edin.</p>
                    </div>


                    <div className="flex items-center gap-2 no-print">
                        <button
                            onClick={handleExportExcel}
                            className="flex items-center gap-2 px-10 py-2.5 bg-emerald-50 text-emerald-600 font-medium rounded-xl hover:bg-emerald-100 transition-colors border border-emerald-200"
                            title="Excel Olarak İndir"
                        >
                            <FileSpreadsheet size={18} />
                            <span className="hidden sm:inline">İndir Excel</span>
                        </button>
                        <button
                            onClick={handleExportPDF}
                            className="flex items-center gap-2 px-10 py-2.5 bg-rose-50 text-rose-600 font-medium rounded-xl hover:bg-rose-100 transition-colors border border-rose-200"
                            title="PDF Olarak Yazdır"
                        >
                            <FileText size={18} />
                            <span className="hidden sm:inline">İndir PDF</span>
                        </button>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl shadow-lg shadow-slate-900/10 transition-all hover:scale-[1.02] active:scale-[0.98] ml-2"
                        >
                            <Plus size={20} />
                            Gider Ekle
                        </button>
                        <button
                            onClick={async () => {
                                try {
                                    const token = localStorage.getItem('token');
                                    const res = await fetch('/api/accounting/debug-revenue', { headers: { Authorization: `Bearer ${token}` } });
                                    const data = await res.json();
                                    alert(JSON.stringify(data, null, 2));
                                } catch (e) { alert('Debug Error: ' + e.message); }
                            }}
                            className="px-3 py-3 bg-gray-800 text-white rounded-xl ml-2 text-xs font-mono"
                        >
                            DEBUG
                        </button>

                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Revenue Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-emerald-50 rounded-xl">
                                <TrendingUp size={24} className="text-emerald-600" />
                            </div>
                            <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-semibold">
                                <ArrowUpRight size={14} /> Gelir
                            </span>
                        </div>
                        <p className="text-sm font-medium text-slate-500">Toplam Ciro</p>
                        <h3 className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">{formatCurrency(stats.revenue)}</h3>
                    </motion.div>

                    {/* Expenses Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-rose-50 rounded-xl">
                                <TrendingDown size={24} className="text-rose-600" />
                            </div>
                            <span className="flex items-center gap-1 text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full text-xs font-semibold">
                                <ArrowUpRight size={14} /> Gider
                            </span>
                        </div>
                        <p className="text-sm font-medium text-slate-500">Toplam Harcama</p>
                        <h3 className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">{formatCurrency(stats.expenses)}</h3>
                    </motion.div>

                    {/* Profit Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-slate-900 p-6 rounded-2xl shadow-xl shadow-slate-900/10 text-white relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Wallet size={100} />
                        </div>
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="p-3 bg-white/10 rounded-xl">
                                <Wallet size={24} className="text-emerald-300" />
                            </div>
                            <span className="flex items-center gap-1 text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-full text-xs font-semibold">
                                Net Kâr
                            </span>
                        </div>
                        <p className="text-sm font-medium text-slate-300 relative z-10">Net Kazanç</p>
                        <h3 className="text-3xl font-bold text-white mt-1 tracking-tight relative z-10">
                            {formatCurrency(stats.profit)}
                        </h3>
                    </motion.div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Pie Chart: Expense Breakdown */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
                    >
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Gider Dağılımı</h3>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={pieData.length > 0 ? pieData : [{ name: 'Veri Yok', value: 1 }]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                        {pieData.length === 0 && <Cell fill="#f1f5f9" />}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        formatter={(value) => formatCurrency(value)}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Area Chart: Projection (Using static data structure for forecast visualization, but logic ready for real historical API) */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-900">Aylık Performans</h3>
                            <span className="text-xs text-slate-400 font-medium px-2 py-1 bg-slate-50 rounded-lg">Son 6 Ay</span>
                        </div>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <AreaChart data={stats.monthlyStats || []}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} dy={10} />
                                    <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(val) => `₺${val / 1000}k`} dx={-10} />
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        formatter={(value) => formatCurrency(value)}
                                    />
                                    <Area type="monotone" dataKey="revenue" name="Gelir" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                                    <Area type="monotone" dataKey="expense" name="Gider" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                {/* Recent Transactions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
                >
                    <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-900">Son İşlemler</h3>
                        <span className="text-sm text-slate-400">Gerçek Zamanlı</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                                <tr>
                                    <th className="px-6 py-4">Tarih</th>
                                    <th className="px-6 py-4">Kategori</th>
                                    <th className="px-6 py-4">Açıklama</th>
                                    <th className="px-6 py-4 text-right">Tutar</th>
                                    <th className="px-6 py-4 text-center">İşlem</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {expenses.map((expense) => (
                                    <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {new Date(expense.date).toLocaleDateString('tr-TR')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 capitalize">
                                                {expense.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 max-w-xs truncate">{expense.description || '-'}</td>
                                        <td className="px-6 py-4 text-right font-bold text-slate-900">
                                            {formatCurrency(expense.amount)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleDelete(expense.id)}
                                                className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {expenses.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="p-3 bg-slate-50 rounded-full">
                                                    <DollarSign className="w-6 h-6 text-slate-300" />
                                                </div>
                                                <p>Henüz harcama kaydı bulunmuyor.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>

            {/* Add Expense Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                            onClick={() => setShowAddModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative z-10 overflow-hidden"
                        >
                            <div className="p-6 bg-slate-50 border-b border-slate-100">
                                <h2 className="text-xl font-bold text-slate-900">Gider Ekle</h2>
                                <p className="text-sm text-slate-500">Yeni bir harcama kaydı oluşturun</p>
                            </div>

                            <form onSubmit={handleAddExpense} className="p-6 space-y-5">
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-500 uppercase">Kategori</label>
                                        <select
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all cursor-pointer"
                                            value={newExpense.category}
                                            onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
                                        >
                                            <option value="rent">Kira</option>
                                            <option value="supplies">Malzeme</option>
                                            <option value="marketing">Reklam</option>
                                            <option value="salaries">Personel</option>
                                            <option value="utilities">Faturalar</option>
                                            <option value="tax">Vergi</option>
                                            <option value="other">Diğer</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-500 uppercase">Tutar (TL)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                required
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pl-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-bold font-mono"
                                                value={newExpense.amount}
                                                onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Tarih</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                                        value={newExpense.date}
                                        onChange={e => setNewExpense({ ...newExpense, date: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Açıklama</label>
                                    <textarea
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all min-h-[80px] resize-none"
                                        value={newExpense.description}
                                        onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                                        placeholder="İşlem detayı..."
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 px-4 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-xl transition-colors"
                                    >
                                        Vazgeç
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 transition-all"
                                    >
                                        Kaydet
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Finance;
