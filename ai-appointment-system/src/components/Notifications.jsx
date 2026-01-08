import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Calendar, Box, Info, X } from 'lucide-react';

const Notifications = ({ isOpen, onClose }) => {
    // Mock Notifications
    const notifications = [
        {
            id: 1,
            title: 'Yeni Randevu Talebi',
            desc: 'Ayşe Y. tarafından "Saç Kesimi" için randevu oluşturuldu.',
            time: '10 dk önce',
            type: 'appointment',
            read: false
        },
        {
            id: 2,
            title: 'Stok Uyarısı',
            desc: 'Loreal Oksidan stokları kritik seviyenin altına düştü (3 adet kaldı).',
            time: '1 saat önce',
            type: 'inventory',
            read: false
        },
        {
            id: 3,
            title: 'Sistem Güncellemesi',
            desc: 'Yazılım sürümüv2.1.0 başarıyla güncellendi. Yeni özellikler aktif.',
            time: '2 gün önce',
            type: 'system',
            read: true
        }
    ];

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-40" onClick={onClose}></div>
            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
            >
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Bildirimler</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${!notif.read ? 'bg-indigo-50/30' : ''}`}
                        >
                            <div className="flex gap-3">
                                <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${notif.type === 'appointment' ? 'bg-indigo-100 text-indigo-600' :
                                        notif.type === 'inventory' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                                    }`}>
                                    {notif.type === 'appointment' ? <Calendar className="w-4 h-4" /> :
                                        notif.type === 'inventory' ? <Box className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                                </div>
                                <div>
                                    <h4 className={`text-sm font-semibold ${!notif.read ? 'text-slate-900' : 'text-slate-600'}`}>
                                        {notif.title}
                                    </h4>
                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                        {notif.desc}
                                    </p>
                                    <span className="text-[10px] text-slate-400 mt-2 block">
                                        {notif.time}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                    <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                        Tümünü Okundu İşaretle
                    </button>
                </div>
            </motion.div>
        </>
    );
};

export default Notifications;
