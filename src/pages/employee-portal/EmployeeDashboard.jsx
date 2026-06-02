import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import CountUp from "react-countup";
import { FaBell, FaCalendarCheck, FaCalendarDay } from "react-icons/fa";
import { useAuth } from "../../auth/AuthContext.jsx";
import { getMyNotifications, markNotificationRead } from "../../api/notifications";
import "../../styles/employeeDashboard.css";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const userName = user?.username?.split("@")[0] || "Employee";

  // State Management
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // Leave Balances
  const [leaveBalances, setLeaveBalances] = useState([]);

  // 1. Digital Clock Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Initial Data Loading
  useEffect(() => {
    fetchDashboard();
    fetchNotifications();
    fetchLeaveBalances();
  }, []);

  // API Call: Fetch KPI & Leave Summary
  const fetchDashboard = async () => {
    try {
      const res = await api.get("/employees/dashboard/");
      setData(res.data);
    } catch {
      toast.error("Failed to load dashboard metrics.");
    } finally {
      setLoading(false);
    }
  };

  // API Call: Fetch Notifications List
  const fetchNotifications = async () => {
    try {
      const res = await getMyNotifications();
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unread_count || 0);
    } catch (err) {
      console.log("Notification fetch error", err);
    }
  };

  // API Call: Mark single notification read
  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await markNotificationRead(id);
      toast.success("Notification read");
      await fetchNotifications();
      await fetchDashboard();
    } catch (err) {
      console.error("Failed to mark notification read", err);
    }
  };

  // API Call: Fetch Leave Balances list
  const fetchLeaveBalances = async () => {
    try {
      const res = await api.get("/leaves/my-balance/");
      setLeaveBalances(res.data || []);
    } catch (err) {
      console.error("Failed to load leave balances", err);
    }
  };

  // Helper formatting functions
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

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getProgressBarColor = (index) => {
    const colors = ["blue", "green", "purple", "orange", "rose"];
    return colors[index % colors.length];
  };

  if (loading) {
    return <p className="loading-text" style={{ padding: 30, fontSize: 16 }}>Loading your workspace...</p>;
  }

  if (!data) return null;

  return (
    <div className="dashboard-page">
      {/* Hero Section */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <div>
            <h2>
              👨💻 {getGreeting()}, {userName}
            </h2>
            <p>Your personal workspace & insights</p>
          </div>

          <div className="hero-right">
            {/* Notification Bell */}
            <div className="notification-wrapper">
              <div
                className="notification-bell"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <FaBell style={{ color: "#ffffff", opacity: 0.9 }} />
                {unreadCount > 0 && (
                  <span className="notification-badge">
                    {unreadCount}
                  </span>
                )}
              </div>

              {showNotifications && (
                <div className="notification-dropdown">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 8, marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: "#ffffff" }}>Recent Messages</span>
                    {unreadCount > 0 && <span style={{ fontSize: 11, background: "#ef4444", padding: "1px 6px", borderRadius: 4, color: "white" }}>{unreadCount} New</span>}
                  </div>
                  {notifications.length === 0 ? (
                    <div className="notification-empty">
                      No notifications
                    </div>
                  ) : (
                    <div style={{ maxHeight: 240, overflowY: "auto" }}>
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`notification-item ${n.is_read ? "" : "unread"}`}
                          style={{
                            borderBottom: "1px solid rgba(255,255,255,0.03)",
                            padding: "8px 6px",
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                            position: "relative"
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                            <strong style={{ fontSize: 12.5, color: n.is_read ? "#94a3b8" : "#f8fafc" }}>{n.title}</strong>
                            {!n.is_read && (
                              <button
                                onClick={(e) => handleMarkAsRead(n.id, e)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#38bdf8",
                                  fontSize: 10,
                                  cursor: "pointer",
                                  padding: 0
                                }}
                              >
                                Mark Read
                              </button>
                            )}
                          </div>
                          <p style={{ margin: 0, fontSize: 11.5, color: "#cbd5e1", lineHeight: 1.4 }}>{n.message}</p>
                          <span className="notification-time" style={{ fontSize: 10, color: "#64748b", marginTop: 4 }}>
                            {new Date(n.created_at).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
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

      {/* KPI Cards */}
      <div className="dashboard-kpis">
        <div className="kpi-card blue">
          <h3>
            <CountUp end={data.attendance_percentage || 0} decimals={2} duration={1.5} />%
          </h3>
          <span>Attendance Rate</span>
        </div>

        <div className="kpi-card green">
          <h3>
            ₹ <CountUp end={data.salary_this_month || 0} duration={1.5} separator="," />
          </h3>
          <span>Salary This Month</span>
        </div>

        <div className="kpi-card orange">
          <h3>
            <CountUp end={data.pending_leaves || 0} duration={1.5} />
          </h3>
          <span>Pending Leaves</span>
        </div>

        <div className="kpi-card purple">
          <h3>
            <CountUp end={data.notifications_unread || 0} duration={1.5} />
          </h3>
          <span>Unread Notifications</span>
        </div>
      </div>

      {/* Main Content Dashboard Grid */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: "1.2fr 1fr" }}>
        
        {/* Left Column: Detailed Leave Balances Visual Bars */}
        <div className="leave-balances-card">
          <h3 style={{ fontSize: 17, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid #f1f5f9", paddingBottom: 12, marginBottom: 18, margin: 0 }}>
            <FaCalendarDay style={{ color: "#10b981" }} /> Active Leave Balances
          </h3>

          {leaveBalances.length === 0 ? (
            <div className="leave-balance-empty">
              No leave allocations configured for this year.
            </div>
          ) : (
            <div className="leave-balances-list">
              {leaveBalances.map((item, index) => {
                const total = Number(item.total_allocated || 0);
                const remaining = Number(item.remaining || 0);
                const used = Number(item.used || 0);
                const fillPercent = total > 0 ? (remaining / total) * 100 : 0;
                const barColor = getProgressBarColor(index);

                return (
                  <div key={item.id} className="leave-balance-item">
                    <div className="leave-balance-info">
                      <span className="leave-type-name">{item.leave_type_name}</span>
                      <span className="leave-type-ratio">
                        <strong>{remaining}</strong> / {total} Days Left
                      </span>
                    </div>
                    <div className="leave-progress-bar-bg">
                      <div
                        className={`leave-progress-bar-fill ${barColor}`}
                        style={{ width: `${Math.min(fillPercent, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Leave Summary breakdown totals */}
        <div className="dashboard-card">
          <h3 style={{ fontSize: 17, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid #f1f5f9", paddingBottom: 12, marginBottom: 18, margin: 0 }}>
            <FaCalendarCheck style={{ color: "#8b5cf6" }} /> Leave Request Aggregate
          </h3>
          <div className="leave-stats">
            <div>
              <strong style={{ color: "#3b82f6" }}>
                <CountUp end={data.leave_summary.total} duration={1.2} />
              </strong>
              <span>Total Applications</span>
            </div>
            <div>
              <strong style={{ color: "#f59e0b" }}>{data.leave_summary.pending}</strong>
              <span>Pending Approvals</span>
            </div>
            <div>
              <strong style={{ color: "#10b981" }}>{data.leave_summary.approved}</strong>
              <span>Approved</span>
            </div>
            <div>
              <strong style={{ color: "#f43f5e" }}>{data.leave_summary.rejected}</strong>
              <span>Rejected</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}