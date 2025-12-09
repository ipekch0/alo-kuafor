import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Sparkles, Upload, Wand2, Share2, Download } from 'lucide-react';

const AIStudio = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [generatedImage, setGeneratedImage] = useState(null);

    // Dummy styles for the carousel
    const styles = [
        { name: "Platin Sarısı Bob", id: 1, type: "color-cut" },
        { name: "Kızıl Dalgalı", id: 2, type: "color" },
        { name: "Kısa Pixie", id: 3, type: "cut" },
        { name: "Buz Mavisi Ombre", id: 4, type: "color" },
    ];

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(URL.createObjectURL(file));
            setGeneratedImage(null);
        }
    };

    const handleGenerate = () => {
        if (!selectedImage) return;

        setIsProcessing(true);
        // Simulate AI Processing
        setTimeout(() => {
            setIsProcessing(false);
            // For demo, we just use the original image but in a real app this would be the result
            // In a real implementation this would come from the backend
            setGeneratedImage(selectedImage);
        }, 3000);
    };

    return (
        <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center justify-center p-2 mb-4 bg-indigo-50 rounded-full border border-indigo-100"
                    >
                        <Sparkles className="w-5 h-5 text-indigo-600 mr-2" />
                        <span className="text-indigo-600 font-medium">AI Destekli Sanal Stüdyo</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold text-slate-900 mb-4"
                    >
                        Hayalindeki Saçı <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Saniyeler İçinde Tasarla</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-slate-500 max-w-2xl mx-auto"
                    >
                        Yapay zeka teknolojimizle kendinize en uygun saç modelini ve rengini deneyin.
                        Risk almadan değişime hazır olun.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Upload Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass-card p-8 rounded-3xl"
                    >
                        <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 hover:border-indigo-500/50 transition-colors group">
                            {selectedImage ? (
                                <img src={selectedImage} alt="Upload" className="w-full h-full object-cover" />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                                    <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-slate-100">
                                        <Camera className="w-10 h-10 text-indigo-500" />
                                    </div>
                                    <p className="text-lg font-medium text-slate-600">Fotoğraf Yükle veya Çek</p>
                                    <p className="text-sm text-slate-400 mt-2">JPG, PNG formatında</p>
                                </div>
                            )}

                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>

                        {/* Style Selector */}
                        <div className="mt-8">
                            <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center">
                                <Wand2 className="w-5 h-5 mr-2 text-indigo-600" />
                                Dönüşüm Seçenekleri
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {styles.map((style) => (
                                    <button
                                        key={style.id}
                                        className="p-4 rounded-xl bg-white border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all text-left group"
                                    >
                                        <div className="text-slate-900 font-medium group-hover:text-indigo-600">{style.name}</div>
                                        <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{style.type}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={!selectedImage || isProcessing}
                            className={`w-full mt-8 btn-premium py-4 text-lg flex items-center justify-center ${(!selectedImage || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isProcessing ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                                    Yapay Zeka Tasarlıyor...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    Sihirli Değişimi Gör
                                </>
                            )}
                        </button>
                    </motion.div>

                    {/* Result Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="glass-card p-8 rounded-3xl h-full flex flex-col"
                    >
                        <h3 className="text-2xl font-bold text-slate-900 mb-6">Sonuç</h3>

                        <div className="flex-1 rounded-2xl bg-slate-50 border border-slate-200 relative overflow-hidden group">
                            {isProcessing ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <div className="w-32 h-32 relative">
                                        <div className="absolute inset-0 rounded-full border-4 border-indigo-500/30 animate-pulse"></div>
                                        <div className="absolute inset-2 rounded-full border-4 border-purple-500/30 animate-pulse delay-75"></div>
                                        <div className="absolute inset-4 rounded-full border-4 border-pink-500/30 animate-pulse delay-150"></div>
                                        <Sparkles className="absolute inset-0 m-auto w-12 h-12 text-indigo-500 animate-bounce" />
                                    </div>
                                    <p className="mt-8 text-indigo-600 font-medium animate-pulse">Fotoğrafınız işleniyor...</p>
                                    <p className="text-slate-500 text-sm mt-2">Bu işlem yaklaşık 10-15 saniye sürebilir</p>
                                </div>
                            ) : generatedImage ? (
                                <div className="relative w-full h-full">
                                    <img src={generatedImage} alt="Generated Result" className="w-full h-full object-cover" />
                                    <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="flex gap-4 justify-center">
                                            <button className="p-3 rounded-full bg-white/90 hover:bg-white text-indigo-600 transition-colors shadow-lg">
                                                <Download className="w-6 h-6" />
                                            </button>
                                            <button className="p-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-lg shadow-indigo-600/30">
                                                <Share2 className="w-6 h-6" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                                    <Wand2 className="w-16 h-16 mb-4 opacity-50 text-indigo-200" />
                                    <p className="text-slate-600 font-medium">Henüz bir işlem yapılmadı</p>
                                    <p className="text-sm mt-1">Sol taraftan fotoğraf yükleyip başlayın</p>
                                </div>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-3 gap-4 mt-6">
                            <div className="p-4 rounded-xl bg-white border border-slate-200 text-center shadow-sm">
                                <div className="text-2xl font-bold text-slate-900 mb-1">3.5k</div>
                                <div className="text-xs text-slate-500">Kullanıcı</div>
                            </div>
                            <div className="p-4 rounded-xl bg-white border border-slate-200 text-center shadow-sm">
                                <div className="text-2xl font-bold text-slate-900 mb-1">98%</div>
                                <div className="text-xs text-slate-500">Memnuniyet</div>
                            </div>
                            <div className="p-4 rounded-xl bg-white border border-slate-200 text-center shadow-sm">
                                <div className="text-2xl font-bold text-slate-900 mb-1">4.9</div>
                                <div className="text-xs text-slate-500">Puan</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default AIStudio;
