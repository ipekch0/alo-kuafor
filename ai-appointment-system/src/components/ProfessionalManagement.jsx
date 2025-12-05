import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    X,
    Mail,
    Phone,
    Star,
    Clock,
    Calendar,
    Edit,
    Trash2,
} from 'lucide-react';
import { useProfessionals, useCreateProfessional, useUpdateProfessional, useDeleteProfessional } from '../hooks/useData';
import toast from 'react-hot-toast';

const ProfessionalManagement = () => {
    const { data: professionals = [], isLoading } = useProfessionals();
    const createProfessionalMutation = useCreateProfessional();
    const updateProfessionalMutation = useUpdateProfessional();
    const deleteProfessionalMutation = useDeleteProfessional();

    const [showModal, setShowModal] = useState(false);
    const [editingProfessional, setEditingProfessional] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        title: '',
        email: '', // Not in schema but useful for UI, might need to be removed if not in DB
        phone: '', // Not in schema but useful
        photo: '',
        specialties: [],
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingProfessional) {
            updateProfessionalMutation.mutate({ id: editingProfessional.id, data: formData }, {
                onSuccess: () => {
                    toast.success('Personel başarıyla güncellendi');
                    resetForm();
                },
                onError: () => toast.error('Güncelleme başarısız')
            });
        } else {
            createProfessionalMutation.mutate({
                ...formData,
                specialties: formData.specialties.length > 0 ? formData.specialties : ['Genel'],
            }, {
                onSuccess: () => {
                    toast.success('Personel başarıyla eklendi');
                    resetForm();
                },
                onError: () => toast.error('Ekleme başarısız')
            });
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            title: '',
            email: '',
            phone: '',
            photo: '',
            specialties: [],
        });
        setEditingProfessional(null);
        setShowModal(false);
    };

    const handleEdit = (professional) => {
        setEditingProfessional(professional);
        setFormData({
            name: professional.name,
            title: professional.title,
            email: professional.email || '',
            phone: professional.phone || '',
            photo: professional.photo || '',
            specialties: professional.specialties || [],
        });
        setShowModal(true);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Personel Yönetimi</h2>
                    <p className="text-slate-500">Salon ekibini yönetin ve performanslarını takip edin</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-700 text-white rounded-xl hover:bg-indigo-800 transition-colors shadow-lg shadow-indigo-200"
                >
                    <Plus className="w-5 h-5" />
                    Yeni Personel
                </button>
            </div>

            {/* Professional Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {professionals.map((professional) => (
                    <motion.div
                        key={professional.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card p-6 hover:shadow-glow transition-all duration-300"
                    >
                        <div className="flex items-start gap-4 mb-4">
                            <img
                                src={professional.photo || 'https://i.pravatar.cc/150?img=1'}
                                alt={professional.name}
                                className="w-16 h-16 rounded-full border-2 border-indigo-600"
                            />
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-800">{professional.name}</h3>
                                <p className="text-sm text-slate-500">{professional.title}</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                    <span className="text-sm text-slate-600">{professional.rating || 0}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="text-xs text-slate-400 mb-2">Uzmanlıklar:</p>
                            <div className="flex flex-wrap gap-2">
                                {professional.specialties?.slice(0, 3).map((specialty, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2 py-1 bg-indigo-50 border border-indigo-100 rounded text-xs text-indigo-700"
                                    >
                                        {specialty}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-slate-50 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <Calendar className="w-4 h-4 text-indigo-600" />
                                    <p className="text-xs text-slate-400">Randevular</p>
                                </div>
                                <p className="text-lg font-bold text-slate-700">{professional._count?.appointments || 0}</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEdit(professional)}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-500 border border-blue-100 rounded-lg hover:bg-blue-100 transition-all duration-300"
                            >
                                <Edit className="w-4 h-4" />
                                Düzenle
                            </button>
                            <button
                                onClick={() => {
                                    if (confirm(`${professional.name} silinecek. Emin misiniz?`)) {
                                        deleteProfessionalMutation.mutate(professional.id, {
                                            onSuccess: () => toast.success('Personel silindi'),
                                            onError: () => toast.error('Silme işlemi başarısız')
                                        });
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

            {/* Modal */}
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
                                    {editingProfessional ? 'Personel Düzenle' : 'Yeni Personel'}
                                </h3>
                                <button
                                    onClick={resetForm}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-2">Ad Soyad</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="input-field"
                                        placeholder="Ahmet Yılmaz"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-2">Unvan</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="input-field"
                                        placeholder="Kıdemli Kuaför"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-2">Fotoğraf URL</label>
                                    <input
                                        type="url"
                                        value={formData.photo}
                                        onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                                        className="input-field"
                                        placeholder="https://i.pravatar.cc/150"
                                    />
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
                                        disabled={createProfessionalMutation.isPending || updateProfessionalMutation.isPending}
                                        className="flex-1 px-4 py-3 bg-indigo-700 text-white rounded-xl font-semibold hover:bg-indigo-800 transition-all disabled:opacity-50"
                                    >
                                        {createProfessionalMutation.isPending || updateProfessionalMutation.isPending ? 'Kaydediliyor...' : (editingProfessional ? 'Güncelle' : 'Ekle')}
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

export default ProfessionalManagement;
