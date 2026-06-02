import { useEffect, useState } from "react";
import api from "../../api/axios";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

export default function SalaryGrowthChart({ employeeId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevisions = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/payroll/salary-revisions/employee/${employeeId}/`);
        
        // Sort chronologically for proper left-to-right timeline plotting
        const sorted = (res.data || []).sort(
          (a, b) => new Date(a.effective_from) - new Date(b.effective_from)
        );

        const formatted = sorted.map((rev) => ({
          month: new Date(rev.effective_from).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric"
          }),
          salary: Number(rev.ctc || rev.gross_salary || 0)
        }));

        setData(formatted);
      } catch (err) {
        console.error("Salary revision load failed", err);
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) fetchRevisions();
  }, [employeeId]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount || 0);

  if (loading) {
    return (
      <div className="growth-trend-card" style={{ minHeight: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: "14px", color: "var(--slate-muted)", fontWeight: 600 }}>Loading timeline statistics...</span>
      </div>
    );
  }

  if (!data.length) {
    return null;
  }

  return (
    <div className="growth-trend-card">
      <h3>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ verticalAlign: "middle" }}>
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
        Compensation Trajectory Curve (CTC)
      </h3>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="ctcGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="custom-chart-tooltip">
                    <div className="tooltip-month">{payload[0].payload.month}</div>
                    <div className="tooltip-value">{formatCurrency(payload[0].value)}</div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="salary"
            stroke="#4f46e5"
            strokeWidth={3.5}
            fillOpacity={1}
            fill="url(#ctcGrad)"
            dot={{ r: 5, stroke: "#ffffff", strokeWidth: 2, fill: "#4f46e5" }}
            activeDot={{ r: 8, stroke: "#ffffff", strokeWidth: 2.5, fill: "#0f172a" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}