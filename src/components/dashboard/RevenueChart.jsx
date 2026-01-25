import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { Zap } from 'lucide-react';

const RevenueChart = ({ data }) => {
    return (
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
            <div className="h-80 w-full" style={{ minHeight: '320px' }}>
                <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
    );
};

export default RevenueChart;
