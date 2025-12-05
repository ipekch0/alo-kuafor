import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, MapPin, CreditCard, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import PaymentModal from './PaymentModal';
import { toast } from 'react-hot-toast';

const CustomerAppointments = () => {
    const { token } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState('upcoming'); // upcoming, past
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    const fetchAppointments = async () => {
        try {
            const response = await fetch('/api/appointments/my-appointments', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setAppointments(data);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
            toast.error('Randevular yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [token]);

    const handlePayClick = (appointment) => {
        setSelectedAppointment(appointment);
        setPaymentModalOpen(true);
    };

    const handlePaymentSuccess = () => {
        fetchAppointments(); // Refresh list to show paid status
        toast.success('Ödeme başarıyla alındı');
    };

    const filteredAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.dateTime);
        const now = new Date();
        if (selectedTab === 'upcoming') {
            return aptDate >= now;
        } else {
            return aptDate < now;
        }
    });

    if (loading) return <div>Yükleniyor...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Randevularım</h2>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setSelectedTab('upcoming')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${selectedTab === 'upcoming'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Gelecek
                    </button>
                    <button
                        onClick={() => setSelectedTab('past')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${selectedTab === 'past'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Geçmiş
                    </button>
                </div>
            </div>

            <div className="grid gap-4">
                {filteredAppointments.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900">Randevu Bulunamadı</h3>
                        <p className="text-slate-500">Henüz bu kategoride bir randevunuz yok.</p>
                    </div>
                ) : (
                    filteredAppointments.map((apt) => (
                        <div key={apt.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-2xl font-bold text-indigo-600">
                                            {new Date(apt.dateTime).getDate()}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">{apt.service.name}</h3>
                                            <p className="text-slate-500 font-medium">{apt.salon.name}</p>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{new Date(apt.dateTime).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{new Date(apt.dateTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-slate-500 pl-20">
                                        <MapPin className="w-4 h-4" />
                                        <span>{apt.salon.address}, {apt.salon.city}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-3 pl-20 md:pl-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:ml-4 min-w-[200px]">
                                    <div className="text-right">
                                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Tutar</div>
                                        <div className="text-xl font-bold text-slate-900">{apt.totalPrice} {apt.service.currency}</div>
                                    </div>

                                    <div className="w-full">
                                        {apt.isPaid ? (
                                            <div className="flex items-center justify-end gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full text-sm font-medium w-fit ml-auto">
                                                <CheckCircle className="w-4 h-4" />
                                                <span>Ödendi</span>
                                            </div>
                                        ) : selectedTab === 'upcoming' ? (
                                            <button
                                                onClick={() => handlePayClick(apt)}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                                            >
                                                <CreditCard className="w-4 h-4" />
                                                <span>Ödeme Yap</span>
                                            </button>
                                        ) : (
                                            <div className="flex items-center justify-end gap-2 text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full text-sm font-medium w-fit ml-auto">
                                                <AlertCircle className="w-4 h-4" />
                                                <span>Ödenmedi</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {selectedAppointment && (
                <PaymentModal
                    isOpen={paymentModalOpen}
                    onClose={() => setPaymentModalOpen(false)}
                    appointment={selectedAppointment}
                    onPaymentSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    );
};

export default CustomerAppointments;
