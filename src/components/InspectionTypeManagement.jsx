import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Edit, Trash2 } from 'lucide-react';
import { useInspectionTypes, useCreateInspectionType, useUpdateInspectionType, useDeleteInspectionType } from '../hooks/useData';

const InspectionTypeManagement = () => {
    const { data: inspectionTypes = [], isLoading } = useInspectionTypes();
    const createTypeMutation = useCreateInspectionType();
    const updateTypeMutation = useUpdateInspectionType();
    const deleteTypeMutation = useDeleteInspectionType();

    const [showModal, setShowModal] = useState(false);
    const [editingType, setEditingType] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        duration: 30,
        price: 0,
        description: '',
        color: '#81ddff',
        icon: '💼',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingType) {
            updateTypeMutation.mutate({ id: editingType.id, data: formData }, {
                onSuccess: () => resetForm()
            });
        } else {
            createTypeMutation.mutate(formData, {
                onSuccess: () => resetForm()
            });
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            category: '',
            duration: 30,
            price: 0,
            description: '',
            color: '#81ddff',
            icon: '💼',
        });
        setEditingType(null);
        setShowModal(false);
    };

    const handleEdit = (type) => {
        setEditingType(type);
        setFormData({
            name: type.name,
            category: type.category,
            duration: type.duration,
            price: type.price,
            description: type.description,
            color: type.color || '#81ddff',
            icon: type.icon || '💼',
        });
        setShowModal(true);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Hizmet Paketleri</h2>
                    <p className="text-slate-500">Hizmet paketlerini ve fiyatlarını yönetin</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary flex items-center gap-2 px-6 py-3"
                >
                    <Plus className="w-5 h-5" />
                    Yeni Paket
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inspectionTypes.map((type) => (
                    <motion.div
                        key={type.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card p-6 hover:shadow-glow transition-all duration-300"
                        style={{ borderTop: `4px solid ${type.color}` }}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm"
                                    style={{ backgroundColor: `${type.color}20` }}
                                >
                                    {type.icon}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">{type.name}</h3>
                                    <p className="text-sm text-slate-500">{type.category}</p>
                                </div>
                            </div>
                        </div>

                        <p className="text-sm text-slate-500 mb-4 line-clamp-2">{type.description}</p>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-slate-50 rounded-lg p-3">
                                <p className="text-xs text-slate-400 mb-1">Süre</p>
                                <p className="text-lg font-bold text-slate-700">{type.duration} dk</p>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-3">
                                <p className="text-xs text-slate-400 mb-1">Fiyat</p>
                                <p className="text-lg font-bold text-slate-700">₺{type.price}</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEdit(type)}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-500 border border-blue-100 rounded-lg hover:bg-blue-100 transition-all duration-300"
                            >
                                <Edit className="w-4 h-4" />
                                Düzenle
                            </button>
                            <button
                                onClick={() => {
                                    if (confirm(`${type.name} silinecek. Emin misiniz?`)) {
                                        deleteTypeMutation.mutate(type.id);
                                    }
                                }}
                                className="flex items-center justify-center px-4 py-2 bg-red-50 text-red-500 border border-red-100 rounded-lg hover:bg-red-100 transition-all duration-300"
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
                            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-slate-800">
                                    {editingType ? 'Paket Düzenle' : 'Yeni Paket'}
                                </h3>
                                <button onClick={resetForm} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-2">Paket Adı</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="input-field"
                                        placeholder="Genel Muayene"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-2">Kategori</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="input-field"
                                        placeholder="Standart"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-2">Süre (dk)</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.duration}
                                            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                            className="input-field"
                                            placeholder="45"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-2">Fiyat (₺)</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                                            className="input-field"
                                            placeholder="1500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-2">Açıklama</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="input-field"
                                        placeholder="Paket içeriği..."
                                        rows="3"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-2">Renk</label>
                                        <input
                                            type="color"
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            className="w-full h-12 rounded-xl cursor-pointer border border-slate-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-2">İkon</label>
                                        <input
                                            type="text"
                                            value={formData.icon}
                                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                            className="input-field"
                                            placeholder="🔍"
                                        />
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
                                        disabled={createTypeMutation.isPending || updateTypeMutation.isPending}
                                        className="flex-1 btn-primary disabled:opacity-50"
                                    >
                                        {createTypeMutation.isPending || updateTypeMutation.isPending ? 'Kaydediliyor...' : (editingType ? 'Güncelle' : 'Ekle')}
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

export default InspectionTypeManagement;
