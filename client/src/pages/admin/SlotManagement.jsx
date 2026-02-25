import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Lock, Unlock, Calendar, Clock, AlertCircle, ShieldAlert, Plus, Trash2, X } from 'lucide-react';
import CalendarView from '../../components/calendar/CalendarView';
import { format, addMonths, subMonths, formatDate } from '../../utils/dateUtils';
import {
    getAvailabilityByDate,
    createAvailability,
    deleteAvailability
} from '../../services/availabilityService';
import {
    timeToMinutes,
    subtractBookedRange,
    validateTimeRange,
    formatTime12Hour,
    rangesOverlap
} from '../../services/utils/timeRangeUtils';

import { toast } from 'sonner';

const SlotManagement = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [availabilityWindows, setAvailabilityWindows] = useState([]);
    const [selectedDateStr, setSelectedDateStr] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('block'); // 'block' or 'add'

    const [formData, setFormData] = useState({
        start_time: '',
        end_time: ''
    });

    useEffect(() => {
        if (selectedDateStr) {
            loadData();
        }
    }, [selectedDateStr]);

    const loadData = async () => {
        setLoading(true);
        try {
            const windows = await getAvailabilityByDate(selectedDateStr);
            // Sort windows by start time
            const sorted = windows.sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time));
            setAvailabilityWindows(sorted);
        } catch (error) {
            console.error("Failed to load data", error);
            toast.error("Failed to load availability data");
        } finally {
            setLoading(false);
        }
    };

    const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

    const handleDateClick = (date) => {
        setSelectedDateStr(formatDate(date));
        setFormData({ start_time: '', end_time: '' });
    };

    const resetForm = () => {
        setFormData({ start_time: '', end_time: '' });
    };

    const handleBlockTime = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { start_time, end_time } = formData;

        // 1. Validate Input
        const validation = validateTimeRange(start_time, end_time, 1, 1440);
        if (!validation.valid) {
            toast.error(validation.error);
            setLoading(false);
            return;
        }

        const blockRange = { start_time, end_time };

        try {
            // 2. Find windows that overlap with the block range
            // We only care about blocking "available" windows.
            const affectedWindows = availabilityWindows.filter(window =>
                window.status !== 'blocked' && rangesOverlap(window, blockRange)
            );

            if (affectedWindows.length === 0) {
                toast.error('The selected time range is already blocked or invalid.');
                setLoading(false);
                return;
            }

            // 3. Process each affected window
            for (const window of affectedWindows) {
                // Delete the original large window
                await deleteAvailability(window.id);

                // Calculate the remaining chunks (available parts)
                const newRanges = subtractBookedRange([window], blockRange);

                // Create new windows for the remaining chunks (Status: Available)
                for (const range of newRanges) {
                    await createAvailability({
                        date: selectedDateStr,
                        start_time: range.start_time,
                        end_time: range.end_time,
                        status: 'available'
                    });
                }

                // NEW: Create the BLOCKED window for the range we just blocked (Status: Blocked)
                const start1 = timeToMinutes(window.start_time);
                const end1 = timeToMinutes(window.end_time);
                const start2 = timeToMinutes(blockRange.start_time);
                const end2 = timeToMinutes(blockRange.end_time);

                const overlapStart = Math.max(start1, start2);
                const overlapEnd = Math.min(end1, end2);

                if (overlapEnd > overlapStart) {
                    const minToTime = (m) => {
                        const h = Math.floor(m / 60);
                        const min = m % 60;
                        return `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
                    };

                    await createAvailability({
                        date: selectedDateStr,
                        start_time: minToTime(overlapStart),
                        end_time: minToTime(overlapEnd),
                        status: 'blocked'
                    });
                }
            }

            toast.success('Time range successfully blocked.');
            resetForm();
            await loadData();
        } catch (error) {
            toast.error('Failed to block time range.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBlock = (blockedWindow) => {
        toast.warning('Are you sure you want to remove this block?', {
            action: {
                label: 'Remove',
                onClick: async () => {
                    setLoading(true);
                    try {
                        const blockStart = timeToMinutes(blockedWindow.start_time);
                        const blockEnd = timeToMinutes(blockedWindow.end_time);

                        const leftNeighbor = availabilityWindows.find(w =>
                            w.status === 'available' && timeToMinutes(w.end_time) === blockStart
                        );
                        const rightNeighbor = availabilityWindows.find(w =>
                            w.status === 'available' && timeToMinutes(w.start_time) === blockEnd
                        );

                        let newStart = blockedWindow.start_time;
                        let newEnd = blockedWindow.end_time;
                        const idsToDelete = [blockedWindow.id];

                        if (leftNeighbor) {
                            newStart = leftNeighbor.start_time;
                            idsToDelete.push(leftNeighbor.id);
                        }
                        if (rightNeighbor) {
                            newEnd = rightNeighbor.end_time;
                            idsToDelete.push(rightNeighbor.id);
                        }

                        for (const id of idsToDelete) {
                            await deleteAvailability(id);
                        }

                        await createAvailability({
                            date: selectedDateStr,
                            start_time: newStart,
                            end_time: newEnd,
                            status: 'available'
                        });

                        toast.success('Block removed and availability restored.');
                        await loadData();
                    } catch (error) {
                        console.error(error);
                        toast.error('Failed to remove block.');
                    } finally {
                        setLoading(false);
                    }
                }
            },
            cancel: {
                label: 'Cancel',
            },
        });
    };

    const handleEditBlock = async (blockedWindow) => {
        // 1. Remove the block (restore availability) logic without confirmation alert
        setLoading(true);
        try {
            // Logic identical to delete but without alert and sets form data
            const blockStart = timeToMinutes(blockedWindow.start_time);
            const blockEnd = timeToMinutes(blockedWindow.end_time);

            const leftNeighbor = availabilityWindows.find(w =>
                w.status === 'available' && timeToMinutes(w.end_time) === blockStart
            );
            const rightNeighbor = availabilityWindows.find(w =>
                w.status === 'available' && timeToMinutes(w.start_time) === blockEnd
            );

            let newStart = blockedWindow.start_time;
            let newEnd = blockedWindow.end_time;
            const idsToDelete = [blockedWindow.id];

            if (leftNeighbor) {
                newStart = leftNeighbor.start_time;
                idsToDelete.push(leftNeighbor.id);
            }
            if (rightNeighbor) {
                newEnd = rightNeighbor.end_time;
                idsToDelete.push(rightNeighbor.id);
            }

            for (const id of idsToDelete) {
                await deleteAvailability(id);
            }

            await createAvailability({
                date: selectedDateStr,
                start_time: newStart,
                end_time: newEnd,
                status: 'available'
            });

            // 2. Pre-fill form
            // Tricky part: The format might be HH:MM:SS from DB, need HH:MM for input
            const formatForInput = (time) => time ? time.substring(0, 5) : '';

            setFormData({
                start_time: formatForInput(blockedWindow.start_time),
                end_time: formatForInput(blockedWindow.end_time)
            });
            setActiveTab('block');
            toast.info('Block open for editing. Adjust times and click Block.');
            await loadData();
        } catch (error) {
            console.error(error);
            toast.error('Failed to prepare block for editing.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddAvailability = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { start_time, end_time } = formData;

        // 1. Validate
        const validation = validateTimeRange(start_time, end_time, 1, 1440);
        if (!validation.valid) {
            toast.error(validation.error);
            setLoading(false);
            return;
        }

        try {
            // 2. Check overlap (optional: backend might allow overlapping windows, but cleaner to prevent)
            // Ideally we merge them, but for now let's just create it.
            // If it overlaps, it just means double availability which is fine or we can warn.
            // Let's just create it as requested.
            await createAvailability({
                date: selectedDateStr,
                start_time,
                end_time
            });

            toast.success('Availability added successfully.');
            resetForm();
            await loadData();
        } catch (error) {
            toast.error('Failed to add availability.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid px-4 fade-in">
            <div className="mb-4">
                <h4 className="fw-extrabold mb-1">Schedule Management</h4>
                <p className="text-muted fs-6">Manually block or unblock specific time ranges.</p>
            </div>

            <div className="row g-4">
                {/* Left Column: Calendar */}
                <div className="col-lg-7">
                    <div className="card border-0 shadow-sm overflow-hidden h-100">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h6 className="fw-bold mb-0 bg-light px-3 py-2 rounded-pill">
                                    {format(currentDate, 'MMMM yyyy')}
                                </h6>
                                <div className="d-flex gap-1">
                                    <button className="btn btn-sm btn-outline-light text-dark rounded-circle border" onClick={handlePrevMonth}>
                                        <ChevronLeft size={18} />
                                    </button>
                                    <button className="btn btn-sm btn-outline-light text-dark rounded-circle border" onClick={handleNextMonth}>
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                            <CalendarView
                                currentDate={currentDate}
                                onDateClick={handleDateClick}
                                appointmentsByDate={[]} // We don't need to visualize appts here, just date selection
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column: Control Panel */}
                <div className="col-lg-5">
                    <div className="card border-0 shadow-lg h-100">
                        <div className="card-header bg-white border-0 p-4 pb-0 d-flex justify-content-between align-items-center">
                            <h5 className="fw-extrabold mb-0 d-flex align-items-center text-primary-navy">
                                <ShieldAlert size={20} className="me-2" />
                                Controls
                            </h5>
                            {selectedDateStr && (
                                <span className="badge bg-primary-navy fw-normal px-3 py-2 rounded-pill">
                                    {selectedDateStr}
                                </span>
                            )}
                        </div>
                        <div className="card-body p-4">
                            {!selectedDateStr ? (
                                <div className="text-center py-5 h-100 d-flex flex-column justify-content-center align-items-center opacity-50">
                                    <Calendar size={48} className="mb-3 text-muted" />
                                    <p className="text-muted fw-bold">Select a date to manage</p>
                                </div>
                            ) : (
                                <>
                                    {/* Current Status Section */}
                                    <div className="mb-4">
                                        <label className="small text-muted fw-bold text-uppercase tracking-wider mb-2 d-block">Current Availability</label>
                                        {availabilityWindows.length === 0 ? (
                                            <div className="alert alert-secondary border-0 d-flex align-items-center rounded-3">
                                                <Lock size={16} className="me-2 text-muted" />
                                                <span className="small fw-bold text-muted">No availability records found.</span>
                                            </div>
                                        ) : (
                                            <div className="d-flex flex-wrap gap-2">
                                                {availabilityWindows.map(window => {
                                                    const isBlocked = window.status === 'blocked';
                                                    return (
                                                        <div key={window.id} className={`border rounded-3 px-3 py-2 d-flex align-items-center justify-content-between ${isBlocked ? 'bg-danger bg-opacity-10 border-danger border-opacity-25 text-danger' : 'bg-success bg-opacity-10 border-success border-opacity-25 text-success'}`}>
                                                            <div className="d-flex align-items-center">
                                                                {isBlocked ? <Lock size={14} className="me-2" /> : <Clock size={14} className="me-2" />}
                                                                <span className="fw-bold small">
                                                                    {formatTime12Hour(window.start_time)} - {formatTime12Hour(window.end_time)}
                                                                    <span className="xs ms-1 text-uppercase opacity-75">({isBlocked ? 'Blocked' : 'Open'})</span>
                                                                </span>
                                                            </div>
                                                            {isBlocked && (
                                                                <div className="d-flex gap-1 ms-3">
                                                                    <button
                                                                        className="btn btn-sm btn-link p-0 text-primary-navy opacity-75 hover-opacity-100"
                                                                        title="Edit Block"
                                                                        onClick={() => handleEditBlock(window)}
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-sm btn-link p-0 text-danger opacity-75 hover-opacity-100"
                                                                        title="Remove Block"
                                                                        onClick={() => handleDeleteBlock(window)}
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    <hr className="border-light my-4" />

                                    {/* Action Tabs */}
                                    <div className="d-flex gap-2 mb-4 p-1 bg-light rounded-pill border">
                                        <button
                                            className={`btn btn-sm flex-fill rounded-pill fw-bold ${activeTab === 'block' ? 'btn-white shadow-sm text-danger' : 'text-muted'}`}
                                            onClick={() => { setActiveTab('block'); resetForm(); }}
                                        >
                                            <Lock size={14} className="me-1 mb-1" /> Block Time
                                        </button>
                                        <button
                                            className={`btn btn-sm flex-fill rounded-pill fw-bold ${activeTab === 'add' ? 'btn-white shadow-sm text-success' : 'text-muted'}`}
                                            onClick={() => { setActiveTab('add'); resetForm(); }}
                                        >
                                            <Unlock size={14} className="me-1 mb-1" /> Add Time
                                        </button>
                                    </div>



                                    {/* Action Form */}
                                    <form onSubmit={activeTab === 'block' ? handleBlockTime : handleAddAvailability}>
                                        <div className="row g-3 mb-3">
                                            <div className="col-6">
                                                <label className="form-label extra-small fw-bold text-muted text-uppercase">Start Time</label>
                                                <input
                                                    type="time"
                                                    className="form-control bg-light border-0 fw-bold"
                                                    value={formData.start_time}
                                                    onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="col-6">
                                                <label className="form-label extra-small fw-bold text-muted text-uppercase">End Time</label>
                                                <input
                                                    type="time"
                                                    className="form-control bg-light border-0 fw-bold"
                                                    value={formData.end_time}
                                                    onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            className={`btn w-100 py-3 fw-bold rounded-3 shadow-sm ${activeTab === 'block' ? 'btn-danger' : 'btn-success'}`}
                                            disabled={loading}
                                        >
                                            {loading ? 'Processing...' : activeTab === 'block' ? 'Block Selected Range' : 'Add Availability Range'}
                                        </button>

                                        <p className="extra-small text-center text-muted mt-3 mb-0">
                                            {activeTab === 'block'
                                                ? 'Blocking a range will remove it from your existing active windows.'
                                                : 'Adding a range will create a new availability window for this date.'}
                                        </p>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SlotManagement;
