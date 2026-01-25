import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Calendar, Box, Info, X } from 'lucide-react';

const Notifications = ({ isOpen, onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('/api/notifications', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error('Bildirim yükleme hatası:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                setNotifications(notifications.map(n => 
                    n.id === notificationId ? { ...n, isRead: true } : n
                ));
            }
        } catch (error) {
            console.error('Bildirim işaretleme hatası:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
            
            for (const id of unreadIds) {
                await fetch(`/api/notifications/${id}/read`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            }
            
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Tüm bildirimleri işaretleme hatası:', error);
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'success':
            case 'confirmed':
                return <Calendar className="w-4 h-4" />;
            case 'error':
            case 'cancelled':
                return <Box className="w-4 h-4" />;
            default:
                return <Info className="w-4 h-4" />;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'success':
                return 'bg-green-100 text-green-600';
            case 'error':
                return 'bg-red-100 text-red-600';
            case 'confirmed':
                return 'bg-indigo-100 text-indigo-600';
            case 'info':
                return 'bg-blue-100 text-blue-600';
            default:
                return 'bg-slate-100 text-slate-600';
        }
    };

    const formatTime = (date) => {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Az önce';
        if (minutes < 60) return `${minutes} dk önce`;
        if (hours < 24) return `${hours} saat önce`;
        if (days < 7) return `${days} gün önce`;
        
        return new Date(date).toLocaleDateString('tr-TR');
    };

    if (!isOpen) return null;

    const unreadCount = notifications.filter(n => !n.isRead).length;

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
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800">Bildirimler</h3>
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center text-slate-500">
                            <div className="inline-block animate-spin">
                                <Bell className="w-6 h-6" />
                            </div>
                            <p className="mt-2 text-sm">Bildirimler yükleniyor...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            <Bell className="w-12 h-12 mx-auto mb-2 opacity-20" />
                            <p className="text-sm">Henüz bildirim yok</p>
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <div
                                key={notif.id}
                                onClick={() => !notif.isRead && markAsRead(notif.id)}
                                className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${!notif.isRead ? 'bg-indigo-50/30' : ''}`}
                            >
                                <div className="flex gap-3">
                                    <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getTypeColor(notif.type)}`}>
                                        {getTypeIcon(notif.type)}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className={`text-sm font-semibold ${!notif.isRead ? 'text-slate-900' : 'text-slate-600'}`}>
                                            {notif.title}
                                        </h4>
                                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                            {notif.message}
                                        </p>
                                        <span className="text-[10px] text-slate-400 mt-2 block">
                                            {formatTime(notif.createdAt)}
                                        </span>
                                    </div>
                                    {!notif.isRead && (
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-2"></div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                    {unreadCount > 0 && (
                        <button 
                            onClick={markAllAsRead}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                        >
                            Tümünü Okundu İşaretle
                        </button>
                    )}
                </div>
            </motion.div>
        </>
    );
};

export default Notifications;
