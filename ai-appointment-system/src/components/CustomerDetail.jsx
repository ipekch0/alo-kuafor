import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, User, FileText, PenTool, UserCircle, Phone, Mail, MapPin, Building, History } from 'lucide-react';
import { useCustomer } from '../hooks/useData';
import useStore from '../store';

const CustomerDetail = () => {
    const { currentCustomerId, setSelectedView } = useStore();
    const { data: customer, isLoading } = useCustomer(currentCustomerId);
    const [activeTab, setActiveTab] = useState('overview');

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <UserCircle className="w-16 h-16 mb-4 text-slate-300" />
                <p className="text-lg font-medium text-slate-600">Müşteri bulunamadı.</p>
                <button
                    onClick={() => setSelectedView('customers')}
                    className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/30"
                >
                    Listeye Dön
                </button>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Genel Bakış', icon: User },
        { id: 'history', label: 'Randevu Geçmişi', icon: History },
        { id: 'notes', label: 'Notlar', icon: PenTool },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => setSelectedView('customers')}
                    className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all text-slate-400 hover:text-purple-600"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        {customer.name}
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                            Müşteri
                        </span>
                    </h2>
                    <p className="text-slate-500 text-sm flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        {customer.city || 'Konum belirtilmemiş'}
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 pb-1">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-t-xl transition-all relative font-medium ${activeTab === tab.id
                            ? 'text-purple-600 bg-purple-50'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="card-premium p-8 min-h-[400px]">
                {activeTab === 'overview' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-12"
                    >
                        {/* Contact Info */}
                        <div className="space-y-8">
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">İletişim Bilgileri</h3>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-purple-50 rounded-xl">
                                        <Phone className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 font-medium">Telefon</p>
                                        <p className="text-slate-800 text-lg">{customer.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-pink-50 rounded-xl">
                                        <Mail className="w-5 h-5 text-pink-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 font-medium">E-posta</p>
                                        <p className="text-slate-800 text-lg">{customer.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-orange-50 rounded-xl">
                                        <MapPin className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 font-medium">Adres</p>
                                        <p className="text-slate-800">{customer.address || 'Adres girilmemiş'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="space-y-8">
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Diğer Bilgiler</h3>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-slate-50 rounded-xl">
                                        <Building className="w-5 h-5 text-slate-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 font-medium">TC Kimlik No</p>
                                        <p className="text-slate-800 text-lg font-mono">{customer.idNumber || '-'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-slate-50 rounded-xl">
                                        <Calendar className="w-5 h-5 text-slate-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 font-medium">Kayıt Tarihi</p>
                                        <p className="text-slate-800">
                                            {new Date(customer.createdAt || Date.now()).toLocaleDateString('tr-TR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'history' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-12"
                    >
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <History className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Randevu Geçmişi</h3>
                        <p className="text-slate-500 mb-8 max-w-md mx-auto">
                            Bu müşteriye ait geçmiş randevular burada listelenecek. Şu an için kayıt bulunamadı.
                        </p>
                        <button className="btn-premium shadow-purple-500/25">
                            Yeni Randevu Oluştur
                        </button>
                    </motion.div>
                )}

                {activeTab === 'notes' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-12"
                    >
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <PenTool className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Müşteri Notları</h3>
                        <p className="text-slate-500 mb-8">Henüz bir not eklenmemiş.</p>
                        <button className="btn-ghost-premium">
                            Not Ekle
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default CustomerDetail;
