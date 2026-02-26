import { useMemo } from "react";
import { useEmployees } from "../../context/EmployeesContext";
import "../../styles/employeeAttendance.css";

export default function EmployeeAttendance() {
  const { currentEmployee, attendance } = useEmployees();

  /* ================= TODAY DATE ================= */
  const today = new Date().toISOString().slice(0, 10);

  const todayRecord = attendance[today]?.[currentEmployee?.employeeId];

  /* ================= MONTH ================= */
  const month = today.slice(0, 7);

  /* ================= MONTHLY SUMMARY ================= */
  const summary = useMemo(() => {
    let present = 0;
    let leave = 0;
    let absent = 0;

    Object.keys(attendance).forEach((date) => {
      if (!date.startsWith(month)) return;

      const rec = attendance[date]?.[currentEmployee?.employeeId];

      if (!rec || rec.approval !== "Approved") return;

      if (rec.status === "Present") present++;
      if (rec.status === "Leave") leave++;
      if (rec.status === "Absent") absent++;
    });

    return { present, leave, absent };
  }, [attendance, month, currentEmployee?.employeeId]);

  /* ================= TODAY STATUS ================= */
  const todayStatus = !todayRecord
    ? { label: "Not Marked", className: "not-marked" }
    : todayRecord.approval !== "Approved"
    ? { label: "Pending Approval", className: "pending" }
    : {
        label: todayRecord.status,
        className: todayRecord.status.toLowerCase(),
      };

  return (
    <div className="employee-attendance-page">
      {/* ===== HEADER ===== */}
      <h2>My Attendance</h2>
      <p className="muted">
        View your attendance status and monthly summary
      </p>

      {/* ===== TODAY STATUS ===== */}
      <div className="attendance-card card">
        <h3>Today&apos;s Status</h3>

        <div className={`status-pill ${todayStatus.className}`}>
          {todayStatus.label}
        </div>

        <p className="muted-note">
          Attendance is visible only after HR approval.
        </p>
      </div>

      {/* ===== MONTHLY SUMMARY ===== */}
      <div className="attendance-card card">
        <h3>Monthly Summary</h3>

        <div className="summary-grid">
          <div className="present">
            <strong>Present</strong>
            <p>{summary.present}</p>
          </div>

          <div className="leave">
            <strong>Leave</strong>
            <p>{summary.leave}</p>
          </div>

          <div className="absent">
            <strong>Absent</strong>
            <p>{summary.absent}</p>
          </div>
        </div>

        <p className="muted-note">
          Only <b>approved</b> attendance is counted for payroll.
        </p>
      </div>
    </div>
  );
}
