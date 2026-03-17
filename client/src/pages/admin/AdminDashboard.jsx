import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
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

// --- PERFORMANCE HELPERS ---
const formatDisplayDate = (dateString) => {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-");
  } catch (e) { return dateString; }
};

// Isolated Timer Component: Only this component re-renders every second, NOT the dashboard.
const MeetingTimer = memo(({ startTime }) => {
  const [elapsed, setElapsed] = useState("00:00:00");

  useEffect(() => {
    if (!startTime) return;
    const update = () => {
      const diff = Math.floor((new Date() - new Date(startTime)) / 1000);
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setElapsed([h, m, s].map(v => v.toString().padStart(2, "0")).join(":"));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  return (
    <div className="d-flex flex-column align-items-end">
      <span className="badge bg-primary px-3 py-2 rounded-pill small fw-bold mb-1 pulse">IN PROGRESS</span>
      <div className="small fw-bold text-primary font-monospace">{elapsed}</div>
    </div>
  );
});

// Memoized Stat Card: Visual stability and zero re-renders unless data actually changes.
const StatCard = memo(({ icon: Icon, title, value, subInfo, color, trendValue }) => (
  <div className="col-md-3">
    <div className="card border-0 shadow-sm h-100" style={color ? { borderLeft: `4px solid ${color}` } : {}}>
      <div className="card-body p-4">
        <div className="d-flex align-items-center mb-3">
          <div className={`${trendValue ? 'bg-success' : 'bg-primary'} bg-opacity-10 p-2 rounded-3 me-3 ${trendValue ? 'text-success' : 'text-primary'}`}>
            <Icon size={24} />
          </div>
          <h6 className="mb-0 text-muted fw-bold text-uppercase tracking-wider" style={{ fontSize: "0.7rem" }}>{title}</h6>
        </div>
        <h2 className="fw-extrabold mb-0">{value}</h2>
        <div className="mt-3 fs-xs text-muted">
          {trendValue ? <><TrendingUp size={14} className="text-success me-1" /><span className="text-success fw-bold">{trendValue}</span> from last month</> : subInfo}
        </div>
      </div>
    </div>
  </div>
));

// Optimized Row: Uses cached handlers to prevent unnecessary re-rendering.
const ActivityRow = memo(({ app, onAction, toggleMenu, activeMenu }) => (
  <tr>
    <td className="ps-3 py-3">
      <div className="d-flex align-items-center">
        <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3 text-primary-navy d-flex align-items-center justify-content-center" style={{ width: "36px", height: "36px" }}>
          <Users size={16} />
        </div>
        <div>
          <div className="fw-bold text-capitalize">{app.username}</div>
          <div className="extra-small text-muted">{app.role}</div>
        </div>
      </div>
    </td>
    <td>
      <div className="small fw-medium text-dark">{formatDisplayDate(app.date)}</div>
      <div className="extra-small text-muted">{app.start_time} - {app.end_time}</div>
    </td>
    <td><div className="text-truncate" style={{ maxWidth: "180px", fontSize: "0.85rem" }} title={app.purpose}>{app.purpose}</div></td>
    <td className="text-end pe-3 position-relative">
      {app.status === "InProgress" ? <MeetingTimer startTime={app.actual_start_time} /> : (
        <div className="d-flex flex-column align-items-end">
          <span className={`badge status-${app.status.toLowerCase()} px-2 py-1 rounded-pill small fw-bold`}>{app.status}</span>
          {app.status === "Completed" && app.actual_duration_seconds > 0 && (
            <div className="extra-small text-muted mt-1">Dur: {Math.floor(app.actual_duration_seconds / 60)}m {app.actual_duration_seconds % 60}s</div>
          )}
        </div>
      )}
      <div className="d-inline-block ms-2 position-relative">
        <button className="btn btn-link link-dark p-0" onClick={(e) => toggleMenu(e, app.id)}><MoreHorizontal size={18} /></button>
        {activeMenu === app.id && (
          <div className="position-absolute end-0 bg-white shadow-lg border rounded-3 py-2 dropdown-menu-up" style={{ width: "180px", bottom: "100%", right: "0", marginBottom: "8px", zIndex: 1050 }} onClick={(e) => e.stopPropagation()}>
            {app.status === "Active" && <button className="dropdown-item py-2 d-flex align-items-center" onClick={(e) => onAction(e, app.id, "start")}><Clock size={16} className="me-2 ms-2 text-primary" /> Start Meeting</button>}
            {app.status === "InProgress" && <button className="dropdown-item py-2 d-flex align-items-center" onClick={(e) => onAction(e, app.id, "complete")}><CheckCircle size={16} className="me-2 ms-2 text-success" /> End Meeting</button>}
            {app.status === "Active" && (
              <>
                <button className="dropdown-item py-2 d-flex align-items-center" onClick={(e) => onAction(e, app.id, "Completed")}><Check size={16} className="me-2 ms-2 text-success" /> Mark Completed</button>
                <button className="dropdown-item py-2 d-flex align-items-center" onClick={(e) => onAction(e, app.id, "Cancelled")}><X size={16} className="me-2 ms-2 text-danger" /> Cancel</button>
              </>
            )}
            <div className="dropdown-divider"></div>
            <button className="dropdown-item py-2 d-flex align-items-center text-danger" onClick={(e) => onAction(e, app.id, "delete")}><Trash2 size={16} className="me-2 ms-2" /> Delete</button>
          </div>
        )}
      </div>
    </td>
  </tr>
));

const AdminDashboard = () => {
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, cancelled: 0 });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [insights, setInsights] = useState({ staffParticipation: 0, portalTraffic: 0, trafficLevel: "Low Demand", systemTip: "Syncing status..." });
  const [activeMenu, setActiveMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = useCallback(async (isInitial = true) => {
    if (isInitial) setLoading(true);
    try {
      const [appointments, statistics, insightsData] = await Promise.all([
        getAppointments(),
        getAppointmentStats(),
        getStrategicInsights(),
      ]);
      if (Array.isArray(appointments)) setRecentAppointments(appointments.slice(0, 15));
      if (statistics) setStats({ total: statistics.total || 0, active: statistics.active || 0, completed: statistics.completed || 0, cancelled: statistics.cancelled || 0 });
      if (insightsData) setInsights(insightsData);
    } catch (e) {
      console.error("Dashboard Sync Error:", e);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  // Lightweight sync: only refreshes stats + insights. Does NOT overwrite the appointments list.
  // This is safe to call right after an action since it won't revert the optimistic UI.
  const syncStats = useCallback(async () => {
    try {
      const [statistics, insightsData] = await Promise.all([
        getAppointmentStats(),
        getStrategicInsights(),
      ]);
      if (statistics) setStats({ total: statistics.total || 0, active: statistics.active || 0, completed: statistics.completed || 0, cancelled: statistics.cancelled || 0 });
      if (insightsData) setInsights(insightsData);
    } catch (e) {
      console.error("Stats sync error:", e);
    }
  }, []);

  useEffect(() => {
    fetchData(true);
    const hide = () => setActiveMenu(null);
    window.addEventListener("click", hide);
    return () => window.removeEventListener("click", hide);
  }, [fetchData]);

  const handleAction = useCallback(async (e, id, action) => {
    e.stopPropagation();
    setActiveMenu(null);

    // Confirmation logic for destructive actions
    if (action === "delete") {
      toast.error("Permanently delete appointment?", {
        action: {
          label: "Delete",
          onClick: async () => {
            const rollback = { list: [...recentAppointments], stats: { ...stats } };
            const target = recentAppointments.find(a => a.id === id);

            // --- OPTIMISTIC UPDATE: remove from UI immediately ---
            setRecentAppointments(prev => prev.filter(app => app.id !== id));
            setStats(prev => ({
              ...prev,
              total: prev.total - 1,
              active: target?.status === "Active" ? prev.active - 1 : prev.active
            }));

            if (await deleteAppointment(id)) {
              toast.success("Deleted from database");
              syncStats(); // Only refresh stats, not the appointments list
            } else {
              setRecentAppointments(rollback.list);
              setStats(rollback.stats);
              toast.error("Server failure - Rolled back");
            }
          },
        },
      });
      return;
    }

    const rollback = { list: [...recentAppointments], stats: { ...stats } };
    const target = recentAppointments.find(a => a.id === id);
    if (!target) return;

    const newStatus = action === "start" ? "InProgress" : action === "complete" ? "Completed" : action;

    // --- OPTIMISTIC UI SYNC (<100ms) — happens BEFORE the API call ---
    setRecentAppointments(prev => prev.map(a => a.id === id ? {
      ...a,
      status: newStatus,
      actual_start_time: action === "start" ? new Date().toISOString() : a.actual_start_time,
    } : a));
    setStats(prev => {
      const copy = { ...prev };
      if (target.status === "Active") copy.active--;
      if (newStatus === "Completed") copy.completed++;
      if (newStatus === "Cancelled") copy.cancelled++;
      return copy;
    });

    try {
      let result;
      if (action === "start") result = await startMeeting(id);
      else if (action === "complete") result = await completeMeeting(id);
      else result = { success: await updateAppointmentStatus(id, action) };

      if (!result.success) throw new Error();
      toast.success(action === "start" ? "Meeting started" : action === "complete" ? "Meeting ended" : `Marked as ${action}`);
      // Refresh only stats + insights, NOT appointments list (that would overwrite our optimistic state)
      syncStats();
    } catch {
      // Rollback on failure
      setRecentAppointments(rollback.list);
      setStats(rollback.stats);
      toast.error(`Rollback: ${action} failed`);
    }
  }, [recentAppointments, stats, syncStats]);

  const toggleMenu = useCallback((e, id) => {
    e.stopPropagation();
    setActiveMenu(prev => (prev === id ? null : id));
  }, []);

  const filteredApps = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return recentAppointments.filter(a => a.username.toLowerCase().includes(term) || a.purpose.toLowerCase().includes(term));
  }, [recentAppointments, searchTerm]);

  if (loading && recentAppointments.length === 0) {
    return (
      <div className="container-fluid px-4 py-5 d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 fade-in">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <h4 className="fw-extrabold mb-1">Office Administration</h4>
          <p className="text-muted fs-6 mb-0">System Overview & Resource Management</p>
        </div>
      </div>

      <div className="row g-4 mb-5">
        <StatCard title="Total Sessions" value={stats.total} icon={Calendar} trendValue="+12%" />
        <StatCard title="Pending Active" value={stats.active} icon={Clock} color="#0d6efd" subInfo="Average 15m per session" />
        <StatCard title="Fulfilled" value={stats.completed} icon={CheckCircle} color="#2e7d32" trendValue="94% completion" />
        <StatCard title="Cancelled" value={stats.cancelled} icon={AlertCircle} color="#c62828" subInfo="Most common: Conflict" />
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 p-4 pb-0 d-flex justify-content-between align-items-center">
              <h5 className="fw-extrabold mb-0">Live Activity Feed</h5>
              <div className="input-group input-group-sm" style={{ maxWidth: "200px" }}>
                <span className="input-group-text bg-light border-0"><Search size={14} /></span>
                <input type="text" className="form-control bg-light border-0" placeholder="Filter activity..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
                    {filteredApps.length > 0 ? (
                      filteredApps.map((app) => (
                        <ActivityRow key={app.id} app={app} onAction={handleAction} toggleMenu={toggleMenu} activeMenu={activeMenu} />
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center py-5 text-muted">
                          <AlertCircle size={32} className="mb-2 opacity-25" />
                          <p className="mb-0">No matching appointments found.</p>
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
          <div className="card border-0 shadow-sm h-100 bg-primary-navy text-white">
            <div className="card-body p-4">
              <h5 className="fw-extrabold text-white mb-4">Strategic Insights</h5>
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2"><span className="small opacity-75">Portal Traffic</span><span className="small fw-bold">{insights.trafficLevel}</span></div>
                <div className="progress bg-white bg-opacity-10" style={{ height: "8px" }}><div className="progress-bar bg-white rounded-pill" style={{ width: `${insights.portalTraffic}%` }}></div></div>
              </div>
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2"><span className="small opacity-75">Staff Participation</span><span className="small fw-bold">{insights.staffParticipation}%</span></div>
                <div className="progress bg-white bg-opacity-10" style={{ height: "8px" }}><div className="progress-bar bg-info rounded-pill" style={{ width: `${insights.staffParticipation}%` }}></div></div>
              </div>
              <div className="mt-5 p-3 rounded-4 bg-white bg-opacity-10 border border-white border-opacity-10">
                <h6 className="fw-bold mb-2 d-flex align-items-center text-info"><TrendingUp size={16} className="me-2" /> System Tip</h6>
                <p className="extra-small mb-0 opacity-75">{insights.systemTip}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
