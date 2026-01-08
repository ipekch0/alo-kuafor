import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Search,
    Filter,
    Calendar,
    Clock,
    User,
    FileText,
    CheckCircle,
    XCircle,
    AlertCircle,
    Eye,
    Briefcase
} from 'lucide-react';
import { useAppointments, useUpdateAppointmentStatus } from '../hooks/useData';
import useStore from '../store';
import { toast } from 'react-hot-toast';

const AppointmentList = () => {
    const { data: appointmentsData = [], isLoading } = useAppointments();
    const appointments = Array.isArray(appointmentsData) ? appointmentsData : [];
    const { setSelectedView, setCurrentAppointmentId } = useStore();
    const updateStatusMutation = useUpdateAppointmentStatus();

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Filter appointments
    const filteredAppointments = appointments.filter((appointment) => {
        const matchesSearch =
            appointment.professional?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            appointment.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            appointment.service?.name?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleCardClick = (appointmentId) => {
        setCurrentAppointmentId(appointmentId);
        setSelectedView('appointment-detail');
    };

    const getStatusConfig = (status) => {
        const configs = {
            scheduled: {
                label: 'Planlandı',
                color: 'indigo-600',
                icon: Clock,
                bg: 'bg-indigo-50',
                border: 'border-indigo-200',
                text: 'text-indigo-700'
            },
            'in-progress': {
                label: 'Devam Ediyor',
                color: 'amber',
                icon: AlertCircle,
                bg: 'bg-amber-50',
                border: 'border-amber-200',
                text: 'text-amber-600'
            },
            completed: {
                label: 'Tamamlandı',
                color: 'emerald',
                icon: CheckCircle,
                bg: 'bg-emerald-50',
                border: 'border-emerald-200',
                text: 'text-emerald-600'
            },
            cancelled: {
                label: 'İptal',
                color: 'red',
                icon: XCircle,
                bg: 'bg-red-50',
                border: 'border-red-200',
                text: 'text-red-600'
            }
        };
        return configs[status] || configs.scheduled;
    };

    const statusCounts = {
        all: appointments.length,
        scheduled: appointments.filter(i => i.status === 'scheduled').length,
        'in-progress': appointments.filter(i => i.status === 'in-progress').length,
        completed: appointments.filter(i => i.status === 'completed').length,
        cancelled: appointments.filter(i => i.status === 'cancelled').length,
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Randevu Kartları</h2>
                    <p className="text-slate-500">Tüm randevuları görüntüleyin ve yönetin</p>
                </div>

                {/* Search */}
                <div className="relative w-full lg:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Müşteri, personel veya hizmet ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm text-sm placeholder:text-slate-400"
                    />
                </div>
            </div>

            {/* Status Filters */}
            <div className="flex flex-wrap gap-3">
                {[
                    { key: 'all', label: 'Tümü', icon: Filter },
                    { key: 'scheduled', label: 'Planlandı', icon: Clock },
                    { key: 'in-progress', label: 'Devam Ediyor', icon: AlertCircle },
                    { key: 'completed', label: 'Tamamlandı', icon: CheckCircle },
                    { key: 'cancelled', label: 'İptal', icon: XCircle },
                ].map((filter) => {
                    const Icon = filter.icon;
                    const isActive = statusFilter === filter.key;
                    return (
                        <button
                            key={filter.key}
                            onClick={() => setStatusFilter(filter.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${isActive
                                ? 'bg-gradient-to-r from-indigo-700 to-indigo-900 text-white shadow-md'
                                : 'bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-slate-200'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{filter.label}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${isActive ? 'bg-white/20' : 'bg-slate-100 text-slate-600'
                                }`}>
                                {statusCounts[filter.key]}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Appointments Grid */}
            {filteredAppointments.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Randevu Bulunamadı</h3>
                    <p className="text-slate-500">
                        {searchQuery ? 'Arama kriterlerinize uygun randevu bulunamadı.' : 'Henüz randevu oluşturulmamış.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAppointments.map((appointment) => {
                        const statusConfig = getStatusConfig(appointment.status);
                        const StatusIcon = statusConfig.icon;

                        return (
                            <motion.div
                                key={appointment.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => handleCardClick(appointment.id)}
                                className="glass-card p-6 cursor-pointer hover:shadow-glow transition-all duration-300 group"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-indigo-50 rounded-xl">
                                            <User className="w-6 h-6 text-indigo-700" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                                                {appointment.customer?.name || 'İsimsiz Müşteri'}
                                            </h3>
                                            <p className="text-sm text-slate-500">
                                                {appointment.customer?.phone || 'Telefon Yok'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${statusConfig.bg} ${statusConfig.border} border`}>
                                        <StatusIcon className={`w-4 h-4 ${statusConfig.text}`} />
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="space-y-3 mb-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Briefcase className="w-4 h-4 text-indigo-700" />
                                        <span className="text-slate-600">{appointment.service?.name || 'Paket Yok'}</span>
                                        <span className="ml-auto text-indigo-700 font-semibold">
                                            ₺{appointment.service?.price || 0}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="w-4 h-4 text-indigo-600" />
                                        <span className="text-slate-600">
                                            {new Date(appointment.dateTime).toLocaleDateString('tr-TR', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </span>
                                        <Clock className="w-4 h-4 text-indigo-700 ml-2" />
                                        <span className="text-slate-600">
                                            {new Date(appointment.dateTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="w-4 h-4 text-slate-400" />
                                        <span className="text-slate-600">{appointment.professional?.name || 'Personel Atanmadı'}</span>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <span className={`text-sm font-medium ${statusConfig.text}`}>
                                        {statusConfig.label}
                                    </span>
                                    <div className="flex gap-2">
                                        {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    updateStatusMutation.mutate({ id: appointment.id, status: 'completed' }, {
                                                        onSuccess: () => toast.success('Randevu tamamlandı!'),
                                                        onError: () => toast.error('Hata oluştu')
                                                    });
                                                }}
                                                className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 transition-colors px-3 py-1 bg-emerald-50 hover:bg-emerald-100 rounded-lg"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                <span>Tamamla</span>
                                            </button>
                                        )}
                                        <button className="flex items-center gap-1 text-sm text-indigo-700 hover:text-indigo-600 transition-colors">
                                            <Eye className="w-4 h-4" />
                                            <span>Detay</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
};

export default AppointmentList;
