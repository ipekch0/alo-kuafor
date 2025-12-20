import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, User, FileText, Briefcase, Sparkles, ChevronDown, CheckCircle, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

const PublicBookingModal = ({ isOpen, onClose, salon, selectedService }) => {
    const [step, setStep] = useState(1); // 1: Service/Pro/Time, 2: Guest Details, 3: Success
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        serviceId: selectedService || '',
        professionalId: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        customerName: '',
        customerPhone: '',
        notes: ''
    });

    React.useEffect(() => {
        if (selectedService) {
            setFormData(prev => ({ ...prev, serviceId: selectedService }));
        }
    }, [selectedService]);

    const services = salon?.services || [];
    const professionals = salon?.professionals || [];

    const handleServiceChange = (e) => {
        setFormData({ ...formData, serviceId: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/appointments/public', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    salonId: salon.id,
                    ...formData
                })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Randevu oluşturulamadı');

            setStep(3); // Show success
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const nextStep = () => {
        if (step === 1) {
            if (!formData.serviceId || !formData.professionalId || !formData.date || !formData.time) {
                toast.error('Lütfen tüm alanları doldurun');
                return;
            }
            setStep(2);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative"
                >
                    {step !== 3 && (
                        <div className="relative z-10 px-8 pt-8 pb-4 flex items-center justify-between border-slate-100">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900">Randevu Oluştur</h3>
                                <p className="text-slate-500 text-sm">{salon?.name || 'Kuaför'} - Online Randevu</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    <div className="p-8">
                        {step === 1 && (
                            <div className="space-y-6">
                                {/* Service */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-purple-500" />
                                        Hizmet Seçimi
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={formData.serviceId}
                                            onChange={handleServiceChange}
                                            className="input-field appearance-none"
                                        >
                                            <option value="">Hizmet Seçiniz...</option>
                                            {services.map(s => (
                                                <option key={s.id} value={s.id}>{s.name} - {s.price}₺</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Professional */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <User className="w-4 h-4 text-indigo-500" />
                                        Uzman Seçimi
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={formData.professionalId}
                                            onChange={(e) => setFormData({ ...formData, professionalId: e.target.value })}
                                            className="input-field appearance-none"
                                        >
                                            <option value="">Farketmez / Uzman Seçiniz...</option>
                                            {professionals.map(p => (
                                                <option key={p.id} value={p.id}>{p.name} ({p.title})</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Date Time */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Tarih</label>
                                        <input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="input-field"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Saat</label>
                                        <input
                                            type="time"
                                            value={formData.time}
                                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                            className="input-field"
                                        />
                                    </div>
                                </div>

                                <button onClick={nextStep} className="w-full btn-premium py-4 rounded-2xl text-lg shadow-xl shadow-indigo-500/20">
                                    Devam Et
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 mb-6">
                                    <h4 className="font-bold text-indigo-900 mb-2">Özet</h4>
                                    <p className="text-sm text-indigo-700">
                                        {services.find(s => s.id == formData.serviceId)?.name} • {' '}
                                        {professionals.find(p => p.id == formData.professionalId)?.name}
                                    </p>
                                    <p className="text-sm text-indigo-700">
                                        {formData.date} • {formData.time}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Adınız Soyadınız</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ad Soyad"
                                        value={formData.customerName}
                                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                        className="input-field"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Telefon Numaranız</label>
                                    <input
                                        type="tel"
                                        required
                                        pattern="[0-9]{10,11}"
                                        title="Lütfen geçerli bir telefon numarası giriniz (Örn: 05551234567)"
                                        placeholder="05XX XXX XX XX"
                                        value={formData.customerPhone}
                                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                        className="input-field"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Notlar (Opsiyonel)</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="input-field resize-none"
                                        rows="2"
                                    />
                                </div>

                                <div className="flex gap-4 pt-2">
                                    <button type="button" onClick={() => setStep(1)} className="flex-1 btn-ghost-premium py-3 rounded-xl">
                                        Geri
                                    </button>
                                    <button type="submit" disabled={submitting} className="flex-[2] btn-premium py-3 rounded-xl shadow-lg">
                                        {submitting ? 'Oluşturuluyor...' : 'Randevuyu Onayla'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {step === 3 && (
                            <div className="text-center py-8">
                                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="w-12 h-12 text-green-600" />
                                </div>
                                <h3 className="text-3xl font-bold text-slate-900 mb-4">Randevunuz Alındı!</h3>
                                <p className="text-slate-600 mb-8 max-w-xs mx-auto">
                                    Randevunuz başarıyla oluşturuldu. İşletme onayı sonrası size SMS ile bilgi verilecektir.
                                </p>
                                <button onClick={onClose} className="btn-primary px-12 py-3 rounded-xl">
                                    Tamam
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PublicBookingModal;
