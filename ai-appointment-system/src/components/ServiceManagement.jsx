import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Edit, Trash2, ArrowRight } from 'lucide-react';
import { useServices, useCreateService, useUpdateService, useDeleteService } from '../hooks/useData';
import toast from 'react-hot-toast';

const ServiceManagement = () => {
    const { data: services = [], isLoading } = useServices();
    const createServiceMutation = useCreateService();
    const updateServiceMutation = useUpdateService();
    const deleteServiceMutation = useDeleteService();

    const [showModal, setShowModal] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        duration: 30,
        price: 0,
        maxPrice: '',
        description: '',
        color: '#8B5CF6',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation for price range
        if (formData.maxPrice && parseFloat(formData.maxPrice) < parseFloat(formData.price)) {
            toast.error('Maksimum fiyat, başlangıç fiyatından düşük olamaz!');
            return;
        }

        if (editingService) {
            updateServiceMutation.mutate({ id: editingService.id, data: formData }, {
                onSuccess: () => {
                    toast.success('Hizmet başarıyla güncellendi');
                    resetForm();
                },
                onError: () => toast.error('Güncelleme başarısız')
            });
        } else {
            createServiceMutation.mutate(formData, {
                onSuccess: () => {
                    toast.success('Hizmet başarıyla eklendi');
                    resetForm();
                },
                onError: () => toast.error('Ekleme başarısız')
            });
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            category: '',
            duration: 30,
            price: 0,
            maxPrice: '',
            description: '',
            color: '#8B5CF6',
        });
        setEditingService(null);
        setShowModal(false);
    };

    const handleEdit = (service) => {
        setEditingService(service);
        setFormData({
            name: service.name,
            category: service.category,
            duration: service.duration,
            price: service.price,
            maxPrice: service.maxPrice || '',
            description: service.description,
            color: service.color || '#8B5CF6',
        });
        setShowModal(true);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Hizmet Yönetimi</h2>
                    <p className="text-slate-500">Hizmetlerinizi yönetin ve fiyatlandırın</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-700 text-white rounded-xl font-semibold hover:bg-indigo-800 transition-all duration-300 shadow-lg shadow-indigo-200"
                >
                    <Plus className="w-5 h-5" />
                    Yeni Hizmet
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                    <motion.div
                        key={service.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card p-6 hover:shadow-glow transition-all duration-300 border-t-4"
                        style={{ borderTopColor: service.color || '#8B5CF6' }}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">{service.name}</h3>
                                <p className="text-sm text-slate-500">{service.category}</p>
                            </div>
                            <div className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
                                {service.duration} dk
                            </div>
                        </div>

                        <p className="text-sm text-slate-600 mb-4 line-clamp-2 min-h-[40px]">{service.description || 'Açıklama yok'}</p>

                        <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                            <span className="text-sm text-slate-500">Fiyat</span>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">₺{service.price}</span>
                                {service.maxPrice && service.maxPrice > service.price && (
                                    <>
                                        <ArrowRight className="w-3 h-3 text-slate-400" />
                                        <span className="font-bold text-slate-900">₺{service.maxPrice}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEdit(service)}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-100 transition-all duration-300"
                            >
                                <Edit className="w-4 h-4" />
                                Düzenle
                            </button>
                            <button
                                onClick={() => {
                                    if (confirm(`${service.name} silinecek. Emin misiniz?`)) {
                                        deleteServiceMutation.mutate(service.id, {
                                            onSuccess: () => toast.success('Hizmet silindi'),
                                            onError: () => toast.error('Silme işlemi başarısız')
                                        });
                                    }
                                }}
                                className="flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition-all duration-300"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                        onClick={() => resetForm()}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-slate-800">
                                    {editingService ? 'Hizmet Düzenle' : 'Yeni Hizmet'}
                                </h3>
                                <button onClick={resetForm} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-2">Hizmet Adı</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="input-field"
                                        placeholder="Konsültasyon"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-2">Kategori</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="input-field"
                                            placeholder="Danışmanlık"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-2">Süre (dk)</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.duration}
                                            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                            className="input-field"
                                            placeholder="30"
                                        />
                                    </div>
                                </div>

                                {/* Price Range Section */}
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                                    <label className="block text-sm font-medium text-slate-700">Fiyatlandırma (₺)</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-slate-500 mb-1 block">Başlangıç Fiyatı</label>
                                            <input
                                                type="number"
                                                required
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                                                className="input-field"
                                                placeholder="Min"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 mb-1 block">Maksimum (Opsiyonel)</label>
                                            <input
                                                type="number"
                                                value={formData.maxPrice}
                                                onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })}
                                                className="input-field"
                                                placeholder="Max"
                                            />
                                        </div>
                                    </div>
                                    {/* Slider Placeholder - Use Range Input for simple slider effect */}
                                    {formData.maxPrice && (
                                        <div className="pt-2">
                                            <div className="h-1 bg-gradient-to-r from-indigo-500 to-indigo-300 rounded-full w-full opacity-50"></div>
                                            <div className="flex justify-between text-xs text-slate-400 mt-1">
                                                <span>Min: {formData.price}₺</span>
                                                <span>Max: {formData.maxPrice}₺</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-2">Açıklama</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="input-field"
                                        placeholder="Hizmet açıklaması..."
                                        rows="3"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-2">Kart Rengi</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="color"
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            className="w-16 h-10 rounded-lg cursor-pointer border border-slate-200 p-1 bg-white"
                                        />
                                        <span className="text-sm text-slate-500 font-mono">{formData.color}</span>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition-all"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createServiceMutation.isPending || updateServiceMutation.isPending}
                                        className="flex-1 px-4 py-3 bg-indigo-700 text-white rounded-xl font-semibold hover:bg-indigo-800 transition-all duration-300 disabled:opacity-50"
                                    >
                                        {createServiceMutation.isPending || updateServiceMutation.isPending ? 'Kaydediliyor...' : (editingService ? 'Güncelle' : 'Ekle')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ServiceManagement;
