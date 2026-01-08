import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { Star } from 'lucide-react';

const COLORS = ['#8b5cf6', '#06b6d4', '#ec4899', '#f59e0b', '#10b981'];

const ServiceDistribution = ({ data }) => {
    return (
        <div className="card-premium p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Popüler Hizmetler
            </h3>
            <div className="h-64 w-full relative" style={{ minHeight: '256px' }}>
                <ResponsiveContainer width="100%" height={256}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pb-8">
                    <span className="text-3xl font-bold text-slate-800">{data.reduce((a, b) => a + b.value, 0)}</span>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">İşlem</p>
                </div>
            </div>
        </div>
    );
};

export default ServiceDistribution;
