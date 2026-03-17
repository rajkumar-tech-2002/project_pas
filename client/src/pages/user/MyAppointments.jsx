import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Clock, Info } from "lucide-react";
import CalendarView from "../../components/calendar/CalendarView";
import {
  format,
  addMonths,
  subMonths,
  formatDate,
} from "../../utils/dateUtils";
import { getAppointments } from "../../services/appointmentService";

const MyAppointments = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    const all = await getAppointments();
    setAppointments(all.filter((app) => app.user_id === currentUser.username));
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleDateClick = (date) => {
    const dateStr = formatDate(date);
    const dayAppointments = appointments.filter((app) => app.date === dateStr);
    if (dayAppointments.length > 0) {
      setSelectedDate(dateStr);
    } else {
      setSelectedDate(null);
    }
  };

  const appointmentsByDate = appointments.reduce((acc, app) => {
    if (!acc[app.date]) acc[app.date] = [];
    acc[app.date].push(app);
    return acc;
  }, {});

  return (
    <div className="container-fluid px-4 fade-in">
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 className="fw-bold mb-0">My Appointments</h4>
              <p className="text-muted small mb-0">
                View and track your scheduled meetings on the calendar
              </p>
            </div>
            <div className="d-flex align-items-center">
              <button
                className="btn btn-outline-secondary btn-sm me-1"
                onClick={handlePrevMonth}
              >
                <ChevronLeft size={18} />
              </button>
              <h6
                className="mb-0 mx-2"
                style={{ minWidth: "150px", textAlign: "center" }}
              >
                {format(currentDate, "MMMM yyyy")}
              </h6>
              <button
                className="btn btn-outline-secondary btn-sm ms-1"
                onClick={handleNextMonth}
              >
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

      {selectedDate && (
        <div className="card border-0 shadow-sm border-start border-4 border-primary fade-in">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold d-flex align-items-center mb-0">
                <Info size={20} className="me-2 text-primary" />
                Appointment Details for {format(new Date(selectedDate), 'dd-MM-yyyy')}
              </h5>
              <button
                className="btn btn-sm btn-outline-secondary border-0"
                onClick={() => setSelectedDate(null)}
              >
                <ChevronRight size={20} className="rotate-90" />
              </button>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="border-0">Time</th>
                    <th className="border-0">Status</th>
                    <th className="border-0">Purpose</th>
                    <th className="border-0">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments
                    .filter((app) => app.date === selectedDate)
                    .sort((a, b) => a.start_time.localeCompare(b.start_time))
                    .map((app) => (
                      <tr key={app.id}>
                        <td>
                          <div className="d-flex align-items-center fw-bold text-dark">
                            <Clock size={16} className="me-2 text-primary" />
                            {app.start_time.substring(0, 5)} -{" "}
                            {app.end_time.substring(0, 5)}
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge status-${app.status.toLowerCase()} p-2 px-3`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td>
                          <span className="text-muted">{app.purpose}</span>
                        </td>
                        <td>
                          {app.status === "Completed" &&
                            app.actual_duration_seconds > 0 ? (
                            <span className="badge bg-light text-dark fw-normal">
                              {Math.floor(app.actual_duration_seconds / 60)}m{" "}
                              {app.actual_duration_seconds % 60}s
                            </span>
                          ) : (
                            <span className="text-muted small">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
