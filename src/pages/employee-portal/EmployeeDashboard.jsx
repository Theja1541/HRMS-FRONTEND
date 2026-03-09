// import { useEffect, useState } from "react";
// import api from "../../api/axios";
// import AttendanceRing from "../../components/common/AttendanceRing";
// import "../../styles/employeeDashboard.css";

// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   CartesianGrid
// } from "recharts";

// export default function EmployeeDashboard() {

//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const loadDashboard = async () => {
//       try {
//         const res = await api.get("/employees/dashboard-summary/");
//         setData(res.data);
//       } catch (err) {
//         console.error("Dashboard load failed", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadDashboard();
//   }, []);

//   if (loading) {
//     return <p className="loading-text">Loading dashboard...</p>;
//   }

//   const { profile, attendance, leave, payroll,
//           attendance_trend, salary_trend,
//           notifications } = data;

//   return (
//   <div className="employee-dashboard-page">

//     {/* ================= HERO ================= */}
//     <div className="employee-hero">
//       <div className="employee-hero-content hero-content">
//         <div>
//           <h2>
//             Welcome, {data.profile.name}
//           </h2>
//           <p>
//             {data.profile.designation} • {data.profile.department}
//           </p>
//         </div>

//         <div className="hero-clock">
//           <div className="clock-time">
//             {new Date().toLocaleTimeString()}
//           </div>
//           <div className="clock-date">
//             {new Date().toLocaleDateString("en-IN", {
//               weekday: "long",
//               day: "numeric",
//               month: "long",
//               year: "numeric"
//             })}
//           </div>
//         </div>
//       </div>
//     </div>

//     {/* ================= KPI CARDS ================= */}
//     <div className="employee-kpis">

//       <div className="employee-kpi-card blue">
//         <h3>{data.attendance.attendance_percentage}%</h3>
//         <span>Attendance %</span>
//       </div>

//       <div className="employee-kpi-card green">
//         <h3>{data.attendance.present}</h3>
//         <span>Present Days</span>
//       </div>

//       <div className="employee-kpi-card orange">
//         <h3>{data.leave.total_balance}</h3>
//         <span>Leave Balance</span>
//       </div>

//       <div className="employee-kpi-card purple">
//         <h3>
//           ₹ {data.payroll?.net_salary ?? 0}
//         </h3>
//         <span>Last Salary</span>
//       </div>

//     </div>

//     {/* ================= MAIN GRID ================= */}
//     <div className="employee-dashboard-grid">

//       <div className="employee-dashboard-card">
//   <h4>Attendance Performance</h4>
//   <AttendanceRing
//     percentage={data.attendance.attendance_percentage}
//   />
// </div>

//       <div className="employee-dashboard-card">
//         <h4>Recent Notifications</h4>

//         {data.notifications.length === 0 && (
//           <p className="muted">No notifications</p>
//         )}

//         <ul className="recent-list">
//           {data.notifications.map((n, i) => (
//             <li key={i}>
//               <strong>{n.title}</strong>
//               <br />
//               <span className="muted">{n.message}</span>
//             </li>
//           ))}
//         </ul>
//       </div>

//     </div>

//   </div>
//   );
// }



import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import CountUp from "react-countup";
import { FaBell } from "react-icons/fa";
import { useAuth } from "../../auth/AuthContext.jsx";
import { getMyNotifications } from "../../api/notifications";
import "../../styles/employeeDashboard.css";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const userName = user?.username?.split("@")[0] || "Employee";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchDashboard();
    fetchNotifications();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/employees/dashboard/");
      setData(res.data);
    } catch {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await getMyNotifications();
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unread_count || 0);
    } catch (err) {
      console.log("Notification fetch error");
    }
  };

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

  if (loading) {
    return <p style={{ padding: 20 }}>Loading dashboard...</p>;
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

      {/* KPI Cards */}
      <div className="dashboard-kpis">
        <div className="kpi-card blue">
          <h3><CountUp end={data.attendance_percentage || 0} duration={1.5} />%</h3>
          <span>Attendance</span>
        </div>

        <div className="kpi-card green">
          <h3>₹ <CountUp end={data.salary_this_month || 0} duration={1.5} /></h3>
          <span>Salary This Month</span>
        </div>

        <div className="kpi-card orange">
          <h3><CountUp end={data.pending_leaves || 0} duration={1.5} /></h3>
          <span>Pending Leaves</span>
        </div>

        <div className="kpi-card purple">
          <h3><CountUp end={data.notifications_unread || 0} duration={1.5} /></h3>
          <span>Unread Notifications</span>
        </div>
      </div>

      {/* Leave Summary */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Leave Summary</h3>
          <div className="leave-stats">
            <div>
              <strong><CountUp end={data.leave_summary.total} duration={1.2} /></strong>
              <span>Total</span>
            </div>
            <div>
              <strong>{data.leave_summary.pending}</strong>
              <span>Pending</span>
            </div>
            <div>
              <strong>{data.leave_summary.approved}</strong>
              <span>Approved</span>
            </div>
            <div>
              <strong>{data.leave_summary.rejected}</strong>
              <span>Rejected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}