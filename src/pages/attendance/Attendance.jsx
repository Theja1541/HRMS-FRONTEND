import { useState, useEffect } from "react";
import { useEmployees } from "../../context/EmployeesContext";
import toast from "react-hot-toast";
import "../../styles/attendance.css";

export default function Attendance() {
  const {
    employees = [],
    attendance = {},
    markAttendance,
    bulkMarkAttendance,
    refreshAttendance,
    refreshEmployees,
  } = useEmployees();

  const today = new Date().toISOString().split("T")[0];

  const [bulkStatus, setBulkStatus] = useState("PRESENT");
  const [loadingBulk, setLoadingBulk] = useState(false);

  /* ===============================
     Always Refresh Employees
  =============================== */
  useEffect(() => {
    refreshEmployees();
  }, []);

  const getRecord = (empId) => {
    return attendance?.[today]?.[empId] || null;
  };

  /* ===============================
     BULK ATTENDANCE
  =============================== */
  const handleBulkApply = async () => {
    try {
      setLoadingBulk(true);
      await bulkMarkAttendance(today, bulkStatus);
      await refreshAttendance();
      toast.success("Bulk attendance applied successfully");
    } catch (err) {
      toast.error("Bulk operation failed");
    } finally {
      setLoadingBulk(false);
    }
  };

  return (
    <div className="attendance-page">

      {/* ================= HEADER ================= */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Daily Attendance</h2>
          <p className="page-subtitle">
            HR marks employee attendance
          </p>
        </div>
        <span className="date-badge">{today}</span>
      </div>

      {/* ================= BULK ACTION ================= */}
      <div className="bulk-action-bar">
        <select
          value={bulkStatus}
          onChange={(e) => setBulkStatus(e.target.value)}
        >
          <option value="PRESENT">Present</option>
          <option value="LEAVE">Leave</option>
          <option value="ABSENT">Absent</option>
        </select>

        <button
          className="bulk-btn"
          onClick={handleBulkApply}
          disabled={loadingBulk}
        >
          {loadingBulk ? "Applying..." : "Apply to All"}
        </button>
      </div>

      {/* ================= TABLE ================= */}
      <div className="table-wrapper">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Attendance</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((emp) => {
              const record = getRecord(emp.id);
              const status = record?.status || "";

              return (
                <tr key={emp.id}>
                  <td className="employee-name">
                    {emp.full_name || "-"}
                  </td>

                  <td>
                    <div className="attendance-actions">

                      <button
                        className={`att-btn present ${
                          status === "PRESENT" ? "active" : ""
                        }`}
                        onClick={() =>
                          markAttendance(today, emp.id, "PRESENT")
                        }
                      >
                        Present
                      </button>

                      <button
                        className={`att-btn leave ${
                          status === "LEAVE" ? "active" : ""
                        }`}
                        onClick={() =>
                          markAttendance(today, emp.id, "LEAVE")
                        }
                      >
                        Leave
                      </button>

                      <button
                        className={`att-btn absent ${
                          status === "ABSENT" ? "active" : ""
                        }`}
                        onClick={() =>
                          markAttendance(today, emp.id, "ABSENT")
                        }
                      >
                        Absent
                      </button>

                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}