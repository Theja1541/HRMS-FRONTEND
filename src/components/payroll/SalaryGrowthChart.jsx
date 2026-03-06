import { useEffect, useState } from "react";
import api from "../../api/axios";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

export default function SalaryGrowthChart({ employeeId }) {

  const [data, setData] = useState([]);

  useEffect(() => {

    const fetchRevisions = async () => {

      try {

        const res = await api.get(`/payroll/salary-revisions/employee/${employeeId}/`);

        const formatted = res.data.map((rev) => ({
          month: new Date(rev.effective_date).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric"
          }),
          salary: Number(rev.ctc || 0)
        }));

        setData(formatted);

      } catch (err) {
        console.error("Salary revision load failed", err);
      }

    };

    if (employeeId) fetchRevisions();

  }, [employeeId]);

  if (!data.length) {
    return <p>No salary revision data available</p>;
  }

  return (
    <div className="trend-card">

      <h3>Salary Growth Chart</h3>

      <ResponsiveContainer width="100%" height={300}>

        <LineChart data={data}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="month" />

          <YAxis />

          <Tooltip
            formatter={(value) =>
              new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR"
              }).format(value)
            }
          />

          <Line
            type="monotone"
            dataKey="salary"
            stroke="#4CAF50"
            strokeWidth={3}
            dot={{ r: 6 }}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>
  );
}