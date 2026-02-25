import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar,
    Clock,
    Settings,
    FileText,
    GraduationCap,
    ChevronRight
} from 'lucide-react';

const Sidebar = ({ isCollapsed }) => {
    const user = JSON.parse(localStorage.getItem('currentUser'));

    if (!user) return null;

    const links = user.role === 'Admin' ? [
        { name: 'Overview', path: '/admin', icon: <LayoutDashboard size={20} /> },
        { name: 'All Bookings', path: '/admin/all', icon: <FileText size={20} /> },
        { name: 'Availability', path: '/admin/availability', icon: <Clock size={20} /> },
        { name: 'Management', path: '/admin/slots', icon: <Settings size={20} /> },
        { name: 'Analytics', path: '/admin/reports', icon: <FileText size={20} /> },
    ] : user.role === 'Staff' ? [
        { name: 'Dashboard', path: '/user', icon: <LayoutDashboard size={20} /> },
        { name: 'Book Appointment', path: '/user/book', icon: <Calendar size={20} /> },
        { name: 'History', path: '/user/my-appointments', icon: <Clock size={20} /> },
    ] : [
        { name: 'Dashboard', path: '/user', icon: <LayoutDashboard size={20} /> },
        { name: 'Book Appointment', path: '/user/book', icon: <Calendar size={20} /> },
        { name: 'History', path: '/user/my-appointments', icon: <Clock size={20} /> },
    ];

    return (
        <aside className={`sidebar shadow-lg ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header px-3 mb-4 mt-3">
                <div className="d-flex align-items-center justify-content-center">
                    <div className="bg-white rounded-circle p-2 d-flex align-items-center justify-content-center flex-shrink-0 brand-icon shadow-sm" style={{ width: '45px', height: '45px', border: '2px solid rgba(10, 35, 66, 0.1)' }}>
                        <GraduationCap size={28} className="text-primary-navy" />
                    </div>
                    {!isCollapsed && (
                        <div className="ms-3 overflow-hidden brand-text fade-in">
                            <h5 className="mb-0 fw-bold text-white text-truncate">PAS Portal</h5>
                            <p className="extra-small mb-0 text-white-50 text-uppercase tracking-widest" style={{ fontSize: '0.65rem' }}>
                                {user.role === 'Admin' ? "Principal's Office" : `${user.role} Portal`}
                            </p>
                        </div>
                    )}
                </div>
                {!isCollapsed && <hr className="bg-white opacity-20 mt-4 mx-2" />}
            </div>

            <nav className="sidebar-nav flex-grow-1">
                {!isCollapsed && (
                    <p className="px-4 extra-small fw-bold text-white-50 text-uppercase tracking-widest mb-3 fade-in" style={{ fontSize: '0.65rem' }}>Main Menu</p>
                )}
                {links.map((link) => (
                    <NavLink
                        key={link.name}
                        to={link.path}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active shadow-sm' : ''} ${isCollapsed ? 'justify-content-center' : ''}`}
                        title={isCollapsed ? link.name : ''}
                        end={link.path === '/admin' || link.path === '/user'}
                    >
                        <div className="icon-wrapper d-flex align-items-center justify-content-center flex-shrink-0">
                            {link.icon}
                        </div>
                        {!isCollapsed && (
                            <>
                                <span className="flex-grow-1 ms-3 text-truncate fade-in">{link.name}</span>
                                <ChevronRight size={14} className="opacity-0 link-arrow ms-auto" />
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer p-3">
                <div className={`card bg-white bg-opacity-10 border-0 p-3 rounded-4 ${isCollapsed ? 'px-2 py-3' : ''}`}>
                    {!isCollapsed && (
                        <p className="extra-small text-white-50 mb-2 fw-bold text-uppercase tracking-widest fade-in" style={{ fontSize: '0.6rem' }}>Current Session</p>
                    )}
                    <div className={`d-flex align-items-center ${isCollapsed ? 'justify-content-center' : ''}`}>
                        <div className="bg-white bg-opacity-20 rounded-circle p-2 flex-shrink-0">
                            <div className="bg-success p-1 rounded-circle" style={{ width: '8px', height: '8px' }}></div>
                        </div>
                        {!isCollapsed && (
                            <div className="ms-2 overflow-hidden fade-in">
                                <p className="small fw-bold text-white mb-0 text-truncate">{user.full_name}</p>
                                <p className="extra-small text-white-50 mb-0">Active Now</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
