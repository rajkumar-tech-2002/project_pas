import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAppointmentById, rescheduleAppointment, getAvailableTimeRanges } from '../../services/appointmentService';
import { formatDate, format } from '../../utils/dateUtils';
import TimeRangeSelector from '../../components/calendar/TimeRangeSelector';
import { User, Calendar, ArrowLeft, Clock } from 'lucide-react';
import { toast } from 'sonner';

const RescheduleAppointment = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rescheduleDate, setRescheduleDate] = useState('');
    const [availableRanges, setAvailableRanges] = useState([]);
    const [newTimeRange, setNewTimeRange] = useState(null);

    useEffect(() => {
        loadAppointment();
    }, [id]);

    const loadAppointment = async () => {
        try {
            const data = await getAppointmentById(id);
            if (data) {
                setAppointment(data);
                setRescheduleDate(data.date);
                loadAvailabilityForReschedule(data.date);
            } else {
                toast.error('Appointment not found');
                navigate('/admin/all');
            }
        } catch (error) {
            toast.error('Error loading appointment');
        } finally {
            setLoading(false);
        }
    };

    const loadAvailabilityForReschedule = async (date) => {
        const { availableRanges } = await getAvailableTimeRanges(date);
        setAvailableRanges(availableRanges);
    };

    const handleRescheduleDateChange = (e) => {
        const date = e.target.value;
        setRescheduleDate(date);
        setNewTimeRange(null);
        if (date) {
            loadAvailabilityForReschedule(date);
        }
    };

    const confirmReschedule = async () => {
        if (!appointment || !rescheduleDate || !newTimeRange) return;

        const success = await rescheduleAppointment(appointment.id, {
            date: rescheduleDate,
            start_time: newTimeRange.start_time,
            end_time: newTimeRange.end_time,
            duration_minutes: newTimeRange.duration
        });

        if (success) {
            toast.success('Appointment rescheduled successfully');
            setNewTimeRange(null);
            loadAppointment(); // Refresh the current booking view
        } else {
            toast.error('Failed to reschedule appointment');
        }
    };

    if (loading) {
        return (
            <div className="container-fluid px-4 d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!appointment) return null;

    return (
        <div className="container-fluid px-4 fade-in py-4">
            <button
                className="btn btn-link text-muted mb-4 text-decoration-none d-flex align-items-center ps-0"
                onClick={() => navigate('/admin/all')}
            >
                <ArrowLeft size={18} className="me-2" /> Back to All Appointments
            </button>

            <div className="card border-0 shadow-sm" style={{ overflow: 'hidden' }}>
                <div className="card-header bg-white border-bottom p-4">
                    <h4 className="fw-bold mb-0">Reschedule Appointment</h4>
                    <p className="text-muted small mb-0">Select a new date and time for this session</p>
                </div>
                <div className="card-body p-0">
                    <div className="row g-0">
                        {/* Left Column: Current Booking */}
                        <div className="col-md-5 bg-light border-end p-4">
                            <h6 className="fw-bold text-uppercase text-muted small mb-4 tracking-widest">Current Booking</h6>

                            <div className="bg-white rounded-3 p-4 shadow-sm mb-4">
                                <div className="d-flex align-items-center mb-4">
                                    <div className="bg-primary-navy bg-opacity-10 p-3 rounded-circle me-3">
                                        <User size={28} className="text-white" />
                                    </div>
                                    <div>
                                        <h5 className="fw-bold mb-1">{appointment.username}</h5>
                                        <span className="badge bg-secondary text-white small">{appointment.role || 'Staff'}</span>
                                    </div>
                                </div>

                                <div className="mb-3 border-bottom pb-3">
                                    <div className="d-flex align-items-center text-muted mb-2">
                                        <Calendar size={18} className="me-2 text-primary" />
                                        <span className="fw-medium">{format(new Date(appointment.date), 'dd-MM-yyyy')}</span>
                                    </div>
                                    <div className="d-flex align-items-center text-muted">
                                        <Clock size={18} className="me-2 text-primary" />
                                        <span className="fw-medium">{appointment.start_time} - {appointment.end_time}</span>
                                    </div>
                                </div>

                                <div>
                                    <small className="text-uppercase text-muted fw-bold" style={{ fontSize: '0.7rem' }}>Purpose</small>
                                    <p className="fw-bold text-dark mt-1 mb-0">{appointment.purpose}</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: New Schedule */}
                        <div className="col-md-7 p-4 bg-white">
                            <h6 className="fw-bold text-uppercase text-muted small mb-4 tracking-widest">New Schedule Details</h6>

                            <div className="mb-4">
                                <label className="form-label fw-bold small text-uppercase text-muted">Select New Date</label>
                                <input
                                    type="date"
                                    className="form-control form-control-lg bg-light border-0"
                                    value={rescheduleDate}
                                    onChange={handleRescheduleDateChange}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            {rescheduleDate && (
                                <div className="mb-4 fade-in">
                                    <label className="form-label fw-bold small text-uppercase text-muted mb-2">Select New Time Range</label>
                                    <div className="border rounded-3 p-3 bg-white">
                                        <TimeRangeSelector
                                            date={rescheduleDate}
                                            availableRanges={availableRanges}
                                            onSelectRange={setNewTimeRange}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="d-flex gap-3 pt-3 mt-4 border-top">
                                <button
                                    className="btn btn-light btn-lg flex-grow-1 fw-bold"
                                    onClick={() => navigate('/admin/all')}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary-navy btn-lg flex-grow-1 fw-bold shadow-sm"
                                    onClick={confirmReschedule}
                                    disabled={!rescheduleDate || !newTimeRange}
                                >
                                    Confirm Update
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RescheduleAppointment;
