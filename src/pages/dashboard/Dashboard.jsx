import { useEmployees } from "../../context/EmployeesContext";
import { useEffect, useState } from "react";
import { getPayrollDashboardSummary } from "../../api/payroll";
import { useAuth } from "../../auth/AuthContext.jsx";
import { getMyNotifications } from "../../api/notifications";
import CountUp from "react-countup";
import { FaBell } from "react-icons/fa";
import "../../styles/dashboard.css";

export default function Dashboard() {
  /* ===============================
     AUTH
  ================================ */
  const { user } = useAuth();
  const userName = user?.username?.split("@")[0] || "Admin";

  /* ===============================
     CLOCK
  ================================ */
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) =>
    date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  const formatDate = (date) =>
    date.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  /* ===============================
     GREETING
  ================================ */
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case "ADMIN":
        return "Admin";
      case "HR":
        return "HR";
      case "EMPLOYEE":
        return "Employee";
      default:
        return "";
    }
  };

  const getRoleEmoji = () => {
    switch (user?.role) {
      case "ADMIN":
        return "👑";
      case "HR":
        return "🧑‍💼";
      case "EMPLOYEE":
        return "👨‍💻";
      default:
        return "👋";
    }
  };

  /* ===============================
     NOTIFICATIONS (CONNECTED TO BACKEND)
  ================================ */
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await getMyNotifications();
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unread_count || 0);
      } catch (err) {
        console.log("Notification fetch error");
      }
    }

    fetchNotifications();
  }, []);

  /* ===============================
     PAYROLL SUMMARY
  ================================ */
  const [payrollSummary, setPayrollSummary] = useState(null);

  useEffect(() => {
    async function fetchPayroll() {
      try {
        const res = await getPayrollDashboardSummary();
        setPayrollSummary(res.data);
      } catch (err) {
        console.log("Payroll summary error");
      }
    }
    fetchPayroll();
  }, []);

  /* ===============================
     EMPLOYEE DATA
  ================================ */
  const { employees = [], leaves = [] } = useEmployees();

  const totalEmployees = employees.length;

  const activeEmployees = employees.filter(
    (e) => e.status !== "Inactive"
  ).length;

  const today = new Date().toISOString().slice(0, 10);

  const onLeaveToday = leaves.filter(
    (l) =>
      l.status === "Approved" &&
      today >= l.fromDate &&
      today <= l.toDate
  ).length;

  const pendingLeaves = leaves.filter(
    (l) => l.status === "Pending"
  ).length;

  const recentEmployees = [...employees]
    .slice(-5)
    .reverse();

  const getEmployeeName = (emp) => {
    if (emp.firstName || emp.lastName) {
      return `${emp.firstName || ""} ${emp.lastName || ""}`.trim();
    }
    return emp.email || emp.username || "Employee";
  };

  /* ===============================
     RENDER
  ================================ */
  return (
    <div className="dashboard-page">

      {/* ================= HERO ================= */}
      <div className="dashboard-hero">
        <div className="hero-content">

          <div>
            <h2>
              {getRoleEmoji()} {getGreeting()}, {getRoleLabel()} {userName}
            </h2>
            <p>Company overview & real-time insights</p>
          </div>

          <div className="hero-right">

            {/* 🔔 Notification Bell */}
            <div className="notification-wrapper">
              <div
                className="notification-bell"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <FaBell />
                {unreadCount > 0 && (
                  <span className="notification-badge">
                    {unreadCount}
                  </span>
                )}
              </div>

              {showNotifications && (
                <div className="notification-dropdown">
                  {notifications.length === 0 ? (
                    <div className="notification-empty">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`notification-item ${
                          n.is_read ? "" : "unread"
                        }`}
                      >
                        <strong>{n.title}</strong>
                        <p>{n.message}</p>
                        <span className="notification-time">
                          {new Date(n.created_at).toLocaleString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Clock */}
            <div className="hero-clock">
              <div className="clock-time">
                {formatTime(currentTime)}
              </div>
              <div className="clock-date">
                {formatDate(currentTime)}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ================= KPI CARDS ================= */}
      <div className="dashboard-kpis">
        <div className="kpi-card blue">
          <h3><CountUp end={totalEmployees} duration={1.5} /></h3>
          <span>Total Employees</span>
        </div>

        <div className="kpi-card green">
          <h3><CountUp end={activeEmployees} duration={1.5} /></h3>
          <span>Active Employees</span>
        </div>

        <div className="kpi-card orange">
          <h3><CountUp end={onLeaveToday} duration={1.5} /></h3>
          <span>On Leave Today</span>
        </div>

        <div className="kpi-card purple">
          <h3><CountUp end={pendingLeaves} duration={1.5} /></h3>
          <span>Pending Leave Requests</span>
        </div>
      </div>

      {/* ================= LOWER GRID ================= */}
      <div className="dashboard-grid">

        {/* Attendance Trend */}
        <div className="dashboard-card">
          <h3>Attendance Trend (Last 7 Days)</h3>
          <p className="muted">
            Attendance analytics will appear here
          </p>
        </div>

        {/* Payroll Summary */}
        <div className="dashboard-card payroll-widget">
          <h3>Payroll Summary</h3>

          {!payrollSummary ? (
            <p className="muted">Loading payroll data...</p>
          ) : (
            <div className="payroll-summary-content">
              <p className="payroll-month">
                {payrollSummary.month}
              </p>

              <div className={`payroll-status ${payrollSummary.status.toLowerCase()}`}>
                {payrollSummary.status}
              </div>

              <div className="payroll-stats">
                <div>
                  <strong><CountUp end={payrollSummary.total} duration={1.2} /></strong>
                  <span>Total</span>
                </div>
                <div>
                  <strong>{payrollSummary.draft}</strong>
                  <span>Draft</span>
                </div>
                <div>
                  <strong>{payrollSummary.approved}</strong>
                  <span>Approved</span>
                </div>
                <div>
                  <strong>{payrollSummary.paid}</strong>
                  <span>Paid</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Employees */}
        <div className="dashboard-card">
          <h3>Recently Added Employees</h3>

          {recentEmployees.length === 0 ? (
            <p className="muted">No employees added</p>
          ) : (
            <ul className="recent-list">
              {recentEmployees.map((emp) => (
                <li key={emp.id}>
                  {getEmployeeName(emp)}
                  {emp.status !== "Inactive" && (
                    <span className="status-active">
                      Active
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}