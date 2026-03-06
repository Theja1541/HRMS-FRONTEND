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
import useCountUp from "../../hooks/useCountUp";
import "../../styles/employeeDashboard.css";
import {
  BarChart3,
  IndianRupee,
  FileText,
  Bell
} from "lucide-react";

export default function EmployeeDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
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

  // ✅ Always call hooks unconditionally
  const animatedAttendance = useCountUp(data?.attendance_percentage || 0);
  const animatedSalary = useCountUp(data?.salary_this_month || 0);
  const animatedPending = useCountUp(data?.pending_leaves || 0);
  const animatedNotifications = useCountUp(data?.notifications_unread || 0);

  if (loading) {
    return <p style={{ padding: 20 }}>Loading dashboard...</p>;
  }

  if (!data) return null;

  return (
    <div className="employee-dashboard">
      <h2>Employee Dashboard</h2>

      {/* Top Stats */}
      <div className="dashboard-cards">

        <div className="dashboard-card">
          <div className="card-icon blue">
            <BarChart3 size={22} />
          </div>

          <div className="card-content">
            <h4>Attendance</h4>
            <p>{animatedAttendance}%</p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon green">
            <IndianRupee size={22} />
          </div>

          <div className="card-content">
            <h4>Salary This Month</h4>
            <p>₹ {animatedSalary}</p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon orange">
            <FileText size={22} />
          </div>

          <div className="card-content">
            <h4>Pending Leaves</h4>
            <p>{animatedPending}</p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon purple">
            <Bell size={22} />
          </div>

          <div className="card-content">
            <h4>Unread Notifications</h4>
            <p>{animatedNotifications}</p>
          </div>
        </div>

      </div>

      {/* Leave Summary Section */}
      <div className="leave-summary-section">
        <h3>Leave Summary</h3>

        <div className="dashboard-cards small">
          <div className="dashboard-card">
            <span>Total</span>
            <strong>{data.leave_summary.total}</strong>
          </div>

          <div className="dashboard-card pending">
            <span>Pending</span>
            <strong>{data.leave_summary.pending}</strong>
          </div>

          <div className="dashboard-card approved">
            <span>Approved</span>
            <strong>{data.leave_summary.approved}</strong>
          </div>

          <div className="dashboard-card rejected">
            <span>Rejected</span>
            <strong>{data.leave_summary.rejected}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}