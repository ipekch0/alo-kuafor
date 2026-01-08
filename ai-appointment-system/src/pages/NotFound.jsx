import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 max-w-md w-full text-center">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <h1 className="text-4xl font-bold text-slate-900 mb-2 font-serif">404</h1>
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Sayfa Bulunamadı</h2>
                <p className="text-slate-500 mb-8 leading-relaxed">
                    Aradığınız sayfa mevcut değil veya taşınmış olabilir. Lütfen anasayfaya dönüp tekrar deneyin.
                </p>

                <Link
                    to="/"
                    className="btn-premium w-full flex items-center justify-center gap-2 py-3 group"
                >
                    <Home className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                    Anasayfaya Dön
                </Link>
            </div>
            <div className="mt-8 text-slate-400 text-sm">
                ODAKMANAGE AI © 2024
            </div>
        </div>
    );
};

export default NotFound;
