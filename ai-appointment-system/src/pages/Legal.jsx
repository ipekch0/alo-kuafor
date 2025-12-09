import React from 'react';
import { Shield, FileText, Lock } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/landing/Footer';

const Legal = () => {
    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="pt-24 pb-12 max-w-4xl mx-auto px-6">
                <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
                    <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                        <Shield className="w-8 h-8 text-indigo-600" />
                        <h1 className="text-3xl font-bold text-slate-900 font-serif">Gizlilik Politikası ve KVKK</h1>
                    </div>
                    <div className="prose prose-slate max-w-none text-slate-600">
                        <p>Son Güncelleme: 08.12.2024</p>
                        <h3>1. Veri Sorumlusu</h3>
                        <p>AloKuaför olarak kişisel verilerinizin güvenliğine önem veriyoruz. 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında veri sorumlusu sıfatıyla hareket etmekteyiz.</p>

                        <h3>2. Toplanan Kişisel Veriler</h3>
                        <p>Hizmetlerimizden yararlanmanız sırasında ad, soyad, e-posta, telefon numarası gibi kimlik ve iletişim bilgileriniz işlenmektedir.</p>

                        <h3>3. Veri İşleme Amacı</h3>
                        <p>Verileriniz, randevu süreçlerinin yürütülmesi, iletişim faaliyetlerinin sürdürülmesi ve yasal yükümlülüklerin yerine getirilmesi amacıyla işlenir.</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                        <FileText className="w-8 h-8 text-indigo-600" />
                        <h2 className="text-3xl font-bold text-slate-900 font-serif">Kullanım Koşulları</h2>
                    </div>
                    <div className="prose prose-slate max-w-none text-slate-600">
                        <h3>1. Hizmet Kabulü</h3>
                        <p>Bu platformu kullanarak aşağıdaki kullanım koşullarını kabul etmiş sayılırsınız.</p>

                        <h3>2. Randevu İptal Politikası</h3>
                        <p>Kullanıcılar, randevu saatinden en az 24 saat önce iptal işlemi gerçekleştirmelidir. Aksi takdirde hizmet bedelinin belirli bir kısmı tahsil edilebilir.</p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Legal;
