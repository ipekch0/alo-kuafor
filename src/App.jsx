import React from 'react';
// Deploy trigger: Salon verification and email system
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import Payment from './pages/Payment';
import Services from './pages/Services';
import About from './pages/About';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import AIAppointmentSystem from '../AIAppointmentSystem';
import ProtectedRoute from './components/ProtectedRoute';

import RegisterSalon from './pages/RegisterSalon';
import AIStudio from './pages/AIStudio';

import SearchPage from './pages/SearchPage';
import SalonDetail from './pages/SalonDetail';
import SubscriptionPlans from './pages/SubscriptionPlans';
import VerifyEmail from './pages/VerifyEmail';
import Legal from './pages/Legal';
import UserProfile from './pages/UserProfile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import MainLayout from './layouts/MainLayout';
import NotFound from './pages/NotFound';
import { Toaster } from 'react-hot-toast';
import SuperAdminDashboard from './pages/SuperAdminDashboard';

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
                {/* Public Pages with Main Layout */}
                <Route element={<MainLayout />}>
                    <Route path="/hizmetler" element={<Services />} />
                    <Route path="/hakkimizda" element={<About />} />
                    <Route path="/galeri" element={<Gallery />} />
                    <Route path="/iletisim" element={<Contact />} />
                    <Route path="/ai-studio" element={<AIStudio />} />

                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/salon/:id" element={<SalonDetail />} />
                    <Route path="/subscriptions" element={<SubscriptionPlans />} />
                    <Route path="/legal" element={<Legal />} />
                    <Route path="/profile" element={<UserProfile />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                </Route>

                <Route path="/login" element={<Login />} />
                <Route path="/register-salon" element={<RegisterSalon />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route
                    path="/payment"
                    element={
                        <ProtectedRoute>
                            <Payment />
                        </ProtectedRoute>
                    }
                />

                {/* Super Admin Route */}
                <Route
                    path="/super-admin"
                    element={
                        <ProtectedRoute>
                            <SuperAdminDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/panel/*"
                    element={
                        <ProtectedRoute>
                            <AIAppointmentSystem />
                        </ProtectedRoute>
                    }
                />

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    );
}

export default App;
