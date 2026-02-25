import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, AlertCircle, ChevronRight, User as UserIcon, Plus } from 'lucide-react';
import { getAppointments } from '../../services/appointmentService';
import { format } from 'date-fns';
import { formatTime12Hour } from '../../services/utils/timeRangeUtils';

const UserDashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    useEffect(() => {
        const loadData = async () => {
            const all = await getAppointments();
            setAppointments(all.filter(app => app.user_id === currentUser.username));
        };
        loadData();
    }, []);

    const activeAppointments = appointments.filter(app => app.status === 'Active');

    return (
        <div className="container-fluid px-4 fade-in">
            <div className="row align-items-center mb-4">
                <div className="col-lg-8">
                    <h4 className="fw-extrabold mb-1">{currentUser.role} Dashboard</h4>
                    <p className="text-muted fs-6 mb-0">Welcome back, {currentUser.username} &bull; Academic Year 2025-26</p>
                </div>
                <div className="col-lg-4 text-lg-end mt-4 mt-lg-0">
                    <Link to="/user/book" className="btn btn-primary-navy col-12 col-lg-auto py-3">
                        <Plus size={20} className="me-2" /> Book New Appointment
                    </Link>
                </div>
            </div>

            <div className="row g-4 mb-5">
                <div className="col-md-4">
                    <div className="card h-100 border-0 shadow-sm overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a2342 0%, #1a3a5f 100%)' }}>
                        <div className="card-body p-4 text-white">
                            <div className="d-flex justify-content-between align-items-start mb-4">
                                <div className="bg-success bg-opacity-10 p-3 rounded-3">
                                    <Calendar size={28} />
                                </div>
                                <div className="text-end">
                                    <span className="display-6 fw-bold mb-0">{activeAppointments.length}</span>
                                    <p className="small opacity-75 mb-0 text-uppercase tracking-widest">Active</p>
                                </div>
                            </div>
                            <h6 className="card-title fw-bold">Scheduled Meetings</h6>
                            <p className="small opacity-75 mt-2 mb-0">Your upcoming sessions with the Principal.</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card h-100 border-0 shadow-sm overflow-hidden">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-start mb-4">
                                <div className="bg-success bg-opacity-10 p-3 rounded-3">
                                    <CheckCircle size={28} className="text-success" />
                                </div>
                                <div className="text-end">
                                    <span className="display-6 fw-bold mb-0 text-dark">
                                        {appointments.filter(app => app.status === 'Completed').length}
                                    </span>
                                    <p className="small text-muted mb-0 text-uppercase tracking-widest">History</p>
                                </div>
                            </div>
                            <h6 className="card-title fw-bold">Past Consultations</h6>
                            <p className="small text-muted mt-2 mb-0">Archive of your previous appointments.</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card h-100 border-0 shadow-sm bg-light">
                        <div className="card-body p-4 d-flex flex-column align-items-center justify-content-center text-center">
                            <div className="bg-primary bg-opacity-10 p-3 rounded-circle mb-3">
                                <UserIcon size={32} className="text-primary-navy" />
                            </div>
                            <h6 className="fw-bold mb-1">Verify Profile</h6>
                            <p className="small text-muted mb-3">Ensure your contact details are up to date for notifications.</p>
                            <button className="btn btn-outline-dark btn-sm rounded-pill px-4">Manage Profile</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-0 p-4 pb-0 d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold mb-0">Upcoming Bookings</h5>
                    <Link to="/user/my-appointments" className="text-decoration-none small d-flex align-items-center fw-bold text-primary-navy">
                        Detailed Calendar <ChevronRight size={16} className="ms-1" />
                    </Link>
                </div>
                <div className="card-body p-4">
                    {activeAppointments.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle custom-table">
                                <thead className="bg-light text-muted">
                                    <tr>
                                        <th className="border-0 ps-3">ACADEMIC DATE</th>
                                        <th className="border-0">TIME SLOT</th>
                                        <th className="border-0">OBJECTIVE</th>
                                        <th className="border-0">DURATION</th>
                                        <th className="border-0 text-end pe-3">STATUS</th>
                                    </tr>
                                </thead>
                                <tbody className="border-top-0">
                                    {activeAppointments.slice(0, 5).map(app => (
                                        <tr key={app.id} className="border-bottom border-light">
                                            <td className="fw-bold ps-3 py-3" style={{ color: '#2d3436' }}>
                                                {format(new Date(app.date), 'dd-MM-yyyy')}
                                            </td>
                                            <td>
                                                <span className="badge bg-light text-primary-navy border border-light-subtle px-3 py-2 fw-semibold d-inline-flex align-items-center">
                                                    <Clock size={14} className="me-2" />
                                                    {formatTime12Hour(app.start_time)} - {formatTime12Hour(app.end_time)}
                                                </span>
                                            </td>
                                            <td className="text-muted" style={{ maxWidth: '300px' }}>{app.purpose}</td>
                                            <td className="text-muted small">
                                                {app.status === 'Completed' && app.actual_duration_seconds > 0 ? (
                                                    <span className="fw-bold text-dark">
                                                        {Math.floor(app.actual_duration_seconds / 60)}m {app.actual_duration_seconds % 60}s
                                                    </span>
                                                ) : app.status === 'InProgress' ? (
                                                    <span className="text-primary fw-bold pulse">Live Now</span>
                                                ) : (
                                                    <span className="opacity-50">--:--</span>
                                                )}
                                            </td>
                                            <td className="text-end pe-3">
                                                <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill fw-bold">
                                                    {app.status.toUpperCase()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-5 bg-light rounded-4">
                            <AlertCircle size={48} className="text-muted mb-3 opacity-25" />
                            <h6 className="fw-bold text-muted">No Scheduled Appointments</h6>
                            <p className="text-muted small mb-4">You don't have any appointments currently scheduled.</p>
                            <Link to="/user/book" className="btn btn-primary-navy px-4">Schedule Now</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
