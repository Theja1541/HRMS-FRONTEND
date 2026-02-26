import { useEffect, useState } from "react";
import api from "../../api/axios";
import "../../styles/employeeDashboard.css";

export default function EmployeeDashboard() {

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/employees/dashboard-summary/");
        setData(res.data);
      } catch (err) {
        console.error("Dashboard load failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <p className="loading-text">Loading dashboard...</p>;
  }

  if (!data) return null;

  const { profile, attendance, leave, payroll, notifications } = data;

  return (
    <div className="dashboard-container">

      {/* ================= PROFILE CARD ================= */}
      <div className="dashboard-header">
        <div className="profile-left">
          <img
            src={`http://127.0.0.1:8000${profile.profile_photo}`}
            alt="Profile"
            className="profile-photo"
          />
          <div>
            <h2>{profile.name}</h2>
            <p>{profile.designation} • {profile.department}</p>
            <p>ID: {profile.employee_id}</p>
            <p>Joined: {profile.joining_date}</p>
            <p>Reporting: {profile.reporting_manager}</p>
          </div>
        </div>
      </div>

      {/* ================= SUMMARY CARDS ================= */}
      <div className="dashboard-row">

        {/* Attendance */}
        <div className="card kpi-card">
          <h4>Attendance (This Month)</h4>

          <div className="kpi-row">
            <div className="kpi-badge success">
              <span>Present</span>
              <strong>{attendance.present}</strong>
            </div>

            <div className="kpi-badge danger">
              <span>Absent</span>
              <strong>{attendance.absent}</strong>
            </div>

            <div className="kpi-badge warning">
              <span>Leave</span>
              <strong>{attendance.leave}</strong>
            </div>
          </div>

          <div className="kpi-status">
            <span className="status-pill">{attendance.today_status}</span>
          </div>
        </div>

        {/* Leave */}
        <div className="card">
          <h4>Leave Summary</h4>
          <p>Total Balance: {leave.total_balance}</p>
          <p>Pending Requests: {leave.pending_requests}</p>
        </div>

        {/* Payroll */}
        <div className="card kpi-card">
        <h4>Payroll Summary</h4>

        {payroll ? (
          <div className="kpi-row">
            <div className="kpi-badge primary">
              <span>Net Salary</span>
              <strong>₹ {payroll.net_salary}</strong>
            </div>

            <div className={`kpi-badge ${payroll.status === "Processed" ? "success" : "warning"}`}>
              <span>Status</span>
              <strong>{payroll.status}</strong>
            </div>
          </div>
        ) : (
          <p>No payslip processed yet</p>
        )}
      </div>

      {/* ================= NOTIFICATIONS ================= */}
      <div className="card">
        <h4>Notifications</h4>

        {notifications.length === 0 ? (
          <p>No notifications</p>
        ) : (
          notifications.map((n, index) => (
            <div key={index} className="notification-item">
              <strong>{n.title}</strong>
              <p>{n.message}</p>
              <small>{new Date(n.created_at).toLocaleString()}</small>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
  );
}
