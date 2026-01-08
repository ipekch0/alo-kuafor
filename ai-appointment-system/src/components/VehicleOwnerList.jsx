import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Edit2, Trash2, UserCircle, Phone, Mail } from 'lucide-react';
import { useVehicleOwners, useCreateVehicleOwner, useDeleteVehicleOwner } from '../hooks/useData';

const VehicleOwnerList = () => {
    const { data: owners, isLoading } = useVehicleOwners();
    const createOwner = useCreateVehicleOwner();
    const deleteOwner = useDeleteVehicleOwner();

    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        idNumber: '',
        address: '',
        city: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createOwner.mutateAsync(formData);
            setShowModal(false);
            setFormData({ name: '', email: '', phone: '', idNumber: '', address: '', city: '' });
        } catch (error) {
            console.error('Error creating owner:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bu müşteriyi silmek istediğinize emin misiniz?')) {
            try {
                await deleteOwner.mutateAsync(id);
            } catch (error) {
                console.error('Error deleting owner:', error);
            }
        }
    };

    const filteredOwners = owners?.filter(owner =>
        owner.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        owner.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        owner.phone?.includes(searchTerm)
    ) || [];



    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">Müşteriler</h2>
                    <p className="text-gray-400 mt-1">{owners?.length || 0} kayıt bulundu</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:shadow-lg"
                >
                    <Plus className="w-5 h-5" />
                    Yeni Müşteri
                </button>
            </div>

            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Ad, email veya telefon ile ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50"
                    />
                </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-900/50">
                        <tr className="text-left text-gray-400 text-sm">
                            <th className="p-4">Ad Soyad</th>
                            <th className="p-4">İletişim</th>
                            <th className="p-4">Şehir</th>
                            <th className="p-4">Varlık Sayısı</th>
                            <th className="p-4 text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOwners.map((owner) => (
                            <motion.tr
                                key={owner.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                            >
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                                            <UserCircle className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-white">{owner.name}</div>
                                            {owner.idNumber && <div className="text-xs text-gray-400">TC: {owner.idNumber}</div>}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="space-y-1 text-sm">
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <Phone className="w-4 h-4" />
                                            {owner.phone}
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Mail className="w-4 h-4" />
                                            {owner.email}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-300">{owner.city || '-'}</td>
                                <td className="p-4">
                                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm">
                                        {owner.vehicles?.length || 0} varlık
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex justify-end gap-2">
                                        <button className="p-2 bg-slate-700/50 text-gray-300 rounded-lg hover:bg-slate-700">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(owner.id)}
                                            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>

                {filteredOwners.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        Müşteri kaydı bulunmuyor
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-2xl"
                    >
                        <h3 className="text-2xl font-bold text-white mb-6">Yeni Müşteri</h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Ad Soyad *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                                        placeholder="Ahmet Yılmaz"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                                        placeholder="ahmet@email.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Telefon *</label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                                        placeholder="0555 123 4567"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">TC Kimlik No</label>
                                    <input
                                        type="text"
                                        value={formData.idNumber}
                                        onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                                        maxLength="11"
                                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                                        placeholder="12345678901"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Şehir</label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                                        placeholder="İstanbul"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Adres</label>
                                    <textarea
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        rows="3"
                                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                                        placeholder="Tam adres..."
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={createOwner.isPending}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:shadow-lg disabled:opacity-50"
                                >
                                    {createOwner.isPending ? 'Ekleniyor...' : 'Kaydet'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default VehicleOwnerList;
