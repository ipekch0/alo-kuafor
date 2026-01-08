import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, User, FileText, Briefcase, Sparkles, ChevronDown } from 'lucide-react';
import { useProfessionals, useServices, useCreateAppointment } from '../hooks/useData';
import useStore from '../store';
import toast from 'react-hot-toast';

const AppointmentCreateModal = () => {
    const { modals, closeModal, setSelectedView, setCurrentAppointmentId } = useStore();
    const isOpen = modals.appointmentCreate;

    const { data: professionals = [] } = useProfessionals();
    const { data: services = [] } = useServices();
    const createAppointment = useCreateAppointment();

    const [formData, setFormData] = useState({
        professionalId: '',
        serviceId: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        notes: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await createAppointment.mutateAsync({
                ...formData,
                professionalId: parseInt(formData.professionalId),
                serviceId: parseInt(formData.serviceId),
                status: 'scheduled'
            });

            closeModal('appointmentCreate');
            setFormData({
                professionalId: '',
                serviceId: '',
                date: new Date().toISOString().split('T')[0],
                time: '09:00',
                notes: ''
            });

            if (result && result.id) {
                setCurrentAppointmentId(result.id);
                setSelectedView('appointments');
                toast.success('Randevu başarıyla oluşturuldu');
            }
        } catch (error) {
            console.error('Error creating appointment:', error);
            toast.error('Randevu oluşturulurken hata oluştu.');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative"
                    >
                        {/* Header Content */}
                        <div className="relative z-10 px-8 pt-8 pb-6 flex items-start justify-between border-b border-slate-100">
                            <div>
                                <div className="p-3 bg-purple-50 rounded-2xl inline-block mb-4">
                                    <Sparkles className="w-8 h-8 text-purple-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900">Yeni Randevu</h3>
                                <p className="text-slate-500 text-sm mt-1">Müşteri için yeni bir işlem planlayın</p>
                            </div>
                            <button
                                onClick={() => closeModal('appointmentCreate')}
                                className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Service Selection */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-purple-500" />
                                        Hizmet Paketi
                                    </label>
                                    <div className="relative">
                                        <select
                                            required
                                            value={formData.serviceId}
                                            onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                                            className="input-premium appearance-none"
                                        >
                                            <option value="">Paket Seçiniz...</option>
                                            {services.map(service => (
                                                <option key={service.id} value={service.id}>
                                                    {service.name} - {service.price} TL
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Professional Selection */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <User className="w-4 h-4 text-purple-500" />
                                        Personel Atama
                                    </label>
                                    <div className="relative">
                                        <select
                                            required
                                            value={formData.professionalId}
                                            onChange={(e) => setFormData({ ...formData, professionalId: e.target.value })}
                                            className="input-premium appearance-none"
                                        >
                                            <option value="">Personel Seçiniz...</option>
                                            {professionals.map(professional => (
                                                <option key={professional.id} value={professional.id}>
                                                    {professional.name} ({professional.title})
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Date & Time */}
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-orange-500" />
                                            Tarih
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="input-premium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-pink-500" />
                                            Saat
                                        </label>
                                        <input
                                            type="time"
                                            required
                                            value={formData.time}
                                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                            className="input-premium"
                                        />
                                    </div>
                                </div>

                                {/* Notes */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-slate-500" />
                                        Notlar
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        rows="3"
                                        className="input-premium resize-none"
                                        placeholder="Varsa ek notlar..."
                                    />
                                </div>

                                {/* Actions */}
                                <div className="pt-4 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => closeModal('appointmentCreate')}
                                        className="flex-1 btn-ghost-premium"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createAppointment.isPending}
                                        className="flex-1 btn-premium shadow-purple-500/25"
                                    >
                                        {createAppointment.isPending ? 'Oluşturuluyor...' : 'Oluştur'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AppointmentCreateModal;
