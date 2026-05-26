import { useState, useEffect, useMemo } from "react";
import { useEmployees } from "../../context/EmployeesContext";
import toast from "react-hot-toast";
import { usePayroll } from "../../context/PayrollContext";
import PayrollLockBanner from "../../components/common/PayrollLockBanner";
import axios from "../../api/axios";
import "../../styles/attendance.css";

export default function Attendance() {
  const { payrollStatus } = usePayroll();
  const isLocked = payrollStatus === "CLOSED";

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
  const [dayStatus, setDayStatus] = useState(null);
  const [fetchingDayStatus, setFetchingDayStatus] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [designationFilter, setDesignationFilter] = useState("ALL");

  useEffect(() => {
    refreshEmployees();
    fetchDayStatus();
  }, []);

  const fetchDayStatus = async () => {
    try {
      setFetchingDayStatus(true);
      const res = await axios.get(`/attendance/day-status/?date=${today}`);
      setDayStatus(res.data);
    } catch (err) {
      console.error("Failed to fetch day status", err);
    } finally {
      setFetchingDayStatus(false);
    }
  };

  const getRecord = (empId) => {
    return attendance?.[today]?.[String(empId)] || null;
  };

  /* ===============================
     DERIVED DATA (FILTERS & CARDS)
  =============================== */
  const { 
    filteredEmployees, 
    departments, 
    designations, 
    summary 
  } = useMemo(() => {
    const deps = new Set();
    const desigs = new Set();
    const sum = { PRESENT: 0, ABSENT: 0, HOLIDAY: 0, WEEK_OFF: 0, LEAVE: 0 };

    const filtered = employees.filter((emp) => {
      // Collect unique departments and designations for dropdowns
      if (emp.department_name) deps.add(emp.department_name);
      if (emp.designation_name) desigs.add(emp.designation_name);

      const record = getRecord(emp.id);
      const status = record?.status || "UNMARKED";

      // Summary counts
      if (status === "PRESENT" || status === "PRESENT_ON_HOLIDAY" || status === "WFH") sum.PRESENT++;
      else if (status === "ABSENT") sum.ABSENT++;
      else if (status === "HOLIDAY") sum.HOLIDAY++;
      else if (status === "WEEK_OFF") sum.WEEK_OFF++;
      else if (["PAID_LEAVE", "UNPAID_LEAVE", "HALF_DAY"].includes(status)) sum.LEAVE++;

      // Apply Filters
      const matchSearch = emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.employee_id?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === "ALL" || status === statusFilter;
      const matchDep = departmentFilter === "ALL" || emp.department_name === departmentFilter;
      const matchDesig = designationFilter === "ALL" || emp.designation_name === designationFilter;

      return matchSearch && matchStatus && matchDep && matchDesig;
    });

    return { 
      filteredEmployees: filtered, 
      departments: [...deps], 
      designations: [...desigs], 
      summary: sum 
    };
  }, [employees, attendance, searchTerm, statusFilter, departmentFilter, designationFilter, today]);

  /* ===============================
     BULK ATTENDANCE
  =============================== */
  const handleBulkApply = async () => {
    if (dayStatus?.is_holiday && bulkStatus === "ABSENT") {
      toast.error("Cannot bulk mark absent on a holiday");
      return;
    }
    
    try {
      setLoadingBulk(true);
      await bulkMarkAttendance(today, bulkStatus);
      await refreshAttendance();
      toast.success("Bulk attendance applied successfully");
    } catch (err) {
      toast.error(err.response?.data?.error || "Bulk operation failed");
    } finally {
      setLoadingBulk(false);
    }
  };

  const isHolidayActive = dayStatus?.is_holiday;
  const disableControls = isLocked || isHolidayActive;

  return (
    <div className="attendance-page">
      <PayrollLockBanner />

      {/* ================= HOLIDAY BANNER ================= */}
      {!fetchingDayStatus && isHolidayActive && (
        <div className="holiday-banner">
          <span className="holiday-banner-icon">🎉</span>
          <div>
            <strong>Today is a {dayStatus.holiday_type} Holiday: {dayStatus.holiday_name}.</strong>
            <p style={{ margin: 0, fontSize: "14px", opacity: 0.9 }}>
              Attendance marking is disabled. Special holiday workers can be marked as "Present on Holiday".
            </p>
          </div>
        </div>
      )}

      {/* ================= SUMMARY CARDS ================= */}
      <div className="attendance-summary-cards">
        <div className="summary-card present">
          <h3>{summary.PRESENT}</h3>
          <span>Present</span>
        </div>
        <div className="summary-card absent">
          <h3>{summary.ABSENT}</h3>
          <span>Absent</span>
        </div>
        <div className="summary-card holiday">
          <h3>{summary.HOLIDAY}</h3>
          <span>Holiday</span>
        </div>
        <div className="summary-card weekoff">
          <h3>{summary.WEEK_OFF}</h3>
          <span>Week Off</span>
        </div>
        <div className="summary-card leave">
          <h3>{summary.LEAVE}</h3>
          <span>Leave</span>
        </div>
      </div>

      {/* ================= HEADER ================= */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Daily Attendance</h2>
          <p className="page-subtitle">HR marks employee attendance</p>
        </div>
        <span className="date-badge">{today}</span>
      </div>

      {/* ================= FILTERS & BULK ACTION ================= */}
      <div className="filters-bar">
        <input 
          type="text" 
          placeholder="🔍 Search Employee Name or ID..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)}>
          <option value="ALL">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={designationFilter} onChange={e => setDesignationFilter(e.target.value)}>
          <option value="ALL">All Designations</option>
          {designations.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="ALL">All Statuses</option>
          <option value="PRESENT">Present</option>
          <option value="ABSENT">Absent</option>
          <option value="HOLIDAY">Holiday</option>
          <option value="WEEK_OFF">Week Off</option>
          <option value="PAID_LEAVE">Paid Leave</option>
          <option value="UNPAID_LEAVE">Unpaid Leave</option>
          <option value="UNMARKED">Unmarked</option>
        </select>
      </div>

      <div className="bulk-action-bar">
        <select
          value={bulkStatus}
          onChange={(e) => setBulkStatus(e.target.value)}
          disabled={disableControls}
        >
          <option value="PRESENT">Present</option>
          <option value="HALF_DAY">Half Day</option>
          <option value="PAID_LEAVE">Paid Leave</option>
          <option value="UNPAID_LEAVE">Unpaid Leave</option>
          <option value="ABSENT">Absent</option>
        </select>

        <button
          className="bulk-btn"
          onClick={handleBulkApply}
          disabled={loadingBulk || disableControls}
        >
          {loadingBulk ? "Applying..." : "Apply to All"}
        </button>
      </div>

      {/* ================= TABLE ================= */}
      <div className="table-wrapper">
        <table className="attendance-table premium-table">
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Employee ID</th>
              <th>Department</th>
              <th>Attendance Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredEmployees.map((emp) => {
              const record = getRecord(emp.id);
              const status = record?.status || "";

              return (
                <tr key={emp.id}>
                  <td className="employee-name">{emp.full_name || "-"}</td>
                  <td>{emp.employee_id || "-"}</td>
                  <td>{emp.department_name || "-"}</td>
                  <td>
                    {status ? (
                      <span className={`status-badge ${status.toLowerCase().replace(/_/g, '-')}`}>
                        {status.replace(/_/g, ' ')}
                      </span>
                    ) : (
                      <span className="status-badge" style={{ background: '#cbd5e1', color: '#334155' }}>
                        Unmarked
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="attendance-actions">
                      {!isHolidayActive ? (
                        <>
                          <button
                            className={`att-btn present ${status === "PRESENT" ? "active" : ""}`}
                            onClick={async () => {
                              try {
                                await markAttendance(today, emp.id, "PRESENT");
                                toast.success("Marked Present");
                              } catch {
                                toast.error("Failed to mark attendance");
                              }
                            }}
                            disabled={isLocked}
                          >
                            Present
                          </button>
                          <button
                            className={`att-btn leave ${status === "HALF_DAY" ? "active" : ""}`}
                            onClick={async () => {
                              try {
                                await markAttendance(today, emp.id, "HALF_DAY");
                                toast.success("Marked Half Day");
                              } catch {
                                toast.error("Failed to mark attendance");
                              }
                            }}
                            disabled={isLocked}
                          >
                            Half Day
                          </button>
                          <button
                            className={`att-btn absent ${status === "ABSENT" ? "active" : ""}`}
                            onClick={async () => {
                              try {
                                await markAttendance(today, emp.id, "ABSENT");
                                toast.success("Marked Absent");
                              } catch (err) {
                                toast.error(err.response?.data?.error || "Failed to mark attendance");
                              }
                            }}
                            disabled={isLocked}
                          >
                            Absent
                          </button>
                        </>
                      ) : (
                        <button
                          className={`att-btn present-holiday ${status === "PRESENT_ON_HOLIDAY" ? "active" : ""}`}
                          onClick={async () => {
                            try {
                              await markAttendance(today, emp.id, "PRESENT_ON_HOLIDAY");
                              toast.success("Marked Present on Holiday");
                            } catch {
                              toast.error("Failed to mark attendance");
                            }
                          }}
                          disabled={isLocked}
                        >
                          Present (Holiday Override)
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            
            {filteredEmployees.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                  No employees match the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}