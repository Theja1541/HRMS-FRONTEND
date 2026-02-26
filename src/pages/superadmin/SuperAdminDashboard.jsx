import { useEffect, useState } from "react";
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


import "../../styles/superadmin.css";




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

  const formatMonthlyData = (data) => {
  const map = {};

  const addData = (list, key) => {
    list.forEach(item => {
      const month = item.month.slice(0, 7);
      if (!map[month]) map[month] = { month };
      map[month][key] = item.count;
    });
  };

  addData(data.users, "users");
  addData(data.employees, "employees");
  addData(data.leaves, "leaves");
  addData(data.payslips, "payslips");

  return Object.values(map).sort((a, b) =>
    a.month.localeCompare(b.month)
  );
};


  if (!data) return <p>Loading analytics...</p>;

  const overviewData = [
    { name: "Users", value: data.total_users },
    { name: "Employees", value: data.total_employees },
    { name: "Leaves", value: data.total_leaves },
    { name: "Payslips", value: data.total_payslips },
  ];

  return (
    <div>
      <h2>System Analytics Dashboard</h2>

      {/* ================= BAR CHART ================= */}
      <div className="chart-container">
      <h3>Monthly Growth Trend</h3>
      <ResponsiveContainer width="100%" height={350}>
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


      {/* ================= PIE CHART ================= */}
      <div className="chart-container">
        <h3>Role Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
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
  );
}
