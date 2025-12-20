import React from 'react';
import { Activity, Calendar, UserPlus } from 'lucide-react';

const RecentActivity = ({ activity }) => {
    return (
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

                {activity.map((item, idx) => (
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
    );
};

export default RecentActivity;
