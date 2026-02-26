import { useParams } from "react-router-dom";
import { useEmployees } from "../../context/EmployeesContext";
import { useMemo, useState } from "react";
import "../../styles/monthlyAttendance.css";
import {
  exportAttendanceExcel,
  exportAttendancePDF,
} from "../../utils/attendanceExport";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

export default function EmployeeMonthlyAttendance() {
  const { employeeId } = useParams();
  const { employees, attendance } = useEmployees();

  const [month, setMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  // 🔥 USE PRIMARY KEY
  const employee = employees.find(
    (e) =>
      String(e.id) === employeeId &&
      e.status === "Active"
  );

  if (!employee) {
    return (
      <p style={{ padding: 24 }}>
        Employee inactive or not found
      </p>
    );
  }

  const year = Number(month.split("-")[0]);
  const monthIndex = Number(month.split("-")[1]) - 1;
  const totalDays = new Date(year, monthIndex + 1, 0).getDate();
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  const records = useMemo(() => {
    return days.map((day) => {
      const date = `${month}-${String(day).padStart(2, "0")}`;
      const rec = attendance?.[date]?.[employee.id];

      if (!rec) return "-";

      if (rec.status === "PRESENT") return "P";
      if (rec.status === "LEAVE") return "L";
      if (rec.status === "ABSENT") return "A";

      return "-";
    });
  }, [attendance, month, employee.id, days]);

  const summary = useMemo(() => {
    return {
      present: records.filter((r) => r === "P").length,
      leave: records.filter((r) => r === "L").length,
      absent: records.filter((r) => r === "A").length,
    };
  }, [records]);

  const pieData = [
    { name: "Present", value: summary.present },
    { name: "Leave", value: summary.leave },
    { name: "Absent", value: summary.absent },
  ];

  const colors = ["#16a34a", "#f59e0b", "#ef4444"];

  return (
    <div className="monthly-attendance-container">
      <div className="monthly-attendance-header">
        <div>
          <h2>{employee.firstName} {employee.lastName}</h2>
          <p>Monthly attendance</p>
        </div>

        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
      </div>

      <div className="attendance-summary">
        <div className="summary-card present">
          <h3>{summary.present}</h3>
          <span>Present</span>
        </div>
        <div className="summary-card leave">
          <h3>{summary.leave}</h3>
          <span>Leave</span>
        </div>
        <div className="summary-card absent">
          <h3>{summary.absent}</h3>
          <span>Absent</span>
        </div>
      </div>

      <div className="card">
        <h3>Distribution</h3>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={pieData} dataKey="value" innerRadius={70} outerRadius={100}>
              {pieData.map((_, i) => (
                <Cell key={i} fill={colors[i]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="monthly-attendance-table-wrapper">
        <table className="monthly-attendance-table">
          <thead>
            <tr>{days.map((d) => <th key={d}>{d}</th>)}</tr>
          </thead>
          <tbody>
            <tr>
              {records.map((r, i) => (
                <td
                  key={i}
                  className={`status-cell ${
                    r === "P"
                      ? "present"
                      : r === "L"
                      ? "leave"
                      : r === "A"
                      ? "absent"
                      : "empty"
                  }`}
                >
                  {r}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="attendance-legend">
        <span className="legend present">P – Present</span>
        <span className="legend leave">L – Leave</span>
        <span className="legend absent">A – Absent</span>
      </div>
    </div>
  );
}