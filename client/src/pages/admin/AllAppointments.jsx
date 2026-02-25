import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, User, Clock, AlertTriangle, XCircle, RefreshCw, Calendar } from 'lucide-react';
import CalendarView from '../../components/calendar/CalendarView';
import { format, addMonths, subMonths, formatDate } from '../../utils/dateUtils';
import { getAppointments, updateAppointmentStatus } from '../../services/appointmentService';
import { isMoreThan15MinsAway } from '../../utils/timeUtils';

import { toast } from 'sonner';

const AllAppointments = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState([]);
    const [selectedDayApps, setSelectedDayApps] = useState([]);
    const [selectedDateStr, setSelectedDateStr] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = async () => {
        const apps = await getAppointments();
        setAppointments(apps);
    };

    const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

    const handleDateClick = (date) => {
        const dStr = formatDate(date);
        setSelectedDateStr(dStr);
        setSelectedDayApps(appointments.filter(app => app.date === dStr));
    };

    const handleStatusChange = async (id, status, type = 'update') => {
        await updateAppointmentStatus(id, status);
        await loadAppointments();

        // Refresh selection
        const updated = await getAppointments();
        setSelectedDayApps(updated.filter(app => app.date === selectedDateStr));

        const msg = `${type === 'override' ? 'Appointment overridden' : 'Appointment status updated'} successfully!`;
        toast.success(msg);
    };

    const handleRescheduleClick = (app) => {
        navigate(`/admin/reschedule/${app.id}`);
    };

    const appointmentsByDate = appointments.reduce((acc, app) => {
        if (!acc[app.date]) acc[app.date] = [];
        acc[app.date].push(app);
        return acc;
    }, {});

    return (
        <div className="container-fluid px-4 fade-in">
            <div className="mb-4">
                <h4 className="fw-extrabold mb-2">All Appointments</h4>
                <p className="text-muted fs-6">View and manage all appointments</p>
            </div>


            <div className="row g-4">
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="fw-bold mb-0">System Calendar</h5>
                                <div className="d-flex align-items-center">
                                    <button className="btn btn-outline-secondary btn-sm me-2" onClick={handlePrevMonth}>
                                        <ChevronLeft size={18} />
                                    </button>
                                    <h6 className="mb-0 mx-1" style={{ minWidth: '150px', textAlign: 'center' }}>
                                        {format(currentDate, 'MMMM yyyy')}
                                    </h6>
                                    <button className="btn btn-outline-secondary btn-sm ms-2" onClick={handleNextMonth}>
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                            <CalendarView
                                currentDate={currentDate}
                                onDateClick={handleDateClick}
                                appointmentsByDate={appointmentsByDate}
                            />
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-0 p-4 pb-0">
                            <h5 className="fw-bold fs-6 mb-0">
                                {selectedDateStr ? `Appointments for ${selectedDateStr}` : 'Select a date'}
                            </h5>
                        </div>
                        <div className="card-body p-4">
                            {selectedDayApps.length > 0 ? (
                                selectedDayApps.map(app => (
                                    <div key={app.id} className="card bg-light border-0 mb-3 p-3">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div className="d-flex align-items-center">
                                                <User size={16} className="text-muted me-2" />
                                                <span className="fw-bold">{app.username}</span>
                                            </div>
                                            <span className={`badge status-${app.status.toLowerCase()} border fw-normal`}>
                                                {app.status}
                                            </span>
                                        </div>
                                        <p className="small mb-2 d-flex align-items-center">
                                            <Clock size={14} className="me-2 text-primary" />
                                            {app.start_time} - {app.end_time}
                                        </p>
                                        <p className="small text-muted mb-3 border-bottom pb-2">{app.purpose}</p>

                                        {app.status === 'Active' && (
                                            <div className="d-flex flex-column gap-2">
                                                <div className="d-flex gap-2">
                                                    <button
                                                        className="btn btn-outline-primary btn-sm flex-grow-1 d-flex align-items-center justify-content-center fw-bold"
                                                        onClick={() => handleRescheduleClick(app)}
                                                    >
                                                        <Calendar size={14} className="me-1" /> Reschedule
                                                    </button>
                                                </div>
                                                <div className="d-flex gap-2">
                                                    <button
                                                        className="btn btn-danger btn-sm flex-grow-1 d-flex align-items-center justify-content-center"
                                                        onClick={() => handleStatusChange(app.id, 'Cancelled')}
                                                    >
                                                        <XCircle size={14} className="me-1" /> Cancel
                                                    </button>
                                                    {isMoreThan15MinsAway(app.date, app.start_time) && (
                                                        <button
                                                            className="btn btn-warning btn-sm flex-grow-1 d-flex align-items-center justify-content-center fw-bold"
                                                            onClick={() => handleStatusChange(app.id, 'Overridden', 'override')}
                                                        >
                                                            <RefreshCw size={14} className="me-1" /> Override
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-5">
                                    <Calendar size={40} className="text-muted mb-2 opacity-50" />
                                    <p className="text-muted small">No appointments scheduled for this day.</p>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AllAppointments;
