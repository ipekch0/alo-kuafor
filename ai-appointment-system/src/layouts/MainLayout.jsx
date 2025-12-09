import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';

const MainLayout = () => {
    const location = useLocation();
    const isSearchPage = location.pathname === '/search';

    return (
        <div className="min-h-screen">
            <Navbar />
            <div className={isSearchPage ? "" : "pt-20"}>
                <Outlet />
            </div>
        </div>
    );
};

export default MainLayout;
