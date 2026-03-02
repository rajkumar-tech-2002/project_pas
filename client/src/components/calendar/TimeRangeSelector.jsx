import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, CheckCircle, Calendar } from 'lucide-react';
import {
    calculateDuration,
    formatDuration,
    formatTime12Hour,
    validateTimeRange,
    isWithinRange,
    timeToMinutes
} from '../../services/utils/timeRangeUtils';

const TimeRangeSelector = ({ date, availableRanges = [], availabilityWindows = [], onSelectRange }) => {
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [validationMessage, setValidationMessage] = useState(null);
    const [duration, setDuration] = useState(0);

    // Busy slots for display
    const busyWindows = availabilityWindows.filter(w => w.status === 'busy');

    // Update duration and validate when times change
    useEffect(() => {
        if (startTime && endTime) {
            const durationMins = calculateDuration(startTime, endTime);
            setDuration(durationMins);

            // 1. Basic validation (start < end)
            const basicValidation = validateTimeRange(startTime, endTime, 1, 480);

            if (!basicValidation.valid) {
                setValidationMessage({ type: 'error', text: basicValidation.error });
                onSelectRange(null);
                return;
            }

            // 2. Availability validation
            // Check if the selected range strictly falls within ANY of the available segments
            const isAvailable = availableRanges.some(range => {
                const rangeStart = timeToMinutes(range.start_time);
                const rangeEnd = timeToMinutes(range.end_time);
                const selectedStart = timeToMinutes(startTime);
                const selectedEnd = timeToMinutes(endTime);

                return selectedStart >= rangeStart && selectedEnd <= rangeEnd;
            });

            if (isAvailable) {
                setValidationMessage({ type: 'success', text: `Duration: ${formatDuration(durationMins)}` });
                onSelectRange({ start_time: startTime, end_time: endTime, duration: durationMins });
            } else {
                setValidationMessage({ type: 'error', text: 'The selected time is Scheduled. Please choose another slot.' });
                onSelectRange(null);
            }
        } else {
            setValidationMessage(null);
            setDuration(0);
            onSelectRange(null);
        }
    }, [startTime, endTime, availableRanges]);


    return (
        <div className="fade-in">
            <div className="mb-4">
                <div className="d-flex align-items-center mb-3">
                    <div className="bg-primary-navy bg-opacity-10 p-2 rounded-3 me-3">
                        <Clock size={20} className="text-white" />
                    </div>
                    <div>
                        <h6 className="fw-bold mb-0">Select Time Range</h6>
                        <p className="extra-small text-muted mb-0">{date}</p>
                    </div>
                </div>

                {availableRanges.length === 0 && busyWindows.length === 0 ? (
                    <div className="text-center py-5 bg-light rounded-4 border border-dashed border-2">
                        <AlertCircle size={32} className="text-muted mb-2 opacity-25" />
                        <p className="small text-muted mb-0">No availability for this date</p>
                        <p className="extra-small text-muted mb-0">Please select another date</p>
                    </div>
                ) : (
                    <>
                        {/* Available Time Windows Display */}
                        <div className="mb-4 p-3 bg-light rounded-3">
                            <h6 className="extra-small fw-bold text-muted text-uppercase mb-2">Admin Schedule</h6>
                            <div className="d-flex flex-wrap gap-2">
                                {availableRanges.map((range, index) => (
                                    <div key={`avail-${index}`} className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill border border-success border-opacity-25">
                                        <Calendar size={12} className="me-1" />
                                        {formatTime12Hour(range.start_time)} - {formatTime12Hour(range.end_time)}
                                    </div>
                                ))}
                                {busyWindows.map((range, index) => (
                                    <div key={`busy-${index}`} className="badge bg-warning bg-opacity-10 text-warning px-3 py-2 rounded-pill border border-warning border-opacity-25 shadow-sm" title={range.title}>
                                        <AlertCircle size={12} className="me-1" />
                                        {formatTime12Hour(range.start_time)} - {formatTime12Hour(range.end_time)} ({range.title || 'Busy'})
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Start Time Input */}
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-muted text-uppercase tracking-widest">
                                Start Time
                            </label>
                            <input
                                type="time"
                                className="form-control form-control-lg rounded-3 border-2"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                        </div>

                        {/* End Time Input */}
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-muted text-uppercase tracking-widest">
                                End Time
                            </label>
                            <input
                                type="time"
                                className="form-control form-control-lg rounded-3 border-2"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                            {startTime && !endTime && (
                                <div className="form-text extra-small">
                                    Select when your appointment will end
                                </div>
                            )}
                        </div>

                        {/* Validation Message */}
                        {validationMessage && (
                            <div className={`alert ${validationMessage.type === 'success' ? 'alert-success' : 'alert-danger'} border-0 shadow-sm d-flex align-items-center rounded-3 mb-3`}>
                                {validationMessage.type === 'success' ? (
                                    <CheckCircle size={18} className="me-2" />
                                ) : (
                                    <AlertCircle size={18} className="me-2" />
                                )}
                                <span className="small fw-bold">{validationMessage.text}</span>
                            </div>
                        )}

                        {/* Duration Display */}
                        {startTime && endTime && duration > 0 && validationMessage?.type === 'success' && (
                            <div className="p-3 bg-primary-navy bg-opacity-5 rounded-3 border border-primary-navy border-opacity-10">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="small text-white">Appointment Duration</span>
                                    <span className="fw-bold text-white fs-5">{formatDuration(duration)}</span>
                                </div>
                            </div>
                        )}

                        {/* Info Message */}
                        <div className="mt-4 p-3 bg-light rounded-3 d-flex align-items-start">
                            <AlertCircle size={16} className="text-muted me-2 mt-1 flex-shrink-0" />
                            <p className="extra-small text-muted mb-0">
                                Select a time range that fits your needs. Minimum duration is 5 minutes, maximum is 2 hours.
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default TimeRangeSelector;
