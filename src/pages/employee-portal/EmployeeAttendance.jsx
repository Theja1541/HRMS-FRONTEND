import { useEffect, useState } from "react";
import api from "../../api/axios";
import AttendanceRing from "../../components/common/AttendanceRing";
import "../../styles/employeeAttendance.css";

export default function EmployeeAttendance() {

  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [month, setMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const today = new Date().toISOString().slice(0, 10);

  // ================= FETCH DATA =================

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get(
          "/attendance/my-attendance/",
          { params: { month } }
        );

        setRecords(res.data.records || []);
        setSummary(res.data.summary || null);

      } catch (err) {
        console.error("Failed to load attendance", err);
        setError("Failed to load attendance data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [month]);

  // ================= TODAY STATUS =================

  const todayRecord = records.find(
    (r) => r.date === today
  );

  const todayStatus = todayRecord
    ? todayRecord.status
    : "Not Marked";

  // ================= ATTENDANCE LEVEL =================

  const attendancePercent =
    summary?.attendance_percentage || 0;

  const getAttendanceLevel = () => {
    if (attendancePercent >= 85) return "excellent";
    if (attendancePercent >= 60) return "warning";
    return "critical";
  };

  const attendanceLevel = getAttendanceLevel();

  const getPerformanceLabel = () => {
    if (attendancePercent >= 85) return "Excellent Attendance";
    if (attendancePercent >= 60) return "Needs Improvement";
    return "Critical Attendance";
  };

  const performanceLabel = getPerformanceLabel();

  if (loading) {
    return <p className="loading-text">Loading attendance...</p>;
  }

  if (error) {
    return <p className="error-text">{error}</p>;
  }

  const handleExport = async () => {
  try {
    const response = await api.get(
      "/attendance/export-my-attendance/",
      {
        params: { month },
        responseType: "blob",
      }
    );

    const url = window.URL.createObjectURL(
      new Blob([response.data])
    );

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Attendance_${month}.xlsx`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("Export failed", error);
  }
};

  return (
    <div className="employee-attendance-page">

      {/* HEADER */}
      <div className="employee-attendance-header">
  <div>
    <h2>My Attendance</h2>
    <p>{new Date().toLocaleDateString()}</p>
  </div>

  <button className="export-btn" onClick={handleExport}> Export to Excel </button>

        {/* Month Selector */}
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="month-picker"
        />
      </div>

      {/* TOP GRID */}
      <div className="attendance-top-grid">

        {/* ATTENDANCE RING */}
        <div className={`attendance-ring-card gradient-border ${attendanceLevel}`}>
          <h3>Attendance %</h3>

          <AttendanceRing percentage={attendancePercent} />

          <p className="performance-label">
            {performanceLabel}
          </p>
        </div>

        {/* SUMMARY CARDS */}
        <div className="attendance-summary">

          <div className="summary-card present">
            <h3>{summary?.present || 0}</h3>
            <span>Present</span>
          </div>

          <div className="summary-card halfday">
            <h3>{summary?.half_day || 0}</h3>
            <span>Half Day</span>
          </div>

          <div className="summary-card leave">
            <h3>{summary?.paid_leave || 0}</h3>
            <span>Paid Leave</span>
          </div>

          <div className="summary-card unpaid">
            <h3>{summary?.unpaid_leave || 0}</h3>
            <span>Unpaid Leave</span>
          </div>

          <div className="summary-card absent">
            <h3>{summary?.absent || 0}</h3>
            <span>Absent</span>
          </div>

        </div>

      </div>

      {/* TODAY STATUS */}
      <div className="attendance-status-card">
        <h3>Today's Status</h3>

        <div className={`status-pill ${todayStatus.toLowerCase().replace(/\s+/g, '-')}`}>
          {todayStatus}
        </div>
      </div>

    </div>
  );
}