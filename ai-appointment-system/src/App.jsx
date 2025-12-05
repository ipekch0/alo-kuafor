import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import Services from './pages/Services';
import About from './pages/About';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import AIAppointmentSystem from '../AIAppointmentSystem';
import ProtectedRoute from './components/ProtectedRoute';

import AIStudio from './pages/AIStudio';
import SearchPage from './pages/SearchPage';
import SalonDetail from './pages/SalonDetail';
import MainLayout from './layouts/MainLayout';

import { Toaster } from 'react-hot-toast';

function App() {
    return (
        <>
            <Toaster position="top-right" toastOptions={{
                className: '',
                style: {
                    border: '1px solid #713200',
                    padding: '16px',
                    color: '#713200',
                },
                success: {
                    style: {
                        background: '#F0FDF4',
                        color: '#15803D',
                        border: '1px solid #BBF7D0',
                    },
                },
                error: {
                    style: {
                        background: '#FEF2F2',
                        color: '#B91C1C',
                        border: '1px solid #FECACA',
                    },
                },
            }} />
            <Routes>
                <Route path="/" element={<LandingPage />} />

                {/* Public Pages with Main Layout */}
                <Route element={<MainLayout />}>
                    <Route path="/hizmetler" element={<Services />} />
                    <Route path="/hakkimizda" element={<About />} />
                    <Route path="/galeri" element={<Gallery />} />
                    <Route path="/iletisim" element={<Contact />} />
                    <Route path="/ai-studio" element={<AIStudio />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/salon/:id" element={<SalonDetail />} />
                </Route>

                <Route path="/login" element={<Login />} />
                <Route
                    path="/panel/*"
                    element={
                        <ProtectedRoute>
                            <AIAppointmentSystem />
                        </ProtectedRoute>
                    }
                />
                {/* Redirect legacy root to landing page if needed, but root is already landing page */}
            </Routes>
        </>
    );
}

export default App;
