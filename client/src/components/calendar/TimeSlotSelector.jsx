import React from 'react';
import { Clock, AlertCircle, Lock } from 'lucide-react';

const TimeSlotSelector = ({ date, onSelectSlot, bookedSlots = [], blockedSlots = [] }) => {
    const timeSlots = [
        '10:00', '10:15', '10:30', '10:45',
        '11:00', '11:15', '11:30', '11:45',
        '12:00', '12:15', '12:30', '12:45',
        '14:00', '14:15', '14:30', '14:45',
        '15:00', '15:15', '15:30', '15:45'
    ];

    return (
        <div className="fade-in">
            <div className="mb-4">
                <div className="d-flex align-items-center mb-3">
                    <div className="bg-primary-navy bg-opacity-10 p-2 rounded-3 me-3">
                        <Clock size={20} className="text-white" />
                    </div>
                    <div>
                        <h6 className="fw-bold mb-0">Select Time Slot</h6>
                        <p className="extra-small text-muted mb-0">{date}</p>
                    </div>
                </div>

                <h6 className="fw-bold text-muted text-uppercase tracking-wider mb-3" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>
                    Available Morning & Afternoon Sessions
                </h6>

                <div className="row g-2 mb-4">
                    {timeSlots.map(slot => {
                        const isBooked = bookedSlots.includes(slot);
                        const isBlocked = blockedSlots.includes(slot);
                        const isDisabled = isBooked || isBlocked;

                        return (
                            <div key={slot} className="col-6">
                                <button
                                    className={`btn w-100 py-2 rounded-3 fw-bold d-flex flex-column align-items-center justify-content-center border-2 transition-all ${isBooked
                                            ? 'btn-light border-danger text-danger opacity-50 cursor-not-allowed'
                                            : isBlocked
                                                ? 'btn-light border-secondary text-muted opacity-50 cursor-not-allowed'
                                                : 'btn-outline-primary border-primary-subtle hover-primary shadow-sm'
                                        }`}
                                    onClick={() => !isDisabled && onSelectSlot(slot)}
                                    disabled={isDisabled}
                                    style={{
                                        height: '60px',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <span style={{ fontSize: '0.95rem' }}>{slot}</span>
                                    {isBlocked && (
                                        <span className="extra-small d-flex align-items-center mt-1">
                                            <Lock size={10} className="me-1" /> BLOCKED
                                        </span>
                                    )}
                                    {isBooked && (
                                        <span className="extra-small d-flex align-items-center mt-1">
                                            <AlertCircle size={10} className="me-1" /> BOOKED
                                        </span>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="p-3 bg-light rounded-3 d-flex align-items-start">
                    <AlertCircle size={16} className="text-muted me-2 mt-1 flex-shrink-0" />
                    <p className="extra-small text-muted mb-0">
                        Sessions are strictly 15 minutes. Please be punctual to respect the Principal's schedule.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TimeSlotSelector;
