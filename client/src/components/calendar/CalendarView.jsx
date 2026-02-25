import React from 'react';
import { format, isSameMonth, isSameDay, getMonthDays } from '../../utils/dateUtils';

const CalendarView = ({ currentDate, onDateClick, appointmentsByDate, allAvailability = [] }) => {
    const days = getMonthDays(currentDate);

    const getDayClass = (day) => {
        let classes = 'calendar-day ';
        if (!isSameMonth(day, currentDate)) classes += 'other-month ';
        if (isSameDay(day, new Date())) classes += 'today ';
        return classes;
    };

    return (
        <div className="calendar-wrapper fade-in">
            <div className="calendar-grid">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="calendar-header">{d}</div>
                ))}
                {days.map((day, i) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const dayAppointments = appointmentsByDate?.[dateStr] || [];
                    const dayAvailability = allAvailability.filter(w => w.date === dateStr);
                    const hasBusy = dayAvailability.some(w => w.status === 'busy');
                    const hasAvailable = dayAvailability.some(w => w.status === 'available');

                    return (
                        <div
                            key={i}
                            className={getDayClass(day)}
                            onClick={() => onDateClick(day)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <div className="d-flex flex-column">
                                    <span className={`fw-bold ${isSameDay(day, new Date()) ? 'text-primary' : 'text-muted'}`} style={{ fontSize: '0.9rem' }}>
                                        {format(day, 'd')}
                                    </span>
                                    <div className="d-flex gap-1 mt-1">
                                        {hasAvailable && <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#198754' }}></div>}
                                        {hasBusy && <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#fd7e14' }}></div>}
                                    </div>
                                </div>
                                {dayAppointments.length > 0 && (
                                    <span
                                        className="badge bg-primary-navy rounded-pill px-2 py-1"
                                        style={{ fontSize: '0.7rem', fontWeight: '600' }}
                                    >
                                        {dayAppointments.length}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 p-3 bg-white rounded-4 border border-light-subtle d-flex flex-wrap gap-4 justify-content-center">
                <div className="d-flex align-items-center small text-muted">
                    <div className="rounded-circle me-2" style={{ width: '10px', height: '10px', background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' }}></div> Active
                </div>
                <div className="d-flex align-items-center small text-muted">
                    <div className="rounded-circle me-2" style={{ width: '10px', height: '10px', background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)' }}></div> Completed
                </div>
                <div className="d-flex align-items-center small text-muted">
                    <div className="rounded-circle me-2" style={{ width: '10px', height: '10px', background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)' }}></div> Cancelled
                </div>
                <div className="d-flex align-items-center small text-muted">
                    <div className="rounded-circle me-2" style={{ width: '10px', height: '10px', backgroundColor: '#f5f5f5' }}></div> Blocked
                </div>
            </div>
        </div>
    );
};

export default CalendarView;
