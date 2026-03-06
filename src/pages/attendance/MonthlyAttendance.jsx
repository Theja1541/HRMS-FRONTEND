import { useState, useMemo, useEffect } from "react";
import { useEmployees } from "../../context/EmployeesContext";
import {
  exportAttendanceExcel,
  exportAttendancePDF,
} from "../../utils/attendanceExport";
import axios from "../../api/axios";
import { useToast } from "../../context/ToastContext";
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
import { usePayroll } from "../../context/PayrollContext";
import PayrollLockBanner from "../../components/common/PayrollLockBanner";
import { useAuth } from "../../auth/AuthContext";
import { reopenPayrollMonth } from "../../api/payroll";

/* ===== STATUS COLORS ===== */
const STATUS_COLORS = {
  PRESENT: "#22c55e",
  LEAVE: "#f59e0b",
  ABSENT: "#ef4444",
};

export default function MonthlyAttendance() {
  /* =======================
     🔹 ALL HOOKS FIRST
  ======================= */

  const { employees = [], attendance = {} } = useEmployees();
  const { showToast } = useToast();
  const { user } = useAuth();
  const { isLocked, payrollStatus, refreshPayrollStatus } = usePayroll();

  const [month, setMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const [selectedEmployee, setSelectedEmployee] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [sending, setSending] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [reopening, setReopening] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);

  /* =======================
     DATE LOGIC
  ======================= */
  const year = Number(month.split("-")[0]);
  const monthIndex = Number(month.split("-")[1]) - 1;
  const totalDays = new Date(year, monthIndex + 1, 0).getDate();
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  /* =======================
     SEARCH FILTER
  ======================= */
  const filteredEmployees = useMemo(() => {
    return employees
      .filter((e) => e.is_active !== false)
      .filter((e) =>
        `${e.first_name} ${e.last_name}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
  }, [employees, searchTerm]);

  useEffect(() => {
  if (
    selectedEmployee !== "ALL" &&
    !filteredEmployees.some(
      (emp) => emp.id === Number(selectedEmployee)
    )
  ) {
    setSelectedEmployee("ALL");
  }
}, [filteredEmployees]);

  const activeEmployees = useMemo(() => {
    if (selectedEmployee === "ALL") {
      return filteredEmployees;
    }

    return filteredEmployees.filter(
      (emp) => emp.id === Number(selectedEmployee)
    );
  }, [filteredEmployees, selectedEmployee]);

  /* =======================
     GET STATUS
  ======================= */
  const getStatus = (empId, day) => {
    const date = `${month}-${String(day).padStart(2, "0")}`;
    return attendance?.[date]?.[String(empId)]?.status || "-";
  };

  /* =======================
     SEND MONTHLY EMAIL
  ======================= */
  const handleSendMonthlyEmail = async () => {
    try {
      setSending(true);
      const [selectedYear, selectedMonth] = month.split("-");

      await axios.post("/attendance/send-monthly-email/", {
        year: Number(selectedYear),
        month: Number(selectedMonth),
      });

      setShowConfirmModal(false);
      showToast({
        message: "Monthly attendance emails triggered successfully",
        type: "success",
      });
    } catch {
      showToast({
        message: "Failed to send attendance emails",
        type: "error",
      });
    } finally {
      setSending(false);
    }
  };

  /* =======================
     GENERATE TODAY
  ======================= */
  const handleGenerateToday = async () => {
    try {
      setLoadingGenerate(true);

      const res = await axios.post("/attendance/generate-today/", {
        employee_id:
          selectedEmployee === "ALL" ? null : selectedEmployee,
      });

      showToast({
        message: res.data?.message || "Attendance generated",
        type: "success",
      });

      setShowGenerateModal(false);
    } catch {
      showToast({
        message: "Failed to generate attendance",
        type: "error",
      });
    } finally {
      setLoadingGenerate(false);
    }
  };

  /* =======================
     REOPEN MONTH (SUPER ADMIN)
  ======================= */
  const handleReopenMonth = async () => {
    try {
      setReopening(true);

      await reopenPayrollMonth(month);

      showToast({
        message: "Payroll month reopened successfully",
        type: "success",
      });

      setShowReopenModal(false);
      refreshPayrollStatus();
    } catch {
      showToast({
        message: "Failed to reopen payroll month",
        type: "error",
      });
    } finally {
      setReopening(false);
    }
  };

  /* =======================
     SUMMARY CALCULATION
  ======================= */
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
          Number(empId) !== Number(selectedEmployee)
        )
          return;

        if (rec.status === "PRESENT") present++;

        if (
          rec.status === "PAID_LEAVE" ||
          rec.status === "UNPAID_LEAVE" ||
          rec.status === "HALF_DAY"
        )
          leave++;

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

  /* =======================
     JSX
  ======================= */
  return (
    <div className="monthly-attendance-container">
      <PayrollLockBanner />

      <div className="monthly-header">
        <div>
          <h2>📅 Monthly Attendance – HR Overview</h2>
          <p>Attendance Summary & Distribution</p>
        </div>

        <div className="header-controls">
          <div className="month-selector-wrapper">
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />

            <span
              className={`payroll-lock-indicator ${
                isLocked ? "locked" : "open"
              }`}
            >
              {isLocked ? "🔒" : "🔓"}
            </span>

            {payrollStatus === "CLOSED" &&
              user?.role === "SUPER_ADMIN" && (
                <button
                  className="btn-warning"
                  onClick={() => setShowReopenModal(true)}
                >
                  Reopen Month
                </button>
              )}
          </div>

          <input
            type="text"
            placeholder="Search employee..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
          >
            <option value="ALL">All Employees</option>
            {filteredEmployees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.first_name} {emp.last_name}
              </option>
            ))}
          </select>

          <button
            className="btn-success"
            onClick={() => setShowConfirmModal(true)}
            disabled={sending || isLocked}
          >
            {sending ? "Sending..." : "Send Monthly Emails"}
          </button>

          <button
            className="btn-danger"
            onClick={() => setShowGenerateModal(true)}
            disabled={isLocked}
          >
            Generate Today Attendance
          </button>
        </div>
      </div>

      {/* SUMMARY */}
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
        <Bar dataKey="value">
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
        <Pie data={chartData} dataKey="value">
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

      {/* REOPEN MODAL */}
      {showReopenModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Reopen Payroll Month?</h3>
            <p>This will unlock attendance & leave approvals.</p>
            <div className="modal-actions">
              <button onClick={() => setShowReopenModal(false)}>
                Cancel
              </button>
              <button
                onClick={handleReopenMonth}
                disabled={reopening}
              >
                {reopening ? "Reopening..." : "Confirm Reopen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}