import { useEmployees } from "../../context/EmployeesContext";
import { useEffect, useState } from "react";
import { getPayrollDashboardSummary } from "../../api/payroll";
import { getLeaveRequests } from "../../api/leaves";
import { useAuth } from "../../auth/AuthContext.jsx";
import { getMyNotifications } from "../../api/notifications";
import CountUp from "react-countup";
import { FaBell } from "react-icons/fa";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from "recharts";
import { getAttendanceDashboardSummary, getDepartmentDistribution } from "../../api/attendance";
import { getUpcomingHolidays } from "../../api/holidays";
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
     DASHBOARD ANALYTICS DATA
  ================================ */
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [deptDistribution, setDeptDistribution] = useState([]);
  const [upcomingHoliday, setUpcomingHoliday] = useState(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const attRes = await getAttendanceDashboardSummary();
        setAttendanceSummary(attRes.data);
        
        const deptRes = await getDepartmentDistribution();
        setDeptDistribution(deptRes.data);

        const holRes = await getUpcomingHolidays();
        setUpcomingHoliday(holRes.data);
      } catch (err) {
        console.error("Error fetching dashboard analytics:", err);
      }
    }
    fetchDashboardData();
  }, []);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

  /* ===============================
     EMPLOYEE DATA
  ================================ */
  const { employees = [] } = useEmployees();
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [onLeaveToday, setOnLeaveToday] = useState(0);

  useEffect(() => {
    function normalizeList(res) {
      const data = res.data;
      if (!data) return [];
      return Array.isArray(data.results) ? data.results : (Array.isArray(data) ? data : []);
    }

    async function fetchPendingLeaves() {
      try {
        const res = await getLeaveRequests({ status: "PENDING" });
        const list = normalizeList(res);
        setPendingLeaves(list.length);
      } catch (err) {
        console.log("Failed to fetch pending leaves");
      }
    }

    async function fetchOnLeaveToday() {
      try {
        const res = await getLeaveRequests({ status: "APPROVED" });
        const list = normalizeList(res);
        const today = new Date().toISOString().split("T")[0];
        const todayLeaves = list.filter(
          (leave) => leave.start_date <= today && leave.end_date >= today
        );
        setOnLeaveToday(todayLeaves.length);
      } catch (err) {
        console.log("Failed to fetch on leave today");
      }
    }

    fetchPendingLeaves();
    fetchOnLeaveToday();
  }, []);

  const totalEmployees = employees.length;

  const activeEmployees = employees.filter(
    (e) => e.status !== "Inactive"
  ).length;

  const today = new Date().toISOString().slice(0, 10);

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
      
      {/* ================= ATTENDANCE ANALYTICS ================= */}
      <div className="dashboard-kpis" style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="kpi-card blue" onClick={() => window.location.href='/employees'} style={{ cursor: 'pointer' }}>
          <h3><CountUp end={activeEmployees || 0} duration={1.5} /></h3>
          <span>Total Employees</span>
        </div>
        <div className="kpi-card green" onClick={() => window.location.href='/attendance'} style={{ cursor: 'pointer' }}>
          <h3><CountUp end={attendanceSummary?.present_today || 0} duration={1.5} /></h3>
          <span>Present Today</span>
        </div>
        <div className="kpi-card orange" onClick={() => window.location.href='/attendance'} style={{ cursor: 'pointer' }}>
          <h3><CountUp end={attendanceSummary?.absent_today || 0} duration={1.5} /></h3>
          <span>Absent Today</span>
        </div>
        <div className="kpi-card" onClick={() => window.location.href='/attendance'} style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #020617, #0f172a)', color: 'white' }}>
          <h3><CountUp end={attendanceSummary?.attendance_percentage || 0} decimals={1} duration={1.5} suffix="%" /></h3>
          <span>Attendance Rate</span>
        </div>
      </div>

      {/* ================= LOWER GRID ================= */}
      <div className="dashboard-grid">

        {/* Attendance Trend */}
        <div className="dashboard-card" style={{ gridColumn: 'span 2' }}>
          <h3>Attendance Trend (Last 7 Days)</h3>
          {!attendanceSummary ? <p className="muted">Loading...</p> : (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={attendanceSummary.weekly_trend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="present" stroke="#10b981" strokeWidth={2} name="Present" />
                  <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} name="Absent" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Department Distribution */}
        <div className="dashboard-card">
          <h3>Employee Distribution (Dept)</h3>
          {deptDistribution.length === 0 ? <p className="muted">Loading...</p> : (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={deptDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {deptDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card">
          <h3>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => window.location.href='/employees/new'}>+ Add Employee</button>
            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => window.location.href='/payroll'}>Run Payroll</button>
            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => window.location.href='/leave-dashboard'}>Apply Leave</button>
            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => window.location.href='/attendance'}>Mark Attendance</button>
            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => window.location.href='/holidays'}>Add Holiday</button>
          </div>
        </div>

        {/* Payroll Summary */}
        <div className="dashboard-card payroll-widget">
          <h3>Payroll Overview</h3>
          {!payrollSummary ? (
            <p className="muted">Loading payroll data...</p>
          ) : (
            <div className="payroll-summary-content">
              <p className="payroll-month">{payrollSummary.month}</p>
              <div className={`payroll-status ${payrollSummary.status.toLowerCase()}`}>
                {payrollSummary.status}
              </div>
              <div style={{ width: '100%', height: 200, marginTop: '20px' }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={[
                      { name: 'Paid', value: payrollSummary.paid },
                      { name: 'Draft/Pending', value: payrollSummary.draft + payrollSummary.approved }
                    ]} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} label>
                      <Cell fill="#10b981" />
                      <Cell fill="#f59e0b" />
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Upcoming Holidays Widget */}
        <div className="dashboard-card">
          <h3>Upcoming Holidays</h3>
          <div className="holiday-widget">
             {!upcomingHoliday ? (
               <p className="muted" style={{marginBottom: '15px'}}>Loading holiday calendar data...</p>
             ) : upcomingHoliday.next_holiday ? (
               <div style={{ padding: '16px', background: '#f3f4f6', borderRadius: '8px', borderLeft: '4px solid #6366f1' }}>
                 <h4 style={{ margin: '0 0 8px 0', color: '#1e3a8a' }}>{upcomingHoliday.next_holiday.holiday_name}</h4>
                 <p style={{ margin: 0, fontWeight: 'bold' }}>
                   {new Date(upcomingHoliday.next_holiday.holiday_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                 </p>
                 <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
                   {upcomingHoliday.next_holiday.holiday_type} • {upcomingHoliday.total_this_month} holidays this month
                 </p>
               </div>
             ) : (
               <div style={{ padding: '16px', background: '#f3f4f6', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                 <p style={{ margin: 0, fontWeight: 'bold' }}>No upcoming holidays</p>
               </div>
             )}
             <button className="btn-secondary" style={{ width: '100%', marginTop: '16px' }} onClick={() => window.location.href='/holidays'}>View Calendar</button>
          </div>
        </div>

        {/* Leave Analytics */}
        <div className="dashboard-card">
          <h3>Leave Analytics</h3>
          <div style={{ width: '100%', height: 300 }}>
            {pendingLeaves === 0 && onLeaveToday === 0 ? (
               <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>No leaves requested/approved today</div>
            ) : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Pending', value: pendingLeaves, fill: '#f59e0b' },
                      { name: 'Approved', value: onLeaveToday, fill: '#10b981' }
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    label
                  >
                    <Cell key="cell-0" fill="#f59e0b" />
                    <Cell key="cell-1" fill="#10b981" />
                  </Pie>
                  <RechartsTooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}