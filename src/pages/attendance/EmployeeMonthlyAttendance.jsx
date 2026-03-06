import { useParams } from "react-router-dom";
import { useEmployees } from "../../context/EmployeesContext";
import { useMemo, useState } from "react";
import "../../styles/monthlyAttendance.css";
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

  /* ============================================================
     STATUS MAPPING
  ============================================================ */

  const records = useMemo(() => {
    return days.map((day) => {
      const date = `${month}-${String(day).padStart(2, "0")}`;
      const rec = attendance?.[date]?.[employee.id];

      if (!rec) return "-";

      switch (rec.status) {
        case "PRESENT":
          return "P";
        case "HALF_DAY":
          return "HD";
        case "PAID_LEAVE":
          return "PL";
        case "UNPAID_LEAVE":
          return "UL";
        case "ABSENT":
          return "A";
        case "HOLIDAY":
          return "H";
        case "WEEK_OFF":
          return "WO";
        default:
          return "-";
      }
    });
  }, [attendance, month, employee.id, days]);

  /* ============================================================
     SUMMARY
  ============================================================ */

  const summary = useMemo(() => {
    return {
      present: records.filter((r) => r === "P").length,
      halfDay: records.filter((r) => r === "HD").length,
      paidLeave: records.filter((r) => r === "PL").length,
      unpaidLeave: records.filter((r) => r === "UL").length,
      absent: records.filter((r) => r === "A").length,
      holiday: records.filter((r) => r === "H").length,
      weekOff: records.filter((r) => r === "WO").length,
    };
  }, [records]);

  const pieData = [
    { name: "Present", value: summary.present },
    { name: "Half Day", value: summary.halfDay },
    { name: "Paid Leave", value: summary.paidLeave },
    { name: "Unpaid Leave", value: summary.unpaidLeave },
    { name: "Absent", value: summary.absent },
  ];

  const colors = [
    "#16a34a", // present
    "#0ea5e9", // half day
    "#22c55e", // paid leave
    "#f59e0b", // unpaid leave
    "#ef4444", // absent
  ];

  return (
    <div className="monthly-attendance-container">
      <div className="monthly-attendance-header">
        <div>
          <h2>
            {employee.firstName} {employee.lastName}
          </h2>
          <p>Monthly attendance</p>
        </div>

        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
      </div>

      {/* ================= SUMMARY CARDS ================= */}

      <div className="attendance-summary">
        <div className="summary-card present">
          <h3>{summary.present}</h3>
          <span>Present</span>
        </div>

        <div className="summary-card halfday">
          <h3>{summary.halfDay}</h3>
          <span>Half Day</span>
        </div>

        <div className="summary-card leave">
          <h3>{summary.paidLeave}</h3>
          <span>Paid Leave</span>
        </div>

        <div className="summary-card leave">
          <h3>{summary.unpaidLeave}</h3>
          <span>Unpaid Leave</span>
        </div>

        <div className="summary-card absent">
          <h3>{summary.absent}</h3>
          <span>Absent</span>
        </div>
      </div>

      {/* ================= PIE CHART ================= */}

      <div className="card">
        <h3>Distribution</h3>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              innerRadius={70}
              outerRadius={100}
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={colors[i]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* ================= CALENDAR TABLE ================= */}

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
                      : r === "HD"
                      ? "halfday"
                      : r === "PL"
                      ? "paidleave"
                      : r === "UL"
                      ? "unpaidleave"
                      : r === "A"
                      ? "absent"
                      : r === "H"
                      ? "holiday"
                      : r === "WO"
                      ? "weekoff"
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

      {/* ================= LEGEND ================= */}

      <div className="attendance-legend">
        <span className="legend present">P – Present</span>
        <span className="legend halfday">HD – Half Day</span>
        <span className="legend paidleave">PL – Paid Leave</span>
        <span className="legend unpaidleave">UL – Unpaid Leave</span>
        <span className="legend absent">A – Absent</span>
        <span className="legend holiday">H – Holiday</span>
        <span className="legend weekoff">WO – Week Off</span>
      </div>
    </div>
  );
}