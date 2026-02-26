import { useEffect, useState } from "react";
import { getEmailDashboard } from "../../api/payroll";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "../../styles/payroll.css";
import toast from "react-hot-toast";


export default function EmailDashboard() {

  const [month, setMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const [stats, setStats] = useState(null);

  useEffect(() => {
  fetchData();

  const interval = setInterval(() => {
    fetchData();
  }, 5000); // refresh every 5 seconds

  return () => clearInterval(interval);
}, [month]);

useEffect(() => {

  const socket = new WebSocket("ws://127.0.0.1:8000/ws/email-dashboard/");

  socket.onmessage = function (event) {

    const data = JSON.parse(event.data);

    console.log("Live update:", data);

    // 🔔 SUCCESS TOAST
    if (data.status === "SUCCESS") {
      toast.success("📧 Email sent successfully!");
    }

    // ❌ FAILURE TOAST
    if (data.status === "FAILED") {
      toast.error("⚠ Email sending failed!");
    }

    // Refresh dashboard stats
    fetchData();
  };

  socket.onclose = function () {
    console.log("WebSocket disconnected");
  };

  return () => socket.close();

}, []);



  const fetchData = async () => {
    try {
      const res = await getEmailDashboard(month);
      setStats(res.data);
    } catch (err) {
      console.error("Failed to load email stats");
    }
  };

  const chartData = stats
    ? [
        { name: "Success", value: stats.success },
        { name: "Failed", value: stats.failed },
        { name: "Pending", value: stats.pending },
      ]
    : [];

  const COLORS = ["#16a34a", "#ef4444", "#f59e0b"];

  return (
    <div className="payroll-page">

      {/* HEADER */}
      <div className="page-header">
        <div>
          <h2>Email Dashboard</h2>
          <p>Email delivery analytics</p>
          <span className="live-indicator">● Live</span>
        </div>

        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
      </div>

      {!stats ? (
        <div className="loading-text">Loading...</div>
      ) : (
        <>
          {/* SUMMARY CARDS */}
          <div className="dashboard-cards">

            <div className="card">
              <h3>Total Emails</h3>
              <p>{stats.total}</p>
            </div>

            <div className="card success">
              <h3>Success</h3>
              <p>{stats.success}</p>
            </div>

            <div className="card error">
              <h3>Failed</h3>
              <p>{stats.failed}</p>
            </div>

            <div className="card pending">
              <h3>Pending</h3>
              <p>{stats.pending}</p>
            </div>

            <div className="card rate">
              <h3>Success Rate</h3>
              <p>{stats.success_rate}%</p>
            </div>

          </div>

          {/* PIE CHART */}
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  dataKey="value"
                  label
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
