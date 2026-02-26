import { useState, useMemo } from "react";
import { useEmployees } from "../../context/EmployeesContext";
import {
  exportAttendanceExcel,
  exportAttendancePDF,
} from "../../utils/attendanceExport";
import "../../styles/monthlyAttendance.css";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import "../../styles/monthlyAttendance.css";

/* ===== STATUS COLORS ===== */
const STATUS_COLORS = {
  PRESENT: "#22c55e",
  LEAVE: "#f59e0b",
  ABSENT: "#ef4444",
};

export default function MonthlyAttendance() {
  const { employees = [], attendance = {} } = useEmployees();

  const [month, setMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const [selectedEmployee, setSelectedEmployee] = useState("ALL");

  /* ===== DATE LOGIC ===== */
  const year = Number(month.split("-")[0]);
  const monthIndex = Number(month.split("-")[1]) - 1;
  const totalDays = new Date(year, monthIndex + 1, 0).getDate();
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  const activeEmployees = useMemo(() => {
    const active = employees.filter((e) => e.is_active !== false);
    
    if (selectedEmployee === "ALL") return active;
    
    return active.filter(
      (emp) => String(emp.id) === String(selectedEmployee)
    );
  }, [employees, selectedEmployee]);

  const getStatus = (empId, day) => {
    const date = `${month}-${String(day).padStart(2, "0")}`;
    return attendance?.[date]?.[empId]?.status || "-";
  };


  /* ===== SUMMARY ===== */
 const summary = useMemo(() => {
  let present = 0;
  let leave = 0;
  let absent = 0;

  Object.keys(attendance).forEach((date) => {
    if (!date.startsWith(month)) return;

    Object.entries(attendance[date] || {}).forEach(
      ([empId, rec]) => {
        if (
          selectedEmployee !== "ALL" &&
          String(empId) !== String(selectedEmployee)
        )
          return;

        if (rec.status === "PRESENT") present++;
        if (rec.status === "LEAVE") leave++;
        if (rec.status === "ABSENT") absent++;
      }
    );
  });

  return { present, leave, absent };
}, [attendance, month, selectedEmployee]);

  const chartData = [
    { name: "PRESENT", value: summary.present },
    { name: "LEAVE", value: summary.leave },
    { name: "ABSENT", value: summary.absent },
  ];

  return (
    <div className="monthly-attendance-container">

      {/* ===== HEADER ===== */}
      <div className="monthly-header">
        <div>
          <h2> 📅 Monthly Attendance – {selectedEmployee === "ALL" ? " Company Overview" : " Employee View"} </h2>
          <p>HR Overview – Attendance Summary & Distribution</p>
        </div>

        <div className="header-controls">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />

        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
        >
          <option value="ALL">All Employees</option>

          {employees
            .filter((e) => e.is_active !== false)
            .map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.first_name} {emp.last_name}
              </option>
            ))}
        </select>

          <button
            className="btn-outline"
            onClick={() =>
              exportAttendanceExcel({
                title: "Monthly_Attendance",
                month,
                columns: ["Employee", ...days],
                rows: activeEmployees.map((emp) => [
                  `${emp.first_name} ${emp.last_name}`,
                  ...days.map((d) => {
                    const s = getStatus(emp.id, d);
                    return s === "-" ? "-" : s[0];
                  }),
                ]),
              })
            }
          >
            Export Excel
          </button>

          <button
            className="btn-primary"
            onClick={() =>
              exportAttendancePDF({
                title: "Monthly_Attendance",
                month,
                columns: ["Employee", ...days],
                rows: activeEmployees.map((emp) => [
                  `${emp.firstName} ${emp.lastName}`,
                  ...days.map((d) => {
                    const s = getStatus(emp.id, d);
                    return s === "-" ? "-" : s[0];
                  }),
                ]),
              })
            }
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* ===== SUMMARY CARDS ===== */}
      <div className="summary-grid">
        <div className="summary-card present">
          <h3>{summary.present}</h3>
          <span>Total Present</span>
        </div>

        <div className="summary-card leave">
          <h3>{summary.leave}</h3>
          <span>Total Leave</span>
        </div>

        <div className="summary-card absent">
          <h3>{summary.absent}</h3>
          <span>Total Absent</span>
        </div>
      </div>

      {/* ===== CHARTS ===== */}
      <div className="charts-grid">
        <div className="card">
          <h3>Attendance Count</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={STATUS_COLORS[entry.name]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3>Attendance Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                innerRadius={70}
                outerRadius={100}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={STATUS_COLORS[entry.name]}
                  />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== TABLE ===== */}
      <div className="table-wrapper">
        <table className="premium-table">
          <thead>
            <tr>
              <th className="sticky-col">Employee</th>
              {days.map((d) => (
                <th key={d}>{d}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {activeEmployees.map((emp) => (
              <tr key={emp.id}>
                <td className="sticky-col employee-name">
                  {emp.first_name} {emp.last_name}
                </td>

                {days.map((d) => {
                  const status = getStatus(emp.id, d);

                  return (
                    <td key={d}>
                      {status === "-" ? (
                        "-"
                      ) : (
                        <span
                          className={`badge ${status.toLowerCase()}`}
                        >
                          {status[0]}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}