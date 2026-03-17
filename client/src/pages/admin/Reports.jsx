import React, { useState, useEffect } from "react";
import {
  FileText,
  Download,
  PieChart,
  BarChart2,
  TrendingUp,
  Users,
  Search,
  Filter,
  Calendar,
  Table as TableIcon,
} from "lucide-react";
import {
  getAppointments,
  getReportData,
} from "../../services/appointmentService";
import * as XLSX from "xlsx";

const Reports = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: "All",
  });
  const [summary, setSummary] = useState({
    staff: 0,
    completionRate: 0,
    cancellationRate: 0,
  });

  const fetchData = async (currentFilters = null) => {
    setLoading(true);
    try {
      const data = currentFilters
        ? await getReportData(currentFilters)
        : await getAppointments();

      if (Array.isArray(data)) {
        setAppointments(data);

        const total = data.length;
        if (total > 0) {
          setSummary({
            staff: data.filter((a) => a.role === "Staff").length,
            completionRate: Math.round(
              (data.filter((a) => a.status === "Completed").length / total) *
              100,
            ),
            cancellationRate: Math.round(
              (data.filter((a) => a.status === "Cancelled").length / total) *
              100,
            ),
          });
        } else {
          setSummary({ staff: 0, completionRate: 0, cancellationRate: 0 });
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    fetchData(filters);
  };

  const handleResetFilters = () => {
    const resetFilters = { startDate: "", endDate: "", status: "All" };
    setFilters(resetFilters);
    fetchData();
  };

  const handleExportExcel = () => {
    if (appointments.length === 0) return;

    // Prepare data for Excel
    const exportData = appointments.map((app) => ({
      Date: app.date,
      Time: app.start_time,
      Name: app.username,
      Role: app.role,
      Purpose: app.purpose,
      Status: app.status,
      "Duration (Min)": app.duration_minutes,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Appointments Report");

    // Column widths
    const wscols = [
      { wch: 15 }, // Date
      { wch: 10 }, // Time
      { wch: 25 }, // Name
      { wch: 12 }, // Role
      { wch: 35 }, // Purpose
      { wch: 15 }, // Status
      { wch: 15 }, // Duration
    ];
    worksheet["!cols"] = wscols;

    // Download
    XLSX.writeFile(
      workbook,
      `PAS_Report_${filters.startDate || "all"}_to_${filters.endDate || "all"}.xlsx`,
    );
  };

  return (
    <div className="container-fluid px-4 fade-in pb-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <h4 className="fw-extrabold mb-1 text-primary-navy">
            Intelligence & Analytics
          </h4>
          <p className="text-muted fs-6 mb-0">
            Audit logs and performance metrics for the Principal's schedule.
          </p>
        </div>
        <div className="mt-4 mt-md-0">
          <button
            className="btn btn-primary-navy rounded-pill px-4 py-3 fw-semibold d-flex align-items-center shadow-sm"
            onClick={handleExportExcel}
            disabled={appointments.length === 0}
          >
            <Download size={18} className="me-2" /> Export to Excel
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="extra-small fw-bold text-uppercase tracking-widest text-muted mb-2 d-block">
                From Date
              </label>
              <input
                type="date"
                name="startDate"
                className="form-control bg-light border-0 shadow-none px-3 py-2"
                value={filters.startDate}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-3">
              <label className="extra-small fw-bold text-uppercase tracking-widest text-muted mb-2 d-block">
                To Date
              </label>
              <input
                type="date"
                name="endDate"
                className="form-control bg-light border-0 shadow-none px-3 py-2"
                value={filters.endDate}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-3">
              <label className="extra-small fw-bold text-uppercase tracking-widest text-muted mb-2 d-block">
                Status
              </label>
              <select
                name="status"
                className="form-select bg-light border-0 shadow-none px-3 py-2"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="col-md-3 d-flex gap-2">
              <button
                className="btn btn-primary-navy px-4 py-2 rounded-pill flex-grow-1"
                onClick={handleApplyFilters}
              >
                <Search size={16} className="me-2" /> Search
              </button>
              <button
                className="btn btn-light px-4 py-2 rounded-pill border"
                onClick={handleResetFilters}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4 p-md-5">
              <h5 className="fw-extrabold mb-5 d-flex align-items-center text-primary-navy">
                <Users size={20} className="me-3 text-primary-navy" /> Role
                Context
              </h5>
              <div className="d-flex align-items-center justify-content-center py-4">
                <div className="text-center px-4">
                  <h4
                    className="fw-semibold text-primary-navy mb-0"
                    style={{ fontSize: "4rem" }}
                  >
                    {summary.staff}
                  </h4>
                  <p className="text-muted small fw-bold text-uppercase tracking-widest mt-2">
                    Filter Result (Staff)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4 p-md-5">
              <h5 className="fw-extrabold mb-5 d-flex align-items-center text-success">
                <BarChart2 size={22} className="me-3" /> Result Performance
              </h5>

              <div className="mb-5">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <span className="fw-bold d-block">Session Fulfillment</span>
                    <span className="extra-small text-muted text-uppercase tracking-widest">
                      Completed in results
                    </span>
                  </div>
                  <h3 className="fw-extrabold mb-0 text-success">
                    {summary.completionRate}%
                  </h3>
                </div>
                <div
                  className="progress bg-light"
                  style={{ height: "12px", borderRadius: "10px" }}
                >
                  <div
                    className="progress-bar bg-success rounded-pill shadow-sm"
                    role="progressbar"
                    style={{ width: `${summary.completionRate}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <span className="fw-bold d-block">Cancellation Rate</span>
                    <span className="extra-small text-muted text-uppercase tracking-widest">
                      Cancelled in results
                    </span>
                  </div>
                  <h3 className="fw-extrabold mb-0 text-danger">
                    {summary.cancellationRate}%
                  </h3>
                </div>
                <div
                  className="progress bg-light"
                  style={{ height: "12px", borderRadius: "10px" }}
                >
                  <div
                    className="progress-bar bg-danger rounded-pill shadow-sm"
                    role="progressbar"
                    style={{ width: `${summary.cancellationRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm overflow-hidden mb-5">
        <div className="card-header bg-white p-4 p-md-5 border-0 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <h4 className="fw-extrabold mb-0">Detailed Transaction Ledger</h4>
          <span className="badge bg-light text-muted border px-3 py-2 rounded-pill fw-medium">
            Showing {appointments.length} entries
          </span>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 custom-table">
            <thead className="bg-light">
              <tr className="extra-small text-muted text-uppercase tracking-widest fw-bold">
                <th className="border-0 ps-5 py-3">Scheduled Period</th>
                <th className="border-0">User Identity</th>
                <th className="border-0">Role Context</th>
                <th className="border-0">Objective Log</th>
                <th className="border-0 text-end pe-5">Status</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    <div
                      className="spinner-border text-primary-navy"
                      role="status"
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : appointments.length > 0 ? (
                appointments.map((app) => (
                  <tr key={app.id} className="border-bottom-0">
                    <td className="ps-5 py-4">
                      <div className="fw-bold d-flex align-items-center">
                        <Calendar
                          size={14}
                          className="me-2 text-primary-navy opacity-50"
                        />
                        {(() => {
                          const date = new Date(app.date);
                          const day = String(date.getDate()).padStart(2, "0");
                          const month = String(date.getMonth() + 1).padStart(
                            2,
                            "0",
                          );
                          const year = date.getFullYear();
                          return `${day}-${month}-${year}`;
                        })()}
                      </div>
                      <div className="extra-small text-muted mt-1 ps-4">
                        {app.start_time} - {app.end_time}
                      </div>
                    </td>
                    <td className="fw-bold text-dark">{app.username}</td>
                    <td>
                      <span
                        className="badge bg-light text-muted border px-3 py-2 rounded-pill fw-medium"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {app.role}
                      </span>
                    </td>
                    <td
                      className="text-muted"
                      style={{ maxWidth: "250px", fontSize: "0.85rem" }}
                    >
                      {app.purpose}
                    </td>
                    <td className="text-end pe-5">
                      <span
                        className={`badge status-${app.status.toLowerCase()} px-3 py-2 rounded-pill fw-extrabold`}
                        style={{ fontSize: "0.65rem", letterSpacing: "0.5px" }}
                      >
                        {app.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    <FileText size={48} className="mb-3 opacity-10" />
                    <p className="mb-0 fw-bold">
                      No ledger entries found for selected criteria.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="card-footer bg-white border-0 p-4 text-center border-top border-light">
          <p className="extra-small text-muted mb-0 fw-medium">
            End of System Audit Log &bull; Report Generated on{" "}
            {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Reports;
