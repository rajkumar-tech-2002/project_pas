import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    LogOut,
    User,
    Bell,
    Search,
    Menu,
    LayoutDashboard,
    Calendar,
    Clock,
    Settings,
    FileText
} from 'lucide-react';
import notificationService from '../../services/notificationService';

const Navbar = ({ onToggleSidebar }) => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);
    const searchRef = useRef(null);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);

    const searchableItems = user?.role === 'Admin' ? [
        { name: 'Overview', path: '/admin', icon: <LayoutDashboard size={18} /> },
        { name: 'All Bookings', path: '/admin/all', icon: <FileText size={18} /> },
        { name: 'Availability', path: '/admin/availability', icon: <Clock size={18} /> },
        { name: 'Management', path: '/admin/slots', icon: <Settings size={18} /> },
        { name: 'Analytics', path: '/admin/reports', icon: <FileText size={18} /> },
    ] : [
        { name: 'Dashboard', path: '/user', icon: <LayoutDashboard size={18} /> },
        { name: 'Book Appointment', path: '/user/book', icon: <Calendar size={18} /> },
        { name: 'History', path: '/user/my-appointments', icon: <Clock size={18} /> },
    ];

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const data = await notificationService.getNotifications(user.username, user.role);
            
            if (data && Array.isArray(data)) {
                setNotifications(data);
                const unread = data.filter(n => n && !n.is_read).length;
                setUnreadCount(unread);
            } else {
                console.warn('Notifications data is not an array:', data);
                setNotifications([]);
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearchResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.trim()) {
            const filtered = searchableItems.filter(item =>
                item.name.toLowerCase().includes(query.toLowerCase())
            );
            setSearchResults(filtered);
            setShowSearchResults(true);
        } else {
            setSearchResults([]);
            setShowSearchResults(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            fetchNotifications();
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead(user.username, user.role);
            fetchNotifications();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        navigate('/login');
    };

    if (!user) return null;

    return (
        <header className="top-header border-bottom">
            <div className="d-flex align-items-center w-100">
                <button
                    className="btn btn-link text-primary-navy p-2 me-3 hover-bg-light rounded-circle shadow-none border-0"
                    onClick={onToggleSidebar}
                    aria-label="Toggle Sidebar"
                >
                    <Menu size={24} />
                </button>

                <div className="d-none d-lg-flex align-items-center bg-light rounded-pill px-3 py-1 border border-light-subtle position-relative" style={{ width: '300px' }} ref={searchRef}>
                    <Search size={16} className="text-muted me-2" />
                    <input
                        type="text"
                        className="form-control bg-transparent border-0 shadow-none ps-0"
                        placeholder="Global search..."
                        style={{ fontSize: '0.85rem' }}
                        value={searchQuery}
                        onChange={handleSearch}
                        onFocus={() => searchQuery && setShowSearchResults(true)}
                    />

                    {showSearchResults && searchResults.length > 0 && (
                        <div className="search-results-dropdown">
                            <div className="search-results-header">Search Results</div>
                            {searchResults.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className="search-result-item"
                                    onClick={() => {
                                        setShowSearchResults(false);
                                        setSearchQuery('');
                                    }}
                                >
                                    <div className="icon-box">
                                        {item.icon}
                                    </div>
                                    <span className="name">{item.name}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                    {showSearchResults && searchResults.length === 0 && searchQuery && (
                        <div className="search-results-dropdown p-3 text-center text-muted extra-small">
                            No results found
                        </div>
                    )}
                </div>

                <div className="ms-auto d-flex align-items-center">
                    <div className="position-relative" ref={dropdownRef}>
                        <button
                            className="btn btn-link text-muted p-2 me-1 me-md-2 position-relative shadow-none border-0"
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className="badge-count">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <div className="notification-dropdown">
                                <div className="notification-header">
                                    <h6 className="mb-0">Notifications</h6>
                                    {notifications.length > 0 && (
                                        <button
                                            className="btn btn-link btn-sm text-primary p-0 shadow-none border-0 text-decoration-none"
                                            onClick={handleMarkAllAsRead}
                                            style={{ fontSize: '0.75rem' }}
                                        >
                                            Clear all
                                        </button>
                                    )}
                                </div>
                                <div className="notification-list">
                                    {notifications.length === 0 ? (
                                        <div className="p-4 text-center text-muted small">
                                            No notifications yet
                                        </div>
                                    ) : (
                                        notifications.map((notif) => (
                                            <div
                                                key={notif.id}
                                                className={`notification-item ${!notif.is_read ? 'unread' : ''}`}
                                                onClick={() => handleMarkAsRead(notif.id)}
                                            >
                                                <div className="message">{notif.message}</div>
                                                <div className="time">{new Date(notif.created_at).toLocaleString()}</div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="vr mx-2 opacity-10 d-none d-md-block" style={{ height: '30px' }}></div>

                    <div className="d-flex align-items-center ms-2 ms-md-3">
                        <div className="text-end me-3 d-none d-sm-block">
                            <p className="small fw-extrabold mb-0 text-dark" style={{ lineHeight: '1.2' }}>{user.full_name}</p>
                            <p className="extra-small text-muted mb-0 text-uppercase tracking-widest" style={{ fontSize: '0.6rem' }}>{user.role} ID</p>
                        </div>
                        <div className="bg-primary-navy bg-opacity-10 p-2 rounded-circle me-1 me-md-3 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '40px', height: '40px' }}>
                            <User size={20} className="text-white" />
                        </div>
                        <button className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-bold d-none d-md-flex align-items-center" onClick={handleLogout}>
                            <LogOut size={16} className="me-1" /> Logout
                        </button>
                        {/* Mobile Logout only icon */}
                        <button className="btn btn-link link-danger p-2 d-md-none shadow-none border-0" onClick={handleLogout}>
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
