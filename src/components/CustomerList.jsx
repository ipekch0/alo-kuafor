import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Edit2, Trash2, UserCircle, Phone, Mail } from 'lucide-react';
import useStore from '../store';
import { useCustomers, useDeleteCustomer } from '../hooks/useData';
import toast from 'react-hot-toast';

const CustomerList = () => {
    const { data: customers = [], isLoading } = useCustomers();
    const deleteCustomer = useDeleteCustomer();
    const { openModal } = useStore();

    const [searchTerm, setSearchTerm] = useState('');

    const handleDelete = async (id) => {
        if (window.confirm('Bu müşteriyi silmek istediğinize emin misiniz?')) {
            try {
                await deleteCustomer.mutateAsync(id);
                toast.success('Müşteri başarıyla silindi');
            } catch (error) {
                console.error('Error deleting customer:', error);
                toast.error('Silme işlemi başarısız');
            }
        }
    };

    const filteredCustomers = customers.filter(customer =>
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm)
    );

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
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Müşteriler</h2>
                    <p className="text-slate-500 mt-1">{customers.length} kayıt bulundu</p>
                </div>
                <button
                    onClick={() => {
                        useStore.getState().setEditMode(false);
                        useStore.getState().setCurrentCustomerId(null);
                        openModal('customerCreate');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-700 text-white rounded-lg hover:bg-indigo-800 transition-colors shadow-sm hover:shadow-md"
                >
                    <Plus className="w-5 h-5" />
                    Yeni Müşteri
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Ad, email veya telefon ile ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-12"
                />
            </div>

            <div className="glass-card overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50">
                        <tr className="text-left text-slate-500 text-sm">
                            <th className="p-4">Ad Soyad</th>
                            <th className="p-4">İletişim</th>
                            <th className="p-4">Şehir</th>
                            <th className="p-4 text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.map((customer) => (
                            <motion.tr
                                key={customer.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                            >
                                <td className="p-4 cursor-pointer" onClick={() => {
                                    useStore.getState().setCurrentCustomerId(customer.id);
                                    useStore.getState().setSelectedView('customer-detail');
                                }}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                                            <UserCircle className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-800 hover:text-purple-600 transition-colors">{customer.name}</div>
                                            {customer.idNumber && <div className="text-xs text-slate-500">TC: {customer.idNumber}</div>}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="space-y-1 text-sm">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Phone className="w-4 h-4" />
                                            {customer.phone}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Mail className="w-4 h-4" />
                                            {customer.email}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-slate-600">{customer.city || '-'}</td>
                                <td className="p-4">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => {
                                                useStore.getState().setCurrentCustomerId(customer.id);
                                                useStore.getState().setEditMode(true);
                                                openModal('customerCreate');
                                            }}
                                            className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(customer.id)}
                                            className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>

                {filteredCustomers.length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                        Müşteri kaydı bulunmuyor
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default CustomerList;
