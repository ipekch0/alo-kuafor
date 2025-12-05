import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const MainLayout = () => {
    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="pt-20">
                <Outlet />
            </div>
        </div>
    );
};

export default MainLayout;
