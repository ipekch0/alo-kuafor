import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn } from 'lucide-react';

const categories = [
    { id: 'all', label: 'Tümü' },
    { id: 'hair', label: 'Saç Tasarım' },
    { id: 'makeup', label: 'Makyaj' },
    { id: 'color', label: 'Renklendirme' },
    { id: 'wedding', label: 'Gelin Başı' }
];

const galleryItems = [
    {
        id: 1,
        category: 'hair',
        image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80",
        title: "Modern Kesim",
        stylist: "Ahmet Y."
    },
    {
        id: 2,
        category: 'makeup',
        image: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=800&q=80",
        title: "Doğal Işıltı",
        stylist: "Ayşe K."
    },
    {
        id: 3,
        category: 'color',
        image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80",
        title: "Platin Sarısı",
        stylist: "Mehmet S."
    },
    {
        id: 4,
        category: 'wedding',
        image: "https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=80",
        title: "Gelin Topuzu",
        stylist: "Zeynep A."
    },
    {
        id: 5,
        category: 'hair',
        image: "https://images.unsplash.com/photo-1492106087820-71f171ce71d0?auto=format&fit=crop&w=800&q=80",
        title: "Dalgalı Fön",
        stylist: "Can B."
    },
    {
        id: 6,
        category: 'makeup',
        image: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=800&q=80",
        title: "Gece Makyajı",
        stylist: "Elif D."
    },
    {
        id: 7,
        category: 'hair',
        image: "https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?auto=format&fit=crop&w=800&q=80",
        title: "Kısa Kesim",
        stylist: "Murat K."
    },
    {
        id: 8,
        category: 'wedding',
        image: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80",
        title: "Düğün Hazırlığı",
        stylist: "Selin Y."
    },
    {
        id: 9,
        category: 'color',
        image: "https://images.unsplash.com/photo-1596472537359-988505b4d220?auto=format&fit=crop&w=800&q=80",
        title: "Bal Köpüğü",
        stylist: "Deniz A."
    },
    {
        id: 10,
        category: 'hair',
        image: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=800&q=80",
        title: "Erkek Kesim",
        stylist: "Burak Ç."
    }
];

const Gallery = () => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedImage, setSelectedImage] = useState(null);

    const filteredItems = selectedCategory === 'all'
        ? galleryItems
        : galleryItems.filter(item => item.category === selectedCategory);

    return (
        <div className="min-h-screen pt-24 bg-slate-50">
            {/* Header Section */}
            <div className="bg-white pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 font-serif">
                            Değişimi Keşfet
                        </h1>
                        <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed mb-10">
                            Sanat ve stilin buluştuğu nokta. Uzman ekibimizin elinden çıkan en özel çalışmaları inceleyin.
                        </p>

                        {/* Category Filter */}
                        <div className="flex flex-wrap justify-center gap-4 mb-8">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${selectedCategory === cat.id
                                            ? 'bg-slate-900 text-white shadow-lg scale-105'
                                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                        }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Gallery Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <motion.div layout className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                    <AnimatePresence>
                        {filteredItems.map((item) => (
                            <motion.div
                                layout
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.5 }}
                                className="break-inside-avoid relative group rounded-2xl overflow-hidden cursor-zoom-in shadow-md hover:shadow-xl transition-shadow"
                                onClick={() => setSelectedImage(item)}
                            >
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        <h3 className="text-white text-xl font-bold font-serif">{item.title}</h3>
                                        <p className="text-white/80 text-sm mt-1">{item.stylist}</p>
                                    </div>
                                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full transform translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-100">
                                        <ZoomIn className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
                        onClick={() => setSelectedImage(null)}
                    >
                        <motion.button
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
                        >
                            <X className="w-8 h-8" />
                        </motion.button>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative max-w-5xl w-full max-h-[90vh] rounded-lg overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={selectedImage.image}
                                alt={selectedImage.title}
                                className="w-full h-full object-contain max-h-[85vh]"
                            />
                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                                <h3 className="text-2xl font-bold text-white font-serif">{selectedImage.title}</h3>
                                <p className="text-white/70 mt-1">Stilist: {selectedImage.stylist}</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Gallery;
