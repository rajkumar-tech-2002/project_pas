import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Plus, Edit2, Trash2, Save, X, CheckCircle, AlertCircle } from 'lucide-react';
import {
    getAllAvailability,
    getAvailabilityByDate,
    createAvailability,
    updateAvailability,
    deleteAvailability,
    checkAvailabilityOverlap
} from '../../services/availabilityService';
import { formatTime12Hour, validateTimeRange } from '../../services/utils/timeRangeUtils';
import { format, addMonths, subMonths } from '../../utils/dateUtils';

import { toast } from 'sonner';

const AvailabilityManagement = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [availabilityWindows, setAvailabilityWindows] = useState([]);
    const [allAvailability, setAllAvailability] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        start_time: '',
        end_time: '',
        status: 'available',
        title: ''
    });

    useEffect(() => {
        loadAllAvailability();
    }, []);

    useEffect(() => {
        if (selectedDate) {
            loadAvailability();
        }
    }, [selectedDate]);

    const loadAllAvailability = async () => {
        const all = await getAllAvailability();
        setAllAvailability(all);
    };

    const loadAvailability = async () => {
        const windows = await getAvailabilityByDate(selectedDate);
        setAvailabilityWindows(windows);
    };

    const handleDateSelect = (date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        setSelectedDate(`${year}-${month}-${day}`);
        setShowForm(false);
        setEditingId(null);
        setFormData({ start_time: '', end_time: '', status: 'available', title: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Validate time range (allow any duration from 1 minute to 8 hours)
            const validation = validateTimeRange(formData.start_time, formData.end_time, 1, 480);
            if (!validation.valid) {
                toast.error(validation.error);
                return;
            }

            // Check for overlaps
            const hasOverlap = await checkAvailabilityOverlap(
                { date: selectedDate, ...formData },
                editingId
            );

            if (hasOverlap) {
                toast.error('This time range overlaps with an existing window');
                return;
            }

            if (editingId) {
                // Update existing
                await updateAvailability(editingId, formData);
                toast.success('Window updated successfully');
            } else {
                // Create new
                await createAvailability({
                    date: selectedDate,
                    ...formData
                });
                toast.success('Window created successfully');
            }

            setShowForm(false);
            setEditingId(null);
            setFormData({ start_time: '', end_time: '', status: 'available', title: '' });
            await loadAvailability();
            await loadAllAvailability();
        } catch (error) {
            console.error('Error saving availability:', error);
            toast.error(error.response?.data?.error || 'Failed to save availability window');
        }
    };

    const handleEdit = (window) => {
        setEditingId(window.id);
        setFormData({
            start_time: window.start_time,
            end_time: window.end_time,
            status: window.status || 'available',
            title: window.title || ''
        });
        setShowForm(true);
    };

    const handleDelete = (id) => {
        toast.warning('Are you sure you want to delete this availability window?', {
            action: {
                label: 'Delete',
                onClick: async () => {
                    await deleteAvailability(id);
                    toast.success('Availability window deleted');
                    await loadAvailability();
                    await loadAllAvailability();
                }
            },
            cancel: {
                label: 'Cancel',
            },
        });
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({ start_time: '', end_time: '' });
    };

    // Generate simple calendar days for current month
    const generateCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];

        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    };

    const formatDisplayDate = (dateVal) => {
        if (!dateVal) return "";
        const date = new Date(dateVal);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const calendarDays = generateCalendarDays();

    return (
        <div className="container-fluid px-4 fade-in">
            <div className="mb-4">
                <h4 className="fw-extrabold mb-2">Availability Management</h4>
                <p className="text-muted fs-6">Define time windows when appointments can be scheduled</p>
            </div>



            <div className="row g-4">
                {/* Calendar Section */}
                <div className="col-lg-7">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-0 p-4 d-flex justify-content-between align-items-center">
                            <h5 className="fw-bold mb-0">Select Date</h5>
                            <div className="d-flex align-items-center gap-2">
                                <button className="btn btn-sm btn-outline-dark rounded-circle" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="fw-bold">{format(currentDate, 'MMMM yyyy')}</span>
                                <button className="btn btn-sm btn-outline-dark rounded-circle" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="card-body p-4">
                            <div className="row g-2">
                                {calendarDays.map(day => {
                                    const dateStr = `${day.getFullYear()}-${(day.getMonth() + 1).toString().padStart(2, '0')}-${day.getDate().toString().padStart(2, '0')}`;
                                    const isSelected = selectedDate === dateStr;
                                    const hasAvailability = allAvailability.some(w => w.date === dateStr);

                                    return (
                                        <div key={dateStr} className="col-3 col-md-2">
                                            <button
                                                className={`btn w-100 py-2 rounded-3 position-relative ${isSelected
                                                    ? 'btn-primary-navy text-white'
                                                    : hasAvailability
                                                        ? 'btn-outline-success'
                                                        : 'btn-outline-secondary'
                                                    }`}
                                                onClick={() => handleDateSelect(day)}
                                            >
                                                <div className="fw-bold">{day.getDate()}</div>
                                                {hasAvailability && !isSelected && (
                                                    <div className="position-absolute bottom-0 start-50 translate-middle-x mb-1 d-flex gap-1">
                                                        {allAvailability.some(w => w.date === dateStr && w.status === 'available') && (
                                                            <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#198754' }}></div>
                                                        )}
                                                        {allAvailability.some(w => w.date === dateStr && w.status === 'busy') && (
                                                            <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#fd7e14' }}></div>
                                                        )}
                                                    </div>
                                                )}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Availability Windows Section */}
                <div className="col-lg-5">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-primary-navy text-white p-4 d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="fw-bold text-white mb-0">Management</h6>
                                {selectedDate && (
                                    <p className="extra-small mb-0 opacity-75">
                                        {formatDisplayDate(selectedDate)}
                                    </p>
                                )}
                            </div>
                            {selectedDate && !showForm && (
                                <button
                                    className="btn btn-light btn-sm rounded-pill px-3"
                                    onClick={() => setShowForm(true)}
                                >
                                    <Plus size={16} className="me-1" /> Add Entry
                                </button>
                            )}
                        </div>
                        <div className="card-body p-4">
                            {!selectedDate ? (
                                <div className="text-center py-5">
                                    <CalendarIcon size={40} className="text-muted mb-3 opacity-25" />
                                    <p className="text-muted mb-0">Select a date to manage windows</p>
                                </div>
                            ) : showForm ? (
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Type</label>
                                        <div className="d-flex gap-2">
                                            <button
                                                type="button"
                                                className={`btn btn-sm flex-fill ${formData.status === 'available' ? 'btn-success' : 'btn-outline-success'}`}
                                                onClick={() => setFormData({ ...formData, status: 'available' })}
                                            >
                                                Available
                                            </button>
                                            <button
                                                type="button"
                                                className={`btn btn-sm flex-fill ${formData.status === 'busy' ? 'btn-warning' : 'btn-outline-warning'}`}
                                                onClick={() => setFormData({ ...formData, status: 'busy' })}
                                            >
                                                Commitment/Busy
                                            </button>
                                        </div>
                                    </div>
                                    {formData.status === 'busy' && (
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold">Description/Title</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                placeholder="Meeting, Appointment, etc."
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                required
                                            />
                                        </div>
                                    )}
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Start Time</label>
                                        <input
                                            type="time"
                                            className="form-control"
                                            value={formData.start_time}
                                            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">End Time</label>
                                        <input
                                            type="time"
                                            className="form-control"
                                            value={formData.end_time}
                                            onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                            required
                                        />
                                    </div>
                                    {formData.start_time && formData.end_time && (
                                        <div className="alert alert-info border-0 py-2 px-3 mb-3 small">
                                            <Clock size={14} className="me-2" />
                                            Duration: {(() => {
                                                const start = new Date(`2000-01-01T${formData.start_time}`);
                                                const end = new Date(`2000-01-01T${formData.end_time}`);
                                                const diff = (end - start) / 60000; // minutes
                                                if (diff <= 0) return 'Invalid';
                                                const hours = Math.floor(diff / 60);
                                                const mins = diff % 60;
                                                return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
                                            })()}
                                        </div>
                                    )}
                                    <div className="d-flex gap-2">
                                        <button type="submit" className="btn btn-primary-navy flex-fill">
                                            <Save size={16} className="me-1" /> {editingId ? 'Update' : 'Save'}
                                        </button>
                                        <button type="button" className="btn btn-outline-secondary" onClick={handleCancel}>
                                            <X size={16} />
                                        </button>
                                    </div>
                                </form>
                            ) : availabilityWindows.length === 0 ? (
                                <div className="text-center py-4">
                                    <Clock size={32} className="text-muted mb-2 opacity-25" />
                                    <p className="text-muted mb-0 small">No windows defined</p>
                                    <button
                                        className="btn btn-sm btn-primary-navy mt-3"
                                        onClick={() => setShowForm(true)}
                                    >
                                        <Plus size={14} className="me-1" /> Add Entry
                                    </button>
                                </div>
                            ) : (
                                <div className="list-group list-group-flush">
                                    {availabilityWindows.map(window => (
                                        <div key={window.id} className="list-group-item px-0 d-flex justify-content-between align-items-center">
                                            <div className="d-flex align-items-center">
                                                <div className={`me-3 p-2 rounded-circle ${window.status === 'busy' ? 'bg-warning bg-opacity-10 text-warning' : 'bg-success bg-opacity-10 text-success'}`}>
                                                    <Clock size={18} />
                                                </div>
                                                <div>
                                                    <div className="fw-bold d-flex align-items-center gap-2">
                                                        {formatTime12Hour(window.start_time)} - {formatTime12Hour(window.end_time)}
                                                        <span className={`badge rounded-pill extra-small ${window.status === 'busy' ? 'text-bg-warning' : 'text-bg-success'}`}>
                                                            {window.status === 'busy' ? 'Busy' : 'Available'}
                                                        </span>
                                                    </div>
                                                    <div className="extra-small text-muted">
                                                        {window.status === 'busy' ? (window.title || 'Busy Slot') : 'Open for Booking'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="d-flex gap-1">
                                                <button
                                                    className="btn btn-sm btn-outline-primary rounded-circle"
                                                    onClick={() => handleEdit(window)}
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger rounded-circle"
                                                    onClick={() => handleDelete(window.id)}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AvailabilityManagement;
