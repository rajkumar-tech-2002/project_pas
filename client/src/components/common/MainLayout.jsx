import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';

const MainLayout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const location = useLocation();

    // Close mobile sidebar on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname]);

    const toggleSidebar = () => {
        if (window.innerWidth < 992) {
            setIsMobileOpen(!isMobileOpen);
        } else {
            setIsCollapsed(!isCollapsed);
        }
    };

    return (
        <div className={`layout-wrapper ${isCollapsed ? 'sidebar-collapsed' : ''} ${isMobileOpen ? 'mobile-sidebar-open' : ''}`}>
            {/* Backdrop for mobile */}
            {isMobileOpen && (
                <div
                    className="mobile-backdrop"
                    onClick={() => setIsMobileOpen(false)}
                ></div>
            )}

            <Sidebar isCollapsed={isCollapsed} isMobileOpen={isMobileOpen} />

            <div className="main-content">
                <Navbar onToggleSidebar={toggleSidebar} />
                <main className="p-3 p-md-4 fade-in">
                    <Outlet />
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default MainLayout;
