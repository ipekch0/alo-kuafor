import React, { useState } from 'react';
import { Shield, FileText, Lock, Scale, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/landing/Footer';

const Legal = () => {
    const [activeTab, setActiveTab] = useState('mesafeli-satis');

    const tabs = [
        { id: 'mesafeli-satis', label: 'Mesafeli Satış Sözleşmesi', icon: FileText },
        { id: 'iptal-iade', label: 'İptal ve İade Koşulları', icon: AlertCircle },
        { id: 'kvkk', label: 'Gizlilik ve KVKK', icon: Lock },
        { id: 'kullanim', label: 'Kullanıcı Sözleşmesi', icon: Shield },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="pt-28 pb-12 max-w-5xl mx-auto px-6">

                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-slate-900 font-serif mb-2">Hukuki Metinler ve Sözleşmeler</h1>
                    <p className="text-slate-500">Şeffaf, adil ve güvenilir bir hizmet için yasal haklarınız ve sorumluluklarımız.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Tabs */}
                    <div className="lg:w-1/4">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden sticky top-28">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-6 py-4 text-left transition-colors border-l-4 ${activeTab === tab.id
                                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-medium'
                                        : 'border-transparent text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="lg:w-3/4">
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 min-h-[500px]">

                            {activeTab === 'mesafeli-satis' && (
                                <article className="prose prose-slate max-w-none text-slate-600">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Mesafeli Satış Sözleşmesi</h2>
                                    <p className="text-sm text-slate-500 mb-6 font-mono bg-slate-50 p-3 rounded">Son Güncelleme: 10.12.2025</p>

                                    <h3>1. TARAFLAR</h3>
                                    <p>İşbu Sözleşme aşağıdaki taraflar arasında aşağıda belirtilen hüküm ve şartlar çerçevesinde imzalanmıştır.</p>
                                    <p><strong>A. ALICI:</strong> (Sözleşmede bundan sonra "ALICI" olarak anılacaktır)</p>
                                    <p><strong>B. SATICI:</strong> (Sözleşmede bundan sonra "SATICI" olarak anılacaktır - ODAKMANAGE)</p>

                                    <h3>2. KONU</h3>
                                    <p>İşbu sözleşmenin konusu, ALICI'nın SATICI'ya ait internet sitesi üzerinden elektronik ortamda siparişini yaptığı aşağıda nitelikleri ve satış fiyatı belirtilen ürünün/hizmetin satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmelere Dair Yönetmelik hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.</p>

                                    <h3>3. SÖZLEŞME KONUSU ÜRÜN/HİZMET</h3>
                                    <p>Hizmetin türü, süresi, satış bedeli, ödeme şekli siparişin sonlandığı andaki bilgilerden oluşmaktadır.</p>
                                    <ul>
                                        <li>Hizmet: Online Randevu ve Salon Yönetim Yazılımı (SaaS)</li>
                                        <li>Ödeme Yöntemi: Kredi Kartı (Iyzico/Stripe)</li>
                                    </ul>

                                    <h3>4. GENEL HÜKÜMLER</h3>
                                    <p>4.1. ALICI, internet sitesinde sözleşme konusu ürünün temel nitelikleri, satış fiyatı ve ödeme şekli ile teslimata ilişkin ön bilgileri okuyup bilgi sahibi olduğunu ve elektronik ortamda gerekli teyidi verdiğini beyan eder.</p>
                                    <p>4.2. SATICI, sözleşme konusu ürünün sağlam, eksiksiz, siparişte belirtilen niteliklere uygun teslim edilmesinden sorumludur.</p>
                                    <p>4.3. Dijital hizmetlerde teslimat, hizmetin kullanıma açılması (hesap aktivasyonu) ile gerçekleşmiş sayılır.</p>
                                </article>
                            )}

                            {activeTab === 'iptal-iade' && (
                                <article className="prose prose-slate max-w-none text-slate-600">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-6">İptal ve İade Koşulları</h2>

                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-amber-900 text-sm">
                                        <strong>Önemli Bilgilendirme:</strong> Elektronik ortamda anında ifa edilen hizmetler (yazılım, dijital içerik), Cayma Hakkı Yönetmeliği gereğince <strong>cayma hakkının istisnaları</strong> kapsamındadır. Ancak ODAKMANAGE olarak müşteri memnuniyetini önde tutuyoruz.
                                    </div>

                                    <h3>1. İptal Koşulları (Abonelikler İçin)</h3>
                                    <p>Kullanıcı, dilediği zaman "Hesabım" sayfasından aboneliğini iptal edebilir. İptal işlemi, bir sonraki fatura döneminden itibaren geçerli olur. O ay için ödenmiş ücret iade edilmez, ancak hizmet süresi sonuna kadar kullanım devam eder.</p>

                                    <h3>2. Randevu İptalleri</h3>
                                    <p>Kuaför randevuları için iptal politikası, her bir İşletme'nin (Salon Sahibi) kendi belirlediği kurallara tabidir. ODAKMANAGE sadece aracı platformdur.</p>

                                    <h3>3. Para İadesi</h3>
                                    <p>Sistemsel bir hata veya hizmetin hiç verilememesi (sunucu erişim sorunu vb.) durumlarında, %100 para iadesi yapılır. İadeler, 7-14 iş günü içinde ödeme yapılan karta yansıtılır.</p>
                                </article>
                            )}

                            {activeTab === 'kvkk' && (
                                <article className="prose prose-slate max-w-none text-slate-600">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Kişisel Verilerin Korunması (KVKK)</h2>

                                    <h3>1. Veri Sorumlusu</h3>
                                    <p>ODAKMANAGE olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca, kişisel verilerinizi aşağıda açıklanan kapsamda işlemekteyiz.</p>

                                    <h3>2. İşlenen Kişisel Veriler</h3>
                                    <ul>
                                        <li>Kimlik Bilgileri: Ad, soyad.</li>
                                        <li>İletişim Bilgileri: E-posta adresi, telefon numarası.</li>
                                        <li>İşlem Güvenliği: IP adresi, giriş-çıkış kayıtları, şifre bilgileri.</li>
                                    </ul>

                                    <h3>3. Verilerin İşlenme Amacı</h3>
                                    <p>Kişisel verileriniz; randevu oluşturulması, üyelik işlemlerinin teyidi (SMS doğrulama), hizmet kalitesinin artırılması ve yasal yükümlülüklerin yerine getirilmesi amacıyla işlenir.</p>

                                    <h3>4. Verilerin Aktarılması</h3>
                                    <p>Verileriniz, yasal zorunluluklar dışında veya açık rızanız olmaksızın üçüncü kişilerle paylaşılmaz. SMS gönderimi için yetkili altyapı sağlayıcıları (Netgsm/Twilio) ile sınırlı paylaşım yapılır.</p>
                                </article>
                            )}

                            {activeTab === 'kullanim' && (
                                <article className="prose prose-slate max-w-none text-slate-600">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Kullanıcı Sözleşmesi</h2>

                                    <h3>1. Giriş</h3>
                                    <p>Bu platformu kullanarak, aşağıda belirtilen kullanım koşullarını kabul etmiş olursunuz. ODAKMANAGE, bu koşulları dilediği zaman değiştirme hakkını saklı tutar.</p>

                                    <h3>2. Hizmet Kapsamı</h3>
                                    <p>ODAKMANAGE, Güzellik Merkezleri ve Kuaförler için randevu ve yönetim yazılımı hizmeti (SaaS) sunan bir aracı platformdur.</p>

                                    <h3>3. Kullanıcı Yükümlülükleri</h3>
                                    <p>Kullanıcı, sisteme girerken verdiği bilgilerin doğru ve güncel olduğunu taahhüt eder. Yanlış bilgi verilmesinden doğacak zararlardan kullanıcı sorumludur.</p>

                                    <h3>4. Yasaklı Davranışlar</h3>
                                    <p>Sistemin güvenliğini tehdit etmek, diğer kullanıcılara spam mesaj göndermek veya sistemi amacı dışında kullanmak yasaktır. Bu durumlarda "Super Admin" yetkisiyle hesap süresiz olarak askıya alınır.</p>
                                </article>
                            )}

                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Legal;
