import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UserCircle,
    FileText,
    User,
    Calendar,
    Clock,
    ArrowRight,
    ArrowLeft,
    Check,
    Package
} from 'lucide-react';
import { useCustomers, useProfessionals, useServices, useCreateAppointment } from '../hooks/useData';
import useStore from '../store';

const CreateAppointment = () => {
    const { data: customers = [] } = useCustomers();
    const { data: professionals = [] } = useProfessionals();
    const { data: services = [] } = useServices();
    const createAppointment = useCreateAppointment();
    const { setSelectedView, setCurrentAppointmentId } = useStore();

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        customerId: '',
        customerName: '',
        customerPhone: '',
        professionalId: '',
        serviceId: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        notes: ''
    });

    const [isManualCustomer, setIsManualCustomer] = useState(false);

    const steps = [
        { id: 1, title: 'Müşteri Seçimi', icon: UserCircle },
        { id: 2, title: 'Hizmet Paketi', icon: Package },
        { id: 3, title: 'Personel Seçimi', icon: User },
        { id: 4, title: 'Tarih & Saat', icon: Calendar },
    ];

    const handleNext = () => {
        if (currentStep < 4) setCurrentStep(currentStep + 1);
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async () => {
        try {
            const result = await createAppointment.mutateAsync({
                ...formData,
                customerId: formData.customerId ? parseInt(formData.customerId) : null,
                professionalId: parseInt(formData.professionalId),
                serviceId: parseInt(formData.serviceId),
                status: 'scheduled'
            });

            if (result && result.id) {
                setCurrentAppointmentId(result.id);
                setSelectedView('appointments');
            }
        } catch (error) {
            console.error('Randevu oluştururken hata:', error);
            alert('Randevu oluşturulurken hata oluştu.');
        }
    };

    const canProceed = () => {
        switch (currentStep) {
            case 1:
                if (isManualCustomer) return formData.customerName !== '' && formData.customerPhone !== '';
                return formData.customerId !== '';
            case 2: return formData.serviceId !== '';
            case 3: return formData.professionalId !== '';
            case 4: return formData.date !== '' && formData.time !== '';
            default: return false;
        }
    };

    const selectedCustomer = customers.find(c => c.id === parseInt(formData.customerId));
    const selectedService = services.find(s => s.id === parseInt(formData.serviceId));
    const selectedProfessional = professionals.find(p => p.id === parseInt(formData.professionalId));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-6"
        >
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Yeni Randevu Oluştur</h2>
                <p className="text-slate-500">Adım adım randevu oluşturma sihirbazı</p>
            </div>

            {/* Progress Steps */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = currentStep === step.id;
                        const isCompleted = currentStep > step.id;

                        return (
                            <React.Fragment key={step.id}>
                                <div className="flex flex-col items-center gap-2">
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isActive
                                            ? 'bg-gradient-to-r from-indigo-600 to-indigo-800 text-white shadow-glow'
                                            : isCompleted
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-slate-100 text-slate-400'
                                            }`}
                                    >
                                        {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                                    </div>
                                    <span className={`text-sm font-medium ${isActive ? 'text-indigo-900' : 'text-slate-400'}`}>
                                        {step.title}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`flex-1 h-1 mx-4 rounded ${isCompleted ? 'bg-emerald-500' : 'bg-slate-100'}`} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            {/* Step Content */}
            <div className="glass-card p-8 min-h-[400px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Step 1: Customer Selection */}
                        {currentStep === 1 && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-bold text-slate-800">Müşteri Seçin</h3>
                                    <button
                                        onClick={() => {
                                            setIsManualCustomer(!isManualCustomer);
                                            setFormData({ ...formData, customerId: '', customerName: '', customerPhone: '' });
                                        }}
                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-800 underline"
                                    >
                                        {isManualCustomer ? 'Listeden Seç' : '+ Manuel Giriş / Yeni Müşteri'}
                                    </button>
                                </div>

                                {isManualCustomer ? (
                                    <div className="bg-white p-6 rounded-xl border-2 border-slate-100 space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Müşteri Adı Soyadı</label>
                                            <input
                                                type="text"
                                                className="input-premium w-full"
                                                placeholder="Örn: Ahmet Yılmaz"
                                                value={formData.customerName}
                                                onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Telefon Numarası</label>
                                            <input
                                                type="text"
                                                className="input-premium w-full"
                                                placeholder="05..."
                                                value={formData.customerPhone}
                                                onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
                                        {customers.map((customer) => (
                                            <div
                                                key={customer.id}
                                                onClick={() => setFormData({ ...formData, customerId: customer.id })}
                                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.customerId === customer.id
                                                    ? 'border-indigo-600 bg-indigo-50'
                                                    : 'border-slate-100 hover:border-indigo-200 bg-white'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="p-3 bg-indigo-100 rounded-lg">
                                                        <UserCircle className="w-6 h-6 text-indigo-900" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-bold text-slate-800">{customer.name}</h4>
                                                        <p className="text-sm text-slate-500">
                                                            {customer.phone}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {customers.length === 0 && (
                                            <p className="col-span-2 text-center text-gray-400 py-8">
                                                Kayıtlı müşteri yok. Manuel giriş yapabilirsiniz.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 2: Package Selection */}
                        {currentStep === 2 && (
                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold text-slate-800 mb-6">Hizmet Paketi Seçin</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {services.map((service) => (
                                        <div
                                            key={service.id}
                                            onClick={() => setFormData({ ...formData, serviceId: service.id })}
                                            className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${formData.serviceId === service.id
                                                ? 'border-indigo-600 bg-indigo-50'
                                                : 'border-slate-100 hover:border-indigo-200 bg-white'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-slate-50"
                                                    >
                                                        {/* Icon handling if available, else generic */}
                                                        <Package className="w-6 h-6 text-slate-400" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-bold text-slate-800">{service.name}</h4>
                                                        <p className="text-sm text-slate-500">{service.category}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-500 mb-3">{service.description}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-slate-500">{service.duration} dakika</span>
                                                <span className="text-xl font-bold text-indigo-900">₺{service.price}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Professional Selection */}
                        {currentStep === 3 && (
                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold text-slate-800 mb-6">Personel Seçin</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {professionals.map((professional) => (
                                        <div
                                            key={professional.id}
                                            onClick={() => setFormData({ ...formData, professionalId: professional.id })}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.professionalId === professional.id
                                                ? 'border-indigo-600 bg-indigo-50'
                                                : 'border-slate-100 hover:border-indigo-200 bg-white'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-900 flex items-center justify-center text-white font-bold text-lg">
                                                    {professional.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-bold text-slate-800">{professional.name}</h4>
                                                    <p className="text-sm text-slate-500">{professional.title}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 4: Date & Time */}
                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold text-slate-800 mb-6">Tarih ve Saat Seçin</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-2">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-brand-primary" />
                                                Tarih
                                            </div>
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="input-field"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-2">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-brand-dark" />
                                                Saat
                                            </div>
                                        </label>
                                        <input
                                            type="time"
                                            value={formData.time}
                                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                            className="input-field"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-2">Notlar (Opsiyonel)</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        rows="4"
                                        className="input-field"
                                        placeholder="Varsa ek notlar..."
                                    />
                                </div>

                                {/* Summary */}
                                <div className="bg-slate-50 rounded-xl p-6 space-y-3 border border-slate-100">
                                    <h4 className="text-lg font-bold text-slate-800 mb-4">Randevu Özeti</h4>
                                    {selectedCustomer && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <UserCircle className="w-4 h-4 text-indigo-600" />
                                            <span className="text-slate-600">{selectedCustomer.name}</span>
                                        </div>
                                    )}
                                    {selectedService && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <FileText className="w-4 h-4 text-indigo-800" />
                                            <span className="text-slate-600">{selectedService.name}</span>
                                            <span className="ml-auto text-indigo-900 font-semibold">₺{selectedService.price}</span>
                                        </div>
                                    )}
                                    {selectedProfessional && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <User className="w-4 h-4 text-slate-500" />
                                            <span className="text-slate-600">{selectedProfessional.name}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
                <button
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Geri
                </button>

                {currentStep < 4 ? (
                    <button
                        onClick={handleNext}
                        disabled={!canProceed()}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-700 text-white rounded-xl hover:bg-indigo-800 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        İleri
                        <ArrowRight className="w-5 h-5" />
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={!canProceed() || createAppointment.isPending}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-700 text-white rounded-xl hover:bg-indigo-800 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Check className="w-5 h-5" />
                        {createAppointment.isPending ? 'Oluşturuluyor...' : 'Randevu Oluştur'}
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default CreateAppointment;
