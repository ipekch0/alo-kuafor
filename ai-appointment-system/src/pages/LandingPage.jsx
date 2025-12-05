import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import Pricing from '../components/landing/Pricing';
import Footer from '../components/landing/Footer';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            <Navbar />
            <Hero />
            <Features />
            <Pricing />
            <Footer />
        </div>
    );
};

export default LandingPage;
