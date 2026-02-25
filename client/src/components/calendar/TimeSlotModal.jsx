import React from 'react';
import { X, Clock, Calendar, AlertCircle, Lock } from 'lucide-react';

const TimeSlotModal = ({ show, onClose, date, onSelectSlot, bookedSlots = [], blockedSlots = [] }) => {
    if (!show) return null;

    const timeSlots = [
        '10:00', '10:15', '10:30', '10:45',
        '11:00', '11:15', '11:30', '11:45',
        '12:00', '12:15', '12:30', '12:45',
        '14:00', '14:15', '14:30', '14:45',
        '15:00', '15:15', '15:30', '15:45'
    ];

    return (
        <div className="modal show d-block fade-in" tabIndex="-1" style={{ backgroundColor: 'rgba(10, 35, 66, 0.4)', backdropFilter: 'blur(4px)' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    <div className="modal-header bg-primary-navy text-white py-4 px-4 border-0">
                        <div className="d-flex align-items-center">
                            <div className="bg-white bg-opacity-20 p-2 rounded-3 me-3">
                                <Clock size={24} />
                            </div>
                            <div>
                                <h5 className="modal-title fw-extrabold mb-0">Select Time Slot</h5>
                                <p className="extra-small opacity-75 mb-0 tracking-widest">{date}</p>
                            </div>
                        </div>
                        <button type="button" className="btn-close btn-close-white opacity-50" onClick={onClose}></button>
                    </div>
                    <div className="modal-body p-4 p-md-5">
                        <div className="mb-4">
                            <h6 className="fw-bold text-muted text-uppercase tracking-wider mb-3" style={{ fontSize: '0.75rem' }}>Available Morning & Afternoon Sessions</h6>
                            <div className="row g-3">
                                {timeSlots.map(slot => {
                                    const isBooked = bookedSlots.includes(slot);
                                    const isBlocked = blockedSlots.includes(slot);
                                    const isDisabled = isBooked || isBlocked;

                                    return (
                                        <div key={slot} className="col-6 col-md-3">
                                            <button
                                                className={`btn w-100 py-3 rounded-3 fw-bold d-flex flex-column align-items-center justify-content-center border-2 ${isBooked ? 'btn-light border-danger text-danger opacity-50' :
                                                        isBlocked ? 'btn-light border-secondary text-muted opacity-50' :
                                                            'btn-outline-primary border-primary-subtle hover-primary shadow-sm'
                                                    }`}
                                                onClick={() => !isDisabled && onSelectSlot(slot)}
                                                disabled={isDisabled}
                                                style={{ height: '70px' }}
                                            >
                                                <span style={{ fontSize: '1rem' }}>{slot}</span>
                                                {isBlocked && <span className="extra-small d-flex align-items-center mt-1"><Lock size={10} className="me-1" /> BLOCKED</span>}
                                                {isBooked && <span className="extra-small d-flex align-items-center mt-1"><AlertCircle size={10} className="me-1" /> BOOKED</span>}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="p-3 bg-light rounded-3 d-flex align-items-center">
                            <AlertCircle size={18} className="text-muted me-3" />
                            <p className="small text-muted mb-0">
                                Sessions are strictly 15 minutes. Please be punctual to respect the Principal's schedule.
                            </p>
                        </div>
                    </div>
                    <div className="modal-footer border-0 p-4 pt-0">
                        <button type="button" className="btn btn-outline-dark rounded-pill px-4 fw-bold" onClick={onClose}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimeSlotModal;
