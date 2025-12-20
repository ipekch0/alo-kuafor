import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, User, FileText, Camera, PenTool, UserCircle, Phone, Mail, MapPin } from 'lucide-react';
import { useAppointment } from '../hooks/useData';
import useStore from '../store';

const AppointmentDetail = () => {
    const { currentAppointmentId, setSelectedView } = useStore();
    const { data: appointment, isLoading } = useAppointment(currentAppointmentId);
    const [activeTab, setActiveTab] = useState('overview');

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-slate-400">Yükleniyor...</div>
            </div>
        );
    }

    if (!appointment) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <FileText className="w-12 h-12 mb-4" />
                <p>Randevu bulunamadı.</p>
                <button
                    onClick={() => setSelectedView('dashboard')}
                    className="mt-4 px-4 py-2 bg-slate-100 rounded-lg text-slate-600 hover:bg-slate-200"
                >
                    Geri Dön
                </button>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Genel Bakış', icon: FileText },
        { id: 'notes', label: 'Notlar', icon: PenTool },
        { id: 'photos', label: 'Fotoğraflar', icon: Camera },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => setSelectedView('appointments')}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-slate-400" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                        {appointment.customer?.name || 'Randevu Detayı'}
                    </h2>
                    <p className="text-slate-500">
                        {appointment.service?.name} • {appointment.status === 'completed' ? 'Tamamlandı' : 'Bekliyor'}
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 pb-1">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-t-lg transition-colors relative ${activeTab === tab.id ? 'text-brand-dark bg-brand-light/10' : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-dark"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="glass-card p-6">
                {activeTab === 'overview' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                    >
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Müşteri Bilgileri</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-3 mb-2">
                                        <UserCircle className="w-5 h-5 text-brand-primary" />
                                        <p className="text-sm text-slate-500">Ad Soyad</p>
                                    </div>
                                    <p className="text-slate-800 font-medium pl-8">{appointment.customer?.name || '-'}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Phone className="w-5 h-5 text-brand-dark" />
                                        <p className="text-sm text-slate-500">Telefon</p>
                                    </div>
                                    <p className="text-slate-800 font-medium pl-8">{appointment.customer?.phone || '-'}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Mail className="w-5 h-5 text-brand-light" />
                                        <p className="text-sm text-slate-500">E-posta</p>
                                    </div>
                                    <p className="text-slate-800 font-medium pl-8">{appointment.customer?.email || '-'}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-3 mb-2">
                                        <MapPin className="w-5 h-5 text-slate-400" />
                                        <p className="text-sm text-slate-500">Adres</p>
                                    </div>
                                    <p className="text-slate-800 font-medium pl-8">{appointment.customer?.address || '-'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Randevu Bilgileri</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Calendar className="w-5 h-5 text-brand-primary" />
                                    <span>{new Date(appointment.dateTime).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Clock className="w-5 h-5 text-brand-dark" />
                                    <span>{new Date(appointment.dateTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <User className="w-5 h-5 text-slate-500" />
                                    <span>{appointment.professional?.name} ({appointment.professional?.title || 'Uzman'})</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <FileText className="w-5 h-5 text-brand-dark" />
                                    <span>{appointment.service?.name} - {appointment.service?.price} TL</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'notes' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-12"
                    >
                        <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Notlar</h3>
                        <p className="text-slate-500 mb-6">{appointment.notes || 'Not bulunmuyor.'}</p>
                        <button className="btn-primary px-6 py-3">
                            Not Ekle
                        </button>
                    </motion.div>
                )}

                {activeTab === 'photos' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-12"
                    >
                        <Camera className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Fotoğraf Galerisi</h3>
                        <p className="text-slate-500 mb-6">Henüz fotoğraf yüklenmemiş.</p>
                        <button className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors">
                            Fotoğraf Yükle
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default AppointmentDetail;
