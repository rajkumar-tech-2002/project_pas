import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Users,
  Calendar,
  AlertCircle,
  TrendingUp,
  CheckCircle,
  Clock,
  Search,
  MoreHorizontal,
  Check,
  X,
  Trash2,
} from "lucide-react";
import {
  getAppointments,
  getAppointmentStats,
  updateAppointmentStatus,
  deleteAppointment,
  getStrategicInsights,
  startMeeting,
  completeMeeting,
} from "../../services/appointmentService";
import { toast } from "sonner";
import "../../components/css/Dashboard.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [insights, setInsights] = useState({
    staffParticipation: 0,
    portalTraffic: 0,
    trafficLevel: "Low Demand",
    systemTip: "System data temporarily unavailable.",
  });
  const [activeMenu, setActiveMenu] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTimers, setActiveTimers] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appointments, statistics] = await Promise.all([
        getAppointments(),
        getAppointmentStats(),
      ]);

      if (Array.isArray(appointments)) {
        setRecentAppointments(appointments.slice(0, 8)); // Controller already sorts by date DESC
      }

      if (statistics) {
        setStats({
          total: statistics.total || 0,
          active: statistics.active || 0,
          completed: statistics.completed || 0,
          cancelled: statistics.cancelled || 0,
        });
      }

      const insightsData = await getStrategicInsights();
      if (insightsData) {
        setInsights(insightsData);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Close menu on click outside
    const handleClickOutside = () => setActiveMenu(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      const inProgress = recentAppointments.filter(
        (app) => app.status === "InProgress",
      );
      if (inProgress.length === 0) return;

      const now = new Date();
      const newTimers = { ...activeTimers };

      inProgress.forEach((app) => {
        if (app.actual_start_time) {
          const diff = Math.floor(
            (now - new Date(app.actual_start_time)) / 1000,
          );
          newTimers[app.id] = formatDuration(diff);
        }
      });

      setActiveTimers(newTimers);
    }, 1000);

    return () => clearInterval(interval);
  }, [recentAppointments]);

  const formatDuration = (totalSeconds) => {
    if (totalSeconds < 0) return "00:00:00";
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return [h, m, s].map((v) => v.toString().padStart(2, "0")).join(":");
  };

  const handleAction = async (e, id, action) => {
    e.stopPropagation();
    setActiveMenu(null);

    let success = false;
    let message = "";

    try {
      if (action === "delete") {
        toast.error("Delete this appointment permanently?", {
          action: {
            label: "Confirm Delete",
            onClick: async () => {
              const success = await deleteAppointment(id);
              if (success) {
                toast.success("Deleted successfully");
                fetchData();
              } else {
                toast.error("Delete failed");
              }
            },
          },
        });

        return; // IMPORTANT → Stop execution here
      } else if (action === "start") {
        success = await startMeeting(id);
        message = "Meeting started";
      } else if (action === "complete") {
        const res = await completeMeeting(id);
        success = res.success;
        message = "Meeting completed";
      } else {
        success = await updateAppointmentStatus(id, action);
        message = `Appointment marked as ${action}`;
      }

      if (success) {
        toast.success(message);
        fetchData();
      } else {
        toast.error(`Failed to ${action} appointment`);
      }
    } catch (error) {
      console.error(`Error performing action ${action}:`, error);
      toast.error("An unexpected error occurred");
    }
  };

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === id ? null : id);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="container-fluid px-4 fade-in">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <h4 className="fw-extrabold mb-1">Office Administration</h4>
          <p className="text-muted fs-6 mb-0">
            System Overview & Resource Management
          </p>
        </div>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-primary bg-opacity-10 p-2 rounded-3 me-3 text-primary-navy">
                  <Calendar size={24} />
                </div>
                <h6
                  className="mb-0 text-muted fw-bold text-uppercase tracking-wider"
                  style={{ fontSize: "0.7rem" }}
                >
                  Total Sessions
                </h6>
              </div>
              <h2 className="fw-extrabold mb-0">{stats.total}</h2>
              <div className="mt-3 fs-xs text-muted">
                <TrendingUp size={14} className="text-success me-1" />
                <span className="text-success fw-bold">+12%</span> from last
                month
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div
            className="card border-0 shadow-sm h-100"
            style={{ borderLeft: "4px solid #0d6efd" }}
          >
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-primary bg-opacity-10 p-2 rounded-3 me-3 text-primary">
                  <Clock size={24} />
                </div>
                <h6
                  className="mb-0 text-muted fw-bold text-uppercase tracking-wider"
                  style={{ fontSize: "0.7rem" }}
                >
                  Pending Active
                </h6>
              </div>
              <h2 className="fw-extrabold mb-0">{stats.active}</h2>
              <div className="mt-3 fs-xs text-muted">
                Average <span className="fw-bold">15m</span> per session
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div
            className="card border-0 shadow-sm h-100"
            style={{ borderLeft: "4px solid #2e7d32" }}
          >
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-success bg-opacity-10 p-2 rounded-3 me-3 text-success">
                  <CheckCircle size={24} />
                </div>
                <h6
                  className="mb-0 text-muted fw-bold text-uppercase tracking-wider"
                  style={{ fontSize: "0.7rem" }}
                >
                  Fulfilled
                </h6>
              </div>
              <h2 className="fw-extrabold mb-0">{stats.completed}</h2>
              <div className="mt-3 fs-xs text-muted">
                <span className="text-success fw-bold">94%</span> completion
                rate
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div
            className="card border-0 shadow-sm h-100"
            style={{ borderLeft: "4px solid #c62828" }}
          >
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-danger bg-opacity-10 p-2 rounded-3 me-3 text-danger">
                  <AlertCircle size={24} />
                </div>
                <h6
                  className="mb-0 text-muted fw-bold text-uppercase tracking-wider"
                  style={{ fontSize: "0.7rem" }}
                >
                  Cancelled
                </h6>
              </div>
              <h2 className="fw-extrabold mb-0">{stats.cancelled}</h2>
              <div className="mt-3 fs-xs text-muted">
                Most common:{" "}
                <span className="fw-bold text-danger">Conflict</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 p-4 pb-0 d-flex justify-content-between align-items-center">
              <h5 className="fw-extrabold mb-0">Live Activity Feed</h5>
              <div
                className="input-group input-group-sm"
                style={{ maxWidth: "200px" }}
              >
                <span className="input-group-text bg-light border-0">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-0"
                  placeholder="Filter activity..."
                />
              </div>
            </div>
            <div className="card-body p-4">
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="bg-light">
                    <tr className="small text-muted text-uppercase tracking-wider">
                      <th className="border-0 ps-3">User Context</th>
                      <th className="border-0">Schedule</th>
                      <th className="border-0">Agenda</th>
                      <th className="border-0 text-end pe-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="border-top-0">
                    {recentAppointments.length > 0 ? (
                      recentAppointments.map((app) => (
                        <tr key={app.id}>
                          <td className="ps-3 py-3">
                            <div className="d-flex align-items-center">
                              <div
                                className="bg-primary bg-opacity-10 rounded-circle p-2 me-3 text-primary-navy d-flex align-items-center justify-content-center"
                                style={{ width: "36px", height: "36px" }}
                              >
                                <Users size={16} />
                              </div>
                              <div>
                                <div className="fw-bold text-capitalize">
                                  {app.username}
                                </div>
                                <div className="extra-small text-muted">
                                  {app.role}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="small fw-medium text-dark">
                              {formatDate(app.date)}
                            </div>
                            <div className="extra-small text-muted">
                              {app.start_time} - {app.end_time}
                            </div>
                          </td>
                          <td>
                            <div
                              className="text-truncate"
                              style={{ maxWidth: "180px", fontSize: "0.85rem" }}
                              title={app.purpose}
                            >
                              {app.purpose}
                            </div>
                          </td>
                          <td className="text-end pe-3 position-relative">
                            {app.status === "InProgress" ? (
                              <div className="d-flex flex-column align-items-end">
                                <span className="badge bg-primary px-3 py-2 rounded-pill small fw-bold mb-1 pulse">
                                  IN PROGRESS
                                </span>
                                <div className="small fw-bold text-primary font-monospace">
                                  {activeTimers[app.id] || "00:00:00"}
                                </div>
                              </div>
                            ) : (
                              <div className="d-flex flex-column align-items-end">
                                <span
                                  className={`badge status-${app.status.toLowerCase()} px-2 py-1 rounded-pill small fw-bold`}
                                >
                                  {app.status}
                                </span>
                                {app.status === "Completed" &&
                                  app.actual_duration_seconds > 0 && (
                                    <div className="extra-small text-muted mt-1">
                                      Dur:{" "}
                                      {Math.floor(
                                        app.actual_duration_seconds / 60,
                                      )}
                                      m {app.actual_duration_seconds % 60}s
                                    </div>
                                  )}
                              </div>
                            )}
                            <div className="d-inline-block ms-2 position-relative">
                              <button
                                className="btn btn-link link-dark p-0"
                                onClick={(e) => toggleMenu(e, app.id)}
                              >
                                <MoreHorizontal size={18} />
                              </button>

                              {activeMenu === app.id && (
                                <div
                                  className="position-absolute end-0 bg-white shadow-lg border rounded-3 py-2 dropdown-menu-up"
                                  style={{
                                    width: "180px",
                                    bottom: "100%",
                                    right: "0",
                                    marginBottom: "8px",
                                    zIndex: 1050,
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {app.status === "Active" && (
                                    <button
                                      className="dropdown-item py-2 d-flex align-items-center"
                                      onClick={(e) =>
                                        handleAction(e, app.id, "start")
                                      }
                                    >
                                      <Clock
                                        size={16}
                                        className="me-2 ms-2 text-primary"
                                      />{" "}
                                      Start Meeting
                                    </button>
                                  )}
                                  {app.status === "InProgress" && (
                                    <button
                                      className="dropdown-item py-2 d-flex align-items-center"
                                      onClick={(e) =>
                                        handleAction(e, app.id, "complete")
                                      }
                                    >
                                      <CheckCircle
                                        size={16}
                                        className="me-2 ms-2 text-success"
                                      />{" "}
                                      End Meeting
                                    </button>
                                  )}
                                  {app.status === "Active" && (
                                    <>
                                      <button
                                        className="dropdown-item py-2 d-flex align-items-center"
                                        onClick={(e) =>
                                          handleAction(e, app.id, "Completed")
                                        }
                                      >
                                        <Check
                                          size={16}
                                          className="me-2 ms-2 text-success"
                                        />{" "}
                                        Mark Completed
                                      </button>
                                      <button
                                        className="dropdown-item py-2 d-flex align-items-center"
                                        onClick={(e) =>
                                          handleAction(e, app.id, "Cancelled")
                                        }
                                      >
                                        <X
                                          size={16}
                                          className="me-2 ms-2 text-danger"
                                        />{" "}
                                        Cancel
                                      </button>
                                    </>
                                  )}
                                  <div className="dropdown-divider"></div>
                                  <button
                                    className="dropdown-item py-2 d-flex align-items-center text-danger"
                                    onClick={(e) =>
                                      handleAction(e, app.id, "delete")
                                    }
                                  >
                                    <Trash2 size={16} className="me-2 ms-2" />{" "}
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center py-5 text-muted">
                          {loading ? (
                            <div
                              className="spinner-border spinner-border-sm text-primary"
                              role="status"
                            ></div>
                          ) : (
                            <>
                              <AlertCircle
                                size={32}
                                className="mb-2 opacity-25"
                              />
                              <p className="mb-0">
                                No system activity detected today.
                              </p>
                            </>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100 bg-primary-navy text-white position-relative">
            <div className="position-absolute top-0 end-0 p-3 opacity-10">
              <TrendingUp size={18} />
            </div>
            <div className="card-body p-4 position-relative z-index-1">
              <h5 className="fw-extrabold text-white mb-4">
                Strategic Insights
              </h5>

              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="small opacity-75">Portal Traffic</span>
                  <span className="small fw-bold">{insights.trafficLevel}</span>
                </div>
                <div
                  className="progress bg-white bg-opacity-10"
                  style={{ height: "8px" }}
                >
                  <div
                    className="progress-bar bg-white rounded-pill"
                    role="progressbar"
                    style={{ width: `${insights.portalTraffic}%` }}
                  ></div>
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="small opacity-75">Staff Participation</span>
                  <span className="small fw-bold">
                    {insights.staffParticipation}%
                  </span>
                </div>
                <div
                  className="progress bg-white bg-opacity-10"
                  style={{ height: "8px" }}
                >
                  <div
                    className="progress-bar bg-info rounded-pill"
                    role="progressbar"
                    style={{ width: `${insights.staffParticipation}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-5 p-3 rounded-4 bg-white bg-opacity-10 border border-white border-opacity-10">
                <h6 className="fw-bold mb-2 d-flex align-items-center text-info">
                  <TrendingUp size={16} className="me-2" /> System Tip
                </h6>
                <p className="extra-small mb-0 opacity-75">
                  {insights.systemTip}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
