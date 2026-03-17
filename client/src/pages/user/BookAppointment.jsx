import React, { useState, useEffect } from "react";

import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  Info,
  MessageSquare,
} from "lucide-react";
import CalendarView from "../../components/calendar/CalendarView";
import TimeRangeSelector from "../../components/calendar/TimeRangeSelector";
import {
  format,
  addMonths,
  subMonths,
  formatDate,
} from "../../utils/dateUtils";
import {
  getAppointments,
  saveAppointment,
  getAvailableTimeRanges,
} from "../../services/appointmentService";
import {
  formatTime12Hour,
  formatDuration,
} from "../../services/utils/timeRangeUtils";
import api from "../../services/api";
import { toast } from "sonner";

const BookAppointment = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState(null);
  const [purpose, setPurpose] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [availableRanges, setAvailableRanges] = useState([]);
  const [availabilityWindows, setAvailabilityWindows] = useState([]);
  const [allAvailability, setAllAvailability] = useState([]);

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  useEffect(() => {
    loadData();
    loadAllAvailability();
  }, [currentDate]);

  const loadData = async () => {
    const all = await getAppointments();
    setAppointments(all);
  };

  const loadAllAvailability = async () => {
    const all = await api.get("/availability"); // Direct call or add to service
    setAllAvailability(all.data || []);
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleDateClick = async (date) => {
    const formattedDate = formatDate(date);
    setSelectedDate(formattedDate);
    setSelectedTimeRange(null);

    // Load available ranges for selected date
    const { availableRanges: ranges, availabilityWindows: windows } =
      await getAvailableTimeRanges(formattedDate);
    setAvailableRanges(ranges);
    setAvailabilityWindows(windows);
  };

  const handleSelectTimeRange = (range) => {
    setSelectedTimeRange(range);
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTimeRange || !purpose) return;

    const appointmentData = {
      date: selectedDate,
      start_time: selectedTimeRange.start_time,
      end_time: selectedTimeRange.end_time,
      purpose,
      username: currentUser.username,
      role: currentUser.role,
    };

    const result = await saveAppointment(appointmentData);

    if (result.success) {
      toast.success("Appointment secured successfully!");
      await loadData();
      setSelectedDate(null);
      setSelectedTimeRange(null);
      setPurpose("");
      setAvailableRanges([]);
    } else {
      toast.error(result.error);
    }
  };

  const appointmentsByDate = appointments.reduce((acc, app) => {
    if (!acc[app.date]) acc[app.date] = [];
    acc[app.date].push(app);
    return acc;
  }, {});

  return (
    <div className="container-fluid px-4 fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">Schedule Consultation</h4>
          <p className="text-muted small mb-0">
            Select a date from the calendar and choose your preferred time range
            for the Principal's office.
          </p>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm overflow-hidden">
            <div className="card-body p-4 p-md-5">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-5 gap-3">
                <div className="d-flex align-items-center bg-light rounded-pill px-4 py-2 border border-light-subtle">
                  <CalendarIcon size={18} className="text-primary-navy me-2" />
                  <h6 className="mb-0 fw-bold">
                    {format(currentDate, "MMMM yyyy")}
                  </h6>
                </div>
                <div className="d-flex align-items-center bg-white shadow-sm rounded-pill p-1 border">
                  <button
                    className="btn btn-link link-dark hover-bg-light p-2 rounded-circle border-0"
                    onClick={handlePrevMonth}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="vr mx-2 opacity-10"></div>
                  <button
                    className="btn btn-link link-dark hover-bg-light p-2 rounded-circle border-0"
                    onClick={handleNextMonth}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              <CalendarView
                currentDate={currentDate}
                onDateClick={handleDateClick}
                appointmentsByDate={appointmentsByDate}
                allAvailability={allAvailability}
              />
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div
            className="card border-0 shadow-lg sticky-top"
            style={{ top: "100px", borderTop: "5px solid var(--primary-navy)" }}
          >
            <div className="card-body p-4 p-md-4">
              <h6 className="fw-extrabold mb-4 d-flex align-items-center">
                <Info size={20} className="me-2 text-primary-navy" />
                Booking Overview
              </h6>

              {!selectedDate ? (
                <div className="text-center py-5 bg-light rounded-4 border border-dashed border-2">
                  <CalendarIcon
                    size={40}
                    className="text-muted mb-3 opacity-25"
                  />
                  <p className="small text-muted mb-0 fw-medium">
                    Pick a date to begin
                  </p>
                </div>
              ) : !selectedTimeRange ? (
                <TimeRangeSelector
                  date={selectedDate}
                  availableRanges={availableRanges}
                  availabilityWindows={availabilityWindows}
                  onSelectRange={handleSelectTimeRange}
                />
              ) : (
                <form onSubmit={handleBooking}>
                  <div className="mb-4">
                    <label className="form-label extra-small fw-bold text-muted text-uppercase tracking-widest">
                      Selected Date
                    </label>
                    <div className="bg-light p-3 rounded-3 d-flex align-items-center border-start border-4 border-primary-navy">
                      <CalendarIcon
                        size={20}
                        className="text-primary-navy me-3"
                      />
                      <span className="fw-bold fs-5">
                        {selectedDate && format(new Date(selectedDate), "dd-MM-yyyy")}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label extra-small fw-bold text-muted text-uppercase tracking-widest">
                      Confirmed Time
                    </label>
                    <div className="bg-light p-3 rounded-3 border-start border-4 border-accent-blue">
                      <div className="d-flex align-items-center mb-2">
                        <Clock size={20} className="text-accent-blue me-3" />
                        <span className="fw-bold fs-5">
                          {formatTime12Hour(selectedTimeRange.start_time)} -{" "}
                          {formatTime12Hour(selectedTimeRange.end_time)}
                        </span>
                      </div>
                      <div className="extra-small text-muted">
                        Duration:{" "}
                        {formatDuration(
                          (new Date(
                            `2000-01-01T${selectedTimeRange.end_time}`,
                          ) -
                            new Date(
                              `2000-01-01T${selectedTimeRange.start_time}`,
                            )) /
                          60000,
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-link btn-sm p-0 mt-2 text-decoration-none"
                      onClick={() => setSelectedTimeRange(null)}
                    >
                      Change time
                    </button>
                  </div>

                  <div className="mb-4">
                    <label className="form-label extra-small fw-bold text-muted text-uppercase tracking-widest">
                      Meeting Agenda
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <MessageSquare size={18} className="text-muted" />
                      </span>
                      <textarea
                        className="form-control border-start-0 ps-0"
                        rows="3"
                        placeholder="State your primary objective..."
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        required
                      ></textarea>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary-navy w-100 py-3 fw-semibold text-uppercase tracking-widest shadow"
                    disabled={!selectedDate || !selectedTimeRange || !purpose}
                  >
                    Confirm Booking
                  </button>
                </form>
              )}

              <div className="mt-4 p-3 bg-primary-navy bg-opacity-5 rounded-3">
                <h6 className="extra-small text-white fw-bold text-uppercase tracking-widest mb-2 opacity-75">
                  Important Note
                </h6>
                <p className="extra-small text-white mb-0">
                  Appointments are subject to Principal's availability and may
                  be rescheduled with prior notice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
