import React from 'react';
import { motion } from 'framer-motion';

const Gallery = () => {
    return (
        <div className="min-h-screen pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-20"
                >
                    <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 mb-6 font-serif">Galeri</h1>
                    <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mb-6"></div>
                    <p className="text-slate-500 max-w-2xl mx-auto text-lg font-light leading-relaxed">
                        Platformumuzdaki salonların imza attığı muhteşem dönüşümler.
                    </p>
                </motion.div>

                <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                    {[
                        "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80",
                        "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=800&q=80",
                        "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80",
                        "https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=80",
                        "https://images.unsplash.com/photo-1492106087820-71f171ce71d0?auto=format&fit=crop&w=800&q=80",
                        "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=800&q=80",
                        "https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?auto=format&fit=crop&w=800&q=80",
                        "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80",
                        "https://images.unsplash.com/photo-1596472537359-988505b4d220?auto=format&fit=crop&w=800&q=80",
                        "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=800&q=80"
                    ].map((src, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="relative group rounded-2xl overflow-hidden break-inside-avoid shadow-lg hover:shadow-2xl transition-shadow border border-white/5"
                        >
                            <img src={src} alt={`Gallery ${index}`} className="w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                <h3 className="text-white font-bold font-serif text-xl translate-y-4 group-hover:translate-y-0 transition-transform duration-300">Stil İkonu</h3>
                                <p className="text-indigo-300 text-sm translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">Trend 2024</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Gallery;
