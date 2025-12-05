import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wand2, Download, Share2, Image as ImageIcon, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const AIStudio = () => {
    const [prompt, setPrompt] = useState('');
    const [style, setStyle] = useState('Modern');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState(null);

    const styles = [
        { id: 'Modern', name: 'Modern & Minimalist', description: 'Clean lines, neutral colors' },
        { id: 'Luxury', name: 'Luxury & Gold', description: 'Premium feel, gold accents' },
        { id: 'Industrial', name: 'Industrial Chic', description: 'Raw materials, edgy look' },
        { id: 'Bohemian', name: 'Bohemian', description: 'Natural elements, cozy vibe' },
        { id: 'Cyberpunk', name: 'Cyberpunk / Neon', description: 'Futuristic, neon lights' },
    ];

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            toast.error('Lütfen bir açıklama girin');
            return;
        }

        setIsGenerating(true);
        setGeneratedImage(null);

        try {
            const response = await fetch('http://localhost:5000/api/ai/generate-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt, style }),
            });

            const data = await response.json();

            if (data.success) {
                setGeneratedImage(data.imageUrl);
                toast.success('Görsel başarıyla oluşturuldu!');
                if (data.message) {
                    toast(data.message, { icon: 'ℹ️' });
                }
            } else {
                toast.error('Görsel oluşturulamadı');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Bir hata oluştu');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12">
            <div className="max-w-6xl mx-auto px-6">

                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 font-medium text-sm mb-4">
                        <Sparkles className="w-4 h-4" />
                        AI Design Studio
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Hayalinizdeki Salonu Tasarlayın</h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Yapay zeka ile saniyeler içinde benzersiz salon tasarımları, saç modelleri veya logo fikirleri oluşturun.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Controls */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Ne tasarlamak istersiniz?
                            </label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Örn: Beyaz mermer zeminli, altın detaylı, bol yeşil bitkili modern bir kuaför salonu..."
                                className="w-full h-32 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none text-slate-700 placeholder:text-slate-400"
                            />

                            <div className="mt-6">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Stil Seçin
                                </label>
                                <div className="grid grid-cols-1 gap-2">
                                    {styles.map((s) => (
                                        <button
                                            key={s.id}
                                            onClick={() => setStyle(s.id)}
                                            className={`p-3 rounded-xl text-left transition-all ${style === s.id
                                                ? 'bg-purple-50 border-purple-200 ring-1 ring-purple-500'
                                                : 'bg-white border border-slate-200 hover:border-purple-200'}`}
                                        >
                                            <div className="font-medium text-slate-900">{s.name}</div>
                                            <div className="text-xs text-slate-500">{s.description}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className="w-full mt-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-purple-200"
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Oluşturuluyor...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="w-5 h-5" />
                                        Oluştur
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Preview Area */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-full min-h-[500px] flex items-center justify-center p-4 relative overflow-hidden">
                            {generatedImage ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="relative w-full h-full"
                                >
                                    <img
                                        src={generatedImage}
                                        alt="Generated Design"
                                        className="w-full h-full object-cover rounded-xl shadow-lg"
                                    />
                                    <div className="absolute bottom-4 right-4 flex gap-2">
                                        <button className="p-3 bg-white text-slate-900 rounded-xl shadow-lg hover:bg-slate-50 transition-colors">
                                            <Download className="w-5 h-5" />
                                        </button>
                                        <button className="p-3 bg-white text-slate-900 rounded-xl shadow-lg hover:bg-slate-50 transition-colors">
                                            <Share2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="text-center text-slate-400">
                                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ImageIcon className="w-10 h-10" />
                                    </div>
                                    <p className="text-lg font-medium">Henüz bir görsel oluşturulmadı</p>
                                    <p className="text-sm">Sol taraftan detayları girip sihirli değneğe dokunun ✨</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIStudio;
