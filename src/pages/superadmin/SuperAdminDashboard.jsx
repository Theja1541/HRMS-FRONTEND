import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSuperAdminAnalytics } from "../../api/superadmin";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import { LineChart, Line, CartesianGrid } from "recharts";
import { getMonthlyGrowthAnalytics } from "../../api/superadmin";


import "../../styles/dashboard.css";
import "../../styles/pages.css";




export default function SuperAdminDashboard() {
  const [data, setData] = useState(null);
  const COLORS = ["#2563eb", "#16a34a", "#f97316", "#7c3aed"];

  const [monthlyData, setMonthlyData] = useState([]);
  

  useEffect(() => {
    getSuperAdminAnalytics()
      .then((res) => setData(res.data))
      .catch(() => alert("Failed to load analytics"));
  }, []);

  useEffect(() => {
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


  if (!data) return <p>Loading analytics...</p>;

  const formatCurrency = (num) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(num || 0);

  const overviewCards = [
    { label: "Total Companies Registered", value: data.total_companies_registered ?? data.total_companies ?? 0, color: "blue" },
    { label: "Total Employees Across All Companies", value: data.total_employees ?? 0, color: "green" },
    { label: "Active Companies", value: data.active_companies ?? 0, color: "orange" },
    { label: "Suspended Companies", value: data.inactive_companies ?? 0, color: "purple" },
    { label: "Total Payroll Processed", value: formatCurrency(data.total_payroll_processed), color: "blue", isText: true },
    { label: "Total HR / Admin Users", value: data.hr_admin_count ?? 0, color: "green" },
  ];

  const companiesSummary = data.companies_summary || [];
  const recentCompanies = data.recent_companies || [];
  const systemHealth = data.system_health || "Healthy";

  return (
    <div className="dashboard-page">
      <h2 className="page-title">Platform Overview</h2>
      <p className="page-subtitle">Super Admin dashboard – system-wide statistics</p>

      <div className="dashboard-kpis">
        {overviewCards.map((item) => (
          <div key={item.label} className={`kpi-card ${item.color}`}>
            <h3>{item.value}</h3>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      <div className="dashboard-grid" style={{ marginBottom: 24 }}>
        <div className="dashboard-card">
          <h3 style={{ marginBottom: 12 }}>System Health Status</h3>
          <p style={{ fontSize: 18, fontWeight: 600, color: "#16a34a" }}>{systemHealth}</p>
          <p className="muted-text" style={{ marginTop: 4 }}>All systems operational.</p>
        </div>
        <div className="dashboard-card">
          <h3 style={{ marginBottom: 12 }}>Recent Company Registrations</h3>
          {recentCompanies.length === 0 ? (
            <p className="muted-text">No companies yet.</p>
          ) : (
            <ul className="recent-list">
              {recentCompanies.slice(0, 5).map((c) => (
                <li key={c.id}>
                  <strong>{c.name}</strong> ({c.company_code})
                  {c.created_at && (
                    <span className="muted-text" style={{ marginLeft: 8 }}>
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
          <p style={{ marginTop: 12 }}>
            <Link to="/super-admin/companies">View all companies →</Link>
          </p>
        </div>
      </div>

      {companiesSummary.length > 0 && (
        <div className="dashboard-card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 12 }}>Companies (Tenants)</h3>
          <div className="responsive-table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Users</th>
                  <th>Employees</th>
                </tr>
              </thead>
              <tbody>
                {companiesSummary.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.company_code}</td>
                    <td>{c.user_count}</td>
                    <td>{c.employee_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p><Link to="/super-admin/companies">Manage companies →</Link></p>
        </div>
      )}

      <div className="dashboard-card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 12 }}>Monthly Growth Trend</h3>
      <div className="responsive-chart-container" style={{ height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />

            <Line type="monotone" dataKey="users" stroke="#2563eb" />
            <Line type="monotone" dataKey="employees" stroke="#16a34a" />
            <Line type="monotone" dataKey="leaves" stroke="#f97316" />
            <Line type="monotone" dataKey="payslips" stroke="#7c3aed" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      </div>

      <div className="dashboard-card">
        <h3 style={{ marginBottom: 12 }}>Role Distribution</h3>
        <div className="responsive-chart-container" style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.role_distribution}
                dataKey="count"
                nameKey="role"
                outerRadius={100}
                label
              >
                {data.role_distribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
