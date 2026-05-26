import { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import "../../styles/emailDashboard.css";

export default function EmailDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/payroll/email/dashboard/");
      const data = res.data;
      
      // Calculate additional metrics
      const total = data.total || 0;
      const success = data.success || 0;
      const failed = data.failed || 0;
      const pending = total - success - failed;
      const successRate = total > 0 ? ((success / total) * 100).toFixed(1) : 0;
      
      setStats({
        total,
        success,
        failed,
        pending,
        success_rate: successRate
      });
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      console.error("Failed to load email stats", err);
      setLoading(false);
    }
  };

  const chartData = stats
    ? [
        { name: "Success", value: stats.success, color: "#16a34a" },
        { name: "Failed", value: stats.failed, color: "#ef4444" },
        { name: "Pending", value: stats.pending, color: "#f59e0b" },
      ].filter(item => item.value > 0)
    : [];

  const COLORS = ["#16a34a", "#ef4444", "#f59e0b"];

  if (loading) {
    return (
      <div className="email-dashboard">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading email statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="email-dashboard">
      
      {/* HEADER */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Email Dashboard</h1>
          <p>Monitor payslip email delivery status and analytics</p>
        </div>
        <div className="header-actions">
          <div className="live-indicator">
            <span className="pulse-dot"></span>
            <span>Live Updates</span>
          </div>
          <div className="last-updated">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">
            <span>📧</span>
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Emails</span>
            <span className="stat-value">{stats?.total || 0}</span>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <span>✅</span>
          </div>
          <div className="stat-content">
            <span className="stat-label">Delivered</span>
            <span className="stat-value">{stats?.success || 0}</span>
          </div>
        </div>

        <div className="stat-card failed">
          <div className="stat-icon">
            <span>❌</span>
          </div>
          <div className="stat-content">
            <span className="stat-label">Failed</span>
            <span className="stat-value">{stats?.failed || 0}</span>
          </div>
        </div>

        <div className="stat-card pending">
          <div className="stat-icon">
            <span>⏳</span>
          </div>
          <div className="stat-content">
            <span className="stat-label">Pending</span>
            <span className="stat-value">{stats?.pending || 0}</span>
          </div>
        </div>

        <div className="stat-card rate">
          <div className="stat-icon">
            <span>📊</span>
          </div>
          <div className="stat-content">
            <span className="stat-label">Success Rate</span>
            <span className="stat-value">{stats?.success_rate || 0}%</span>
          </div>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="charts-row">
        
        {/* PIE CHART */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Email Status Distribution</h3>
          </div>
          <div className="chart-body">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">
                <p>No email data available</p>
              </div>
            )}
          </div>
        </div>

        {/* BAR CHART */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Email Status Overview</h3>
          </div>
          <div className="chart-body">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">
                <p>No email data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* INFO SECTION */}
      <div className="info-section">
        <div className="info-card">
          <h4>📌 About Email Dashboard</h4>
          <ul>
            <li>Real-time monitoring of payslip email delivery</li>
            <li>Auto-refreshes every 10 seconds</li>
            <li>Track success, failed, and pending emails</li>
            <li>View overall delivery success rate</li>
          </ul>
        </div>
        
        <div className="info-card">
          <h4>💡 Quick Actions</h4>
          <ul>
            <li>Go to <strong>Payroll Summary</strong> to send emails</li>
            <li>Check individual email logs in payslip details</li>
            <li>Failed emails can be resent from payroll page</li>
          </ul>
        </div>
      </div>

    </div>
  );
}