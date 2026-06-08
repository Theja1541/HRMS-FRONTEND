import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSuperAdminAnalytics, getMonthlyGrowthAnalytics } from "../../api/superadmin";
import {
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
  Area,
  AreaChart
} from "recharts";
import CountUp from "react-countup";
import { Building2, Users, CheckCircle, XCircle, IndianRupee, UserCog, Activity, Bell } from "lucide-react";

import "../../styles/dashboard.css";
import "../../styles/pages.css";

export default function SuperAdminDashboard() {
  const [data, setData] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    getSuperAdminAnalytics()
      .then((res) => setData(res.data))
      .catch(() => alert("Failed to load analytics"));

    getMonthlyGrowthAnalytics()
      .then((res) => {
        const formatted = formatMonthlyData(res.data);
        setMonthlyData(formatted);
      })
      .catch(() => console.log("Monthly analytics failed"));
  }, []);

  const formatMonthlyData = (raw) => {
    if (!raw || typeof raw !== "object") return [];
    const map = {};
    const addData = (list, key) => {
      if (!Array.isArray(list)) return;
      list.forEach((item) => {
        const month = (item.month || "").slice(0, 7);
        if (!month) return;
        if (!map[month]) map[month] = { month };
        map[month][key] = item.count;
      });
    };
    addData(raw.users, "users");
    addData(raw.employees, "employees");
    addData(raw.leaves, "leaves");
    addData(raw.payslips, "payslips");
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
  };



  const overviewCards = data ? [
    { label: "Total Companies", value: data.total_companies_registered ?? data.total_companies ?? 0, icon: <Building2 />, color: COLORS[0] },
    { label: "Total Employees", value: data.total_employees ?? 0, icon: <Users />, color: COLORS[1] },
    { label: "Active Companies", value: data.active_companies ?? 0, icon: <CheckCircle />, color: COLORS[2] },
    { label: "Suspended", value: data.inactive_companies ?? 0, icon: <XCircle />, color: COLORS[3] },
    { label: "Payroll Processed", value: data.total_payroll_processed || 0, isCurrency: true, icon: <IndianRupee />, color: COLORS[4] },
    { label: "HR / Admin Users", value: data.hr_admin_count ?? 0, icon: <UserCog />, color: COLORS[5] },
  ] : [];

  const companiesSummary = data?.companies_summary || [];
  const recentCompanies = data?.recent_companies || [];
  const systemHealth = data?.system_health || "Healthy";

  const isHealthy = systemHealth.toLowerCase() === "healthy";

  return (
    <div className="dashboard-page modern-dashboard">
      <div className="dashboard-hero">
        <div className="hero-content">
          <div>
            <h2 className="hero-greeting">Welcome back, Super Admin 👋</h2>
            <p className="hero-subtitle">Here is what's happening across your platform today.</p>
          </div>
          <div className="hero-right">
             <div className="hero-clock" style={{textAlign: 'right'}}>
                <div className="clock-time" style={{fontSize: '28px', fontWeight: 'bold'}}>
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="clock-date" style={{fontSize: '14px', opacity: 0.8}}>
                  {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                </div>
             </div>

          </div>
        </div>
      </div>

      {!data ? (
        <div style={{ padding: "40px", textAlign: "center" }}>
          <div className="spinner" style={{ margin: "0 auto" }}></div>
          <p style={{ marginTop: "16px", color: "#64748b" }}>Loading your dashboard...</p>
        </div>
      ) : (
        <div className="dashboard-kpis">
          {overviewCards.map((item, index) => (
            <div key={item.label} className="kpi-card premium-card" style={{ background: "#ffffff", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)", animationDelay: `${index * 0.1}s`, borderBottom: `4px solid ${item.color}`, padding: "24px", borderRadius: "16px", display: "flex", alignItems: "center", gap: "20px" }}>
              <div className="kpi-icon-wrapper" style={{ background: item.color, color: "#ffffff", width: "64px", height: "64px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", flexShrink: 0, boxShadow: `0 4px 12px ${item.color}66` }}>
                {item.icon}
              </div>
              <div className="kpi-info" style={{ textAlign: "left", flex: 1 }}>
                <h3 style={{ color: "#111827", fontSize: "1.85rem", fontWeight: "800", margin: "0 0 4px 0", letterSpacing: "-0.025em" }}>
                  {item.isCurrency ? "₹" : ""}
                  <CountUp end={item.value} separator="," duration={2.5} />
                </h3>
                <span style={{ color: "#475569", fontSize: "1rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="dashboard-grid">
        <div className="dashboard-card premium-card chart-card">
          <div className="card-header">
            <h3>Monthly Growth Trend</h3>
            <span className="badge">Platform</span>
          </div>
          <div className="responsive-chart-container" style={{ height: 350, width: "100%", minWidth: 0, overflow: "hidden" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEmployees" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLeaves" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPayslips" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Area type="monotone" dataKey="users" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={3} />
                <Area type="monotone" dataKey="employees" stroke="#10b981" fillOpacity={1} fill="url(#colorEmployees)" strokeWidth={3} />
                <Area type="monotone" dataKey="leaves" stroke="#f59e0b" fillOpacity={1} fill="url(#colorLeaves)" strokeWidth={3} />
                <Area type="monotone" dataKey="payslips" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorPayslips)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dashboard-sidebar">
          <div className="dashboard-card premium-card system-health-card">
             <div className="card-header">
                <h3>System Health Status</h3>
                <Activity className={isHealthy ? "text-emerald-500 animate-pulse-slow" : "text-red-500"} size={24} />
             </div>
             <div className="health-status-body">
                <div className={`status-indicator ${isHealthy ? 'healthy' : 'issue'}`}>
                  <div className="pulse-ring"></div>
                  <div className="pulse-core"></div>
                </div>
                <div>
                   <p className={`health-text ${isHealthy ? 'text-emerald-500' : 'text-red-500'}`}>{systemHealth}</p>
                   <p className="muted-text">All microservices operational</p>
                </div>
             </div>
          </div>

          <div className="dashboard-card premium-card role-dist-card">
            <h3>Role Distribution</h3>
            <div className="responsive-chart-container" style={{ height: 260, marginTop: '20px', width: "100%", minWidth: 0, overflow: "hidden" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.role_distribution || []}
                    dataKey="count"
                    nameKey="role"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                  >
                    {data?.role_distribution?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip itemStyle={{ color: '#1f2937' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Legend iconType="circle" verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid bottom-grid">
         <div className="dashboard-card premium-card">
            <div className="card-header">
               <h3>Recent Registrations</h3>
               <Link to="/super-admin/companies" className="view-all-btn">View All</Link>
            </div>
            {recentCompanies.length === 0 ? (
              <div className="empty-state">No recent companies found.</div>
            ) : (
              <div className="recent-companies-list">
                {recentCompanies.slice(0, 5).map((c) => (
                  <div key={c.id} className="recent-company-item">
                     <div className="company-avatar">
                        {c.name.charAt(0)}
                     </div>
                     <div className="company-info">
                        <strong>{c.name}</strong>
                        <span>Code: {c.company_code}</span>
                     </div>
                     <div className="company-date">
                        {c.created_at ? new Date(c.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                     </div>
                  </div>
                ))}
              </div>
            )}
         </div>

         {companiesSummary.length > 0 && (
          <div className="dashboard-card premium-card">
            <div className="card-header">
               <h3>Active Tenants</h3>
               <Link to="/super-admin/companies" className="view-all-btn">Manage</Link>
            </div>
            <div className="responsive-table-container custom-scrollbar">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Company Name</th>
                    <th>Tenant Code</th>
                    <th>Users</th>
                    <th>Employees</th>
                  </tr>
                </thead>
                <tbody>
                  {companiesSummary.slice(0, 5).map((c) => (
                    <tr key={c.id}>
                      <td>
                         <div className="td-name">
                           <div className="mini-avatar">{c.name.charAt(0)}</div>
                           {c.name}
                         </div>
                      </td>
                      <td><span className="tenant-code">{c.company_code}</span></td>
                      <td><span className="count-badge blue">{c.user_count}</span></td>
                      <td><span className="count-badge green">{c.employee_count}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}