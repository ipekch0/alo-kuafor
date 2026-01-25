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
import { useEmployees, useCreateEmployee, useUpdateEmployee, useDeleteEmployee } from '../hooks/useData';

const EmployeeManagement = () => {
    const { data: employees = [], isLoading } = useEmployees();
    const createEmployeeMutation = useCreateEmployee();
    const updateEmployeeMutation = useUpdateEmployee();
    const deleteEmployeeMutation = useDeleteEmployee();

    const [showModal, setShowModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        email: '',
        phone: '',
        photo: '',
        specialties: [],
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingEmployee) {
            updateEmployeeMutation.mutate({ id: editingEmployee.id, data: formData }, {
                onSuccess: () => resetForm()
            });
        } else {
            createEmployeeMutation.mutate({
                ...formData,
                specialties: formData.specialties.length > 0 ? formData.specialties : ['Genel'],
            }, {
                onSuccess: () => resetForm()
            });
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            role: '',
            email: '',
            phone: '',
            photo: '',
            specialties: [],
        });
        setEditingEmployee(null);
        setShowModal(false);
    };

    const handleEdit = (employee) => {
        setEditingEmployee(employee);
        setFormData({
            name: employee.name,
            role: employee.role,
            email: employee.email,
            phone: employee.phone,
            photo: employee.photo || '',
            specialties: employee.specialties || [],
        });
        setShowModal(true);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Yükleniyor...</p>
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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Çalışan Yönetimi</h2>
                    <p className="text-gray-400">Ekibinizi yönetin ve performansı takip edin</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
                >
                    <Plus className="w-5 h-5" />
                    Yeni Çalışan
                </button>
            </div>

            {/* Employee Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {employees.map((employee) => (
                    <motion.div
                        key={employee.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300"
                    >
                        <div className="flex items-start gap-4 mb-4">
                            <img
                                src={employee.photo || 'https://i.pravatar.cc/150?img=1'}
                                alt={employee.name}
                                className="w-16 h-16 rounded-full border-2 border-purple-500/30"
                            />
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-white">{employee.name}</h3>
                                <p className="text-sm text-gray-400">{employee.role}</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                    <span className="text-sm text-gray-300">{employee.stats?.rating || 0}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Mail className="w-4 h-4" />
                                <span className="truncate">{employee.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Phone className="w-4 h-4" />
                                <span>{employee.phone}</span>
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="text-xs text-gray-400 mb-2">Uzmanlıklar:</p>
                            <div className="flex flex-wrap gap-2">
                                {employee.specialties?.slice(0, 3).map((specialty, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-xs text-purple-400"
                                    >
                                        {specialty}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-slate-700/30 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <Calendar className="w-4 h-4 text-blue-400" />
                                    <p className="text-xs text-gray-400">Randevular</p>
                                </div>
                                <p className="text-lg font-bold text-white">{employee.stats?.totalAppointments || 0}</p>
                            </div>
                            <div className="bg-slate-700/30 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <Clock className="w-4 h-4 text-emerald-400" />
                                    <p className="text-xs text-gray-400">Tamamlama</p>
                                </div>
                                <p className="text-lg font-bold text-white">{employee.stats?.completionRate || 0}%</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEdit(employee)}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-all duration-300"
                            >
                                <Edit className="w-4 h-4" />
                                Düzenle
                            </button>
                            <button
                                onClick={() => {
                                    if (confirm(`${employee.name} silinecek. Emin misiniz?`)) {
                                        deleteEmployeeMutation.mutate(employee.id);
                                    }
                                }}
                                className="flex items-center justify-center px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all duration-300"
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
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                        onClick={() => resetForm()}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-white">
                                    {editingEmployee ? 'Çalışan Düzenle' : 'Yeni Çalışan'}
                                </h3>
                                <button
                                    onClick={resetForm}
                                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Ad Soyad</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                                        placeholder="Dr. Ahmet Yılmaz"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Pozisyon</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                                        placeholder="Uzman Doktor"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">E-posta</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                                        placeholder="ahmet@klinik.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Telefon</label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                                        placeholder="+90 555 123 4567"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Fotoğraf URL</label>
                                    <input
                                        type="url"
                                        value={formData.photo}
                                        onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                                        placeholder="https://i.pravatar.cc/150"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-xl font-semibold hover:bg-slate-600 transition-all"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createEmployeeMutation.isPending || updateEmployeeMutation.isPending}
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50"
                                    >
                                        {createEmployeeMutation.isPending || updateEmployeeMutation.isPending ? 'Kaydediliyor...' : (editingEmployee ? 'Güncelle' : 'Ekle')}
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

export default EmployeeManagement;
