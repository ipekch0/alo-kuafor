import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Calendar,
    Clock,
    User,
    FileText,
    Briefcase,
    Sparkles,
    ChevronDown,
    Search,
    UserPlus,
    Check,
    ArrowRight,
    ArrowLeft
} from 'lucide-react';
import { useProfessionals, useServices, useCreateAppointment, useCustomers } from '../hooks/useData';
import useStore from '../store';
import toast from 'react-hot-toast';

const AppointmentCreateModal = () => {
    const { modals, closeModal, setSelectedView, setCurrentAppointmentId } = useStore();
    const isOpen = modals.appointmentCreate;

    const { data: professionals = [] } = useProfessionals();
    const { data: services = [] } = useServices();
    const { data: customers = [] } = useCustomers();
    const createAppointment = useCreateAppointment();

    const [step, setStep] = useState(1);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerSearch, setCustomerSearch] = useState('');
    const [isNewCustomer, setIsNewCustomer] = useState(false);

    // Form data for both customer (if new) and appointment
    const [formData, setFormData] = useState({
        // New Customer Data
        customerName: '',
        customerPhone: '',

        // Appointment Data
        professionalId: '',
        serviceId: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        notes: ''
    });

    // Reset state when closing
    const handleClose = () => {
        closeModal('appointmentCreate');
        // Small delay to prevent UI flickering during exit animation
        setTimeout(() => {
            setStep(1);
            setSelectedCustomer(null);
            setCustomerSearch('');
            setIsNewCustomer(false);
            setFormData({
                customerName: '',
                customerPhone: '',
                professionalId: '',
                serviceId: '',
                date: new Date().toISOString().split('T')[0],
                time: '09:00',
                notes: ''
            });
        }, 300);
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.phone.includes(customerSearch)
    ).slice(0, 5); // Limit results

    const handleCustomerSelect = (customer) => {
        setSelectedCustomer(customer);
        setIsNewCustomer(false);
        setCustomerSearch(''); // Clear search to look cleaner
    };

    const handleStartNewCustomer = () => {
        setSelectedCustomer(null);
        setIsNewCustomer(true);
    };

    const handleNextStep = () => {
        if (step === 1) {
            if (isNewCustomer) {
                if (!formData.customerName || !formData.customerPhone) {
                    toast.error('Lütfen müşteri adı ve telefon numarasını giriniz.');
                    return;
                }
            } else if (!selectedCustomer) {
                toast.error('Lütfen bir müşteri seçiniz.');
                return;
            }
            setStep(2);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                professionalId: parseInt(formData.professionalId),
                serviceId: parseInt(formData.serviceId),
                date: formData.date,
                time: formData.time,
                notes: formData.notes,
                status: 'scheduled'
            };

            // Attach customer info
            if (isNewCustomer) {
                payload.customerName = formData.customerName;
                payload.customerPhone = formData.customerPhone;
            } else {
                payload.customerId = selectedCustomer.id;
            }

            const result = await createAppointment.mutateAsync(payload);

            if (result && result.id) {
                setCurrentAppointmentId(result.id);
                setSelectedView('appointments');
                toast.success('Randevu başarıyla oluşturuldu');
                handleClose();
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
                        className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]"
                    >
                        {/* Header Content */}
                        <div className="relative z-10 px-8 pt-8 pb-6 flex items-start justify-between border-b border-slate-100 flex-shrink-0">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-purple-50 rounded-2xl">
                                        <Sparkles className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= 1 ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-400'}`}>1</span>
                                        <div className="w-8 h-1 bg-slate-100 rounded-full overflow-hidden">
                                            <div className={`h-full bg-purple-600 transition-all duration-300 ${step === 2 ? 'w-full' : 'w-0'}`} />
                                        </div>
                                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step === 2 ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-400'}`}>2</span>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900">
                                    {step === 1 ? 'Müşteri Seçimi' : 'Randevu Detayları'}
                                </h3>
                                <p className="text-slate-500 text-sm mt-1">
                                    {step === 1 ? 'İşlem yapılacak müşteriyi belirleyin' : 'Hizmet ve zaman bilgilerini girin'}
                                </p>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto custom-scrollbar flex-grow">
                            <form onSubmit={handleSubmit} className="space-y-6">

                                {step === 1 && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="space-y-6"
                                    >
                                        {/* Create New Toggle */}
                                        <div className="flex p-1 bg-slate-100 rounded-xl">
                                            <button
                                                type="button"
                                                onClick={() => setIsNewCustomer(false)}
                                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isNewCustomer ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                                            >
                                                Kayıtlı Müşteri
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleStartNewCustomer}
                                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${isNewCustomer ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                                            >
                                                Yeni Müşteri
                                            </button>
                                        </div>

                                        {!isNewCustomer ? (
                                            <div className="space-y-4">
                                                <div className="relative">
                                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="İsim veya telefon ile ara..."
                                                        value={customerSearch}
                                                        onChange={(e) => setCustomerSearch(e.target.value)}
                                                        className="input-premium pl-12"
                                                        autoFocus
                                                    />
                                                </div>

                                                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                                                    {filteredCustomers.map(customer => (
                                                        <div
                                                            key={customer.id}
                                                            onClick={() => handleCustomerSelect(customer)}
                                                            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${selectedCustomer?.id === customer.id
                                                                ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500'
                                                                : 'border-slate-100 hover:border-purple-200 hover:bg-slate-50'
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                                                                    {customer.name.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-slate-900">{customer.name}</p>
                                                                    <p className="text-sm text-slate-500">{customer.phone}</p>
                                                                </div>
                                                            </div>
                                                            {selectedCustomer?.id === customer.id && (
                                                                <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white">
                                                                    <Check className="w-4 h-4" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {filteredCustomers.length === 0 && customerSearch && (
                                                        <div className="text-center py-8 text-slate-500">
                                                            Müşteri bulunamadı.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-semibold text-slate-700">Müşteri Adı</label>
                                                    <input
                                                        type="text"
                                                        value={formData.customerName}
                                                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                                        className="input-premium"
                                                        placeholder="Örn: Ayşe Yılmaz"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-semibold text-slate-700">Telefon Numarası</label>
                                                    <input
                                                        type="tel"
                                                        value={formData.customerPhone}
                                                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                                        className="input-premium"
                                                        placeholder="Örn: 555 123 45 67"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-5"
                                    >
                                        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100 text-sm text-purple-900 mb-2">
                                            <User className="w-4 h-4" />
                                            <span className="font-semibold">Seçilen Müşteri:</span>
                                            <span>
                                                {isNewCustomer ? `${formData.customerName} (${formData.customerPhone})` : selectedCustomer?.name}
                                            </span>
                                        </div>

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
                                                rows="2"
                                                className="input-premium resize-none"
                                                placeholder="Varsa ek notlar..."
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                {/* Footer Actions */}
                                <div className="pt-4 flex gap-4 border-t border-slate-100 mt-auto">
                                    {step === 1 ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={handleClose}
                                                className="flex-1 btn-ghost-premium"
                                            >
                                                İptal
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleNextStep}
                                                className="flex-1 btn-premium"
                                            >
                                                <span className="mr-2">Devam Et</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => setStep(1)}
                                                className="flex-1 btn-ghost-premium flex justify-center items-center gap-2"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                                <span>Geri</span>
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={createAppointment.isPending}
                                                className="flex-1 btn-premium shadow-purple-500/25"
                                            >
                                                {createAppointment.isPending ? 'Oluşturuluyor...' : 'Randevu Oluştur'}
                                            </button>
                                        </>
                                    )}
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
