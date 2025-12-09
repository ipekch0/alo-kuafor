import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, MapPin, Building, UserPlus, Edit } from 'lucide-react';
import { useCreateCustomer, useUpdateCustomer, useCustomer } from '../hooks/useData';
import useStore from '../store';
import toast from 'react-hot-toast';

const CustomerCreateModal = () => {
    const { modals, closeModal, isEditMode, currentCustomerId } = useStore();
    const isOpen = modals.customerCreate;

    const createCustomer = useCreateCustomer();
    const updateCustomer = useUpdateCustomer();
    const { data: customerData } = useCustomer(currentCustomerId);

    const initialFormState = {
        name: '',
        email: '',
        phone: '',
        idNumber: '',
        address: '',
        city: ''
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && customerData) {
                setFormData({
                    name: customerData.name || '',
                    email: customerData.email || '',
                    phone: customerData.phone || '',
                    idNumber: customerData.idNumber || '',
                    address: customerData.address || '',
                    city: customerData.city || ''
                });
            } else if (!isEditMode) {
                setFormData(initialFormState);
            }
        }
    }, [isOpen, isEditMode, customerData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                await updateCustomer.mutateAsync({ id: currentCustomerId, data: formData });
                toast.success('Müşteri başarıyla güncellendi');
            } else {
                await createCustomer.mutateAsync(formData);
                toast.success('Yeni müşteri başarıyla oluşturuldu');
            }
            closeModal('customerCreate');
            setFormData(initialFormState);
        } catch (error) {
            console.error('Error saving customer:', error);
            toast.error('İşlem sırasında bir hata oluştu');
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
                        className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative"
                    >
                        {/* Header Content */}
                        <div className="relative z-10 px-8 pt-8 pb-6 flex items-start justify-between border-b border-slate-100">
                            <div>
                                <div className={`p-3 rounded-2xl inline-block mb-4 ${isEditMode ? 'bg-orange-50' : 'bg-purple-50'}`}>
                                    {isEditMode ? (
                                        <Edit className={`w-8 h-8 ${isEditMode ? 'text-orange-600' : 'text-purple-600'}`} />
                                    ) : (
                                        <UserPlus className="w-8 h-8 text-purple-600" />
                                    )}
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900">
                                    {isEditMode ? 'Müşteri Düzenle' : 'Yeni Müşteri'}
                                </h3>
                                <p className="text-slate-500 text-sm mt-1">
                                    {isEditMode ? 'Müşteri bilgilerini güncelleyin' : 'Sisteme yeni bir müşteri kaydedin'}
                                </p>
                            </div>
                            <button
                                onClick={() => closeModal('customerCreate')}
                                className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Name */}
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                            <User className="w-4 h-4 text-purple-500" />
                                            Ad Soyad *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="input-premium"
                                            placeholder="Ahmet Yılmaz"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-pink-500" />
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="input-premium"
                                            placeholder="ahmet@email.com"
                                        />
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-orange-500" />
                                            Telefon *
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            minLength="10"
                                            pattern=".{10,11}"
                                            title="En az 10 haneli telefon numarası giriniz"
                                            value={formData.phone}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                if (val.length <= 11) {
                                                    setFormData({ ...formData, phone: val });
                                                }
                                            }}
                                            className="input-premium"
                                            placeholder="05551234567"
                                        />
                                        <p className="text-xs text-slate-400">Sadece rakam (Max: 11 hane)</p>
                                    </div>

                                    {/* ID Number */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                            <Building className="w-4 h-4 text-slate-500" />
                                            TC Kimlik No
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.idNumber}
                                            onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                                            maxLength="11"
                                            className="input-premium"
                                            placeholder="12345678901"
                                        />
                                    </div>

                                    {/* City */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-red-500" />
                                            Şehir
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            className="input-premium"
                                            placeholder="İstanbul"
                                        />
                                    </div>

                                    {/* Address */}
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-slate-500" />
                                            Adres
                                        </label>
                                        <textarea
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            rows="2"
                                            className="input-premium resize-none"
                                            placeholder="Tam adres..."
                                        />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="pt-4 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => closeModal('customerCreate')}
                                        className="flex-1 btn-ghost-premium"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createCustomer.isPending || updateCustomer.isPending}
                                        className={`flex-1 btn-premium ${isEditMode ? 'shadow-orange-500/25' : 'shadow-purple-500/25'}`}
                                    >
                                        {createCustomer.isPending || updateCustomer.isPending
                                            ? 'Kaydediliyor...'
                                            : (isEditMode ? 'Güncelle' : 'Kaydet')}
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

export default CustomerCreateModal;
