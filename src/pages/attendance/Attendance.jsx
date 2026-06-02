import { useState, useEffect, useMemo } from "react";
import { useEmployees } from "../../context/EmployeesContext";
import toast from "react-hot-toast";
import { usePayroll } from "../../context/PayrollContext";
import PayrollLockBanner from "../../components/common/PayrollLockBanner";
import axios from "../../api/axios";
import "../../styles/attendance.css";
import { useCompanyPermissions } from "../../hooks/useCompanyPermissions";

export default function Attendance() {
  const { payrollStatus } = usePayroll();
  const isLocked = payrollStatus === "CLOSED";
  const { hasPermission } = useCompanyPermissions();
  const canEdit = hasPermission("attendance", "edit", "attendance");

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
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [designationFilter, setDesignationFilter] = useState("ALL");

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, departmentFilter, designationFilter, itemsPerPage]);

  useEffect(() => {
    refreshEmployees();
    fetchDayStatus();
  }, []);

  useEffect(() => {
    const handleOutsideClick = () => {
      setOpenDropdownId(null);
    };
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
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
      if (emp.department) deps.add(emp.department);
      if (emp.designation) desigs.add(emp.designation);

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
      const matchDep = departmentFilter === "ALL" || emp.department === departmentFilter;
      const matchDesig = designationFilter === "ALL" || emp.designation === designationFilter;

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
     PAGINATION CALCULATION
  =============================== */
  const totalItems = filteredEmployees.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);

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
  const disableControls = isLocked || isHolidayActive || !canEdit;

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

      {/* ================= HEADER ================= */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Daily Attendance</h2>
          <p className="page-subtitle">HR marks employee attendance</p>
        </div>
        <span className="date-badge">{today}</span>
      </div>

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
        <div className="summary-card leave">
          <h3>{summary.LEAVE}</h3>
          <span>Leave</span>
        </div>
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
          <option value="HALF_DAY">Half Day</option>
          <option value="PAID_LEAVE">Paid Leave</option>
          <option value="UNPAID_LEAVE">Unpaid Leave</option>
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
            {currentEmployees.map((emp, idx) => {
              const record = getRecord(emp.id);
              const status = record?.status || "";
              const isLastRow = idx === currentEmployees.length - 1;

              return (
                <tr key={emp.id}>
                  <td className="employee-name">{emp.full_name || "-"}</td>
                  <td>{emp.employee_id || "-"}</td>
                  <td>{emp.department || "-"}</td>
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
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await markAttendance(today, emp.id, "PRESENT");
                                toast.success("Marked Present");
                              } catch {
                                toast.error("Failed to mark attendance");
                              }
                            }}
                            disabled={isLocked || !canEdit}
                          >
                            Present
                          </button>
                          <button
                            className={`att-btn absent ${status === "ABSENT" ? "active" : ""}`}
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await markAttendance(today, emp.id, "ABSENT");
                                toast.success("Marked Absent");
                              } catch (err) {
                                toast.error(err.response?.data?.error || "Failed to mark attendance");
                              }
                            }}
                            disabled={isLocked || !canEdit}
                          >
                            Absent
                          </button>

                          <div className="action-dropdown-container">
                            <button
                              className={`att-btn more-actions-btn ${["HALF_DAY", "PAID_LEAVE", "UNPAID_LEAVE"].includes(status) ? "active" : ""}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdownId(openDropdownId === emp.id ? null : emp.id);
                              }}
                              disabled={isLocked || !canEdit}
                            >
                              •••
                            </button>
                            {openDropdownId === emp.id && (
                              <div className={`action-dropdown-menu ${isLastRow ? "open-upwards" : ""}`}>
                                <button
                                  className={`dropdown-item ${status === "HALF_DAY" ? "active" : ""}`}
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    setOpenDropdownId(null);
                                    try {
                                      await markAttendance(today, emp.id, "HALF_DAY");
                                      toast.success("Marked Half Day");
                                    } catch {
                                      toast.error("Failed to mark attendance");
                                    }
                                  }}
                                >
                                  Half Day
                                </button>
                                <button
                                  className={`dropdown-item ${status === "PAID_LEAVE" ? "active" : ""}`}
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    setOpenDropdownId(null);
                                    try {
                                      await markAttendance(today, emp.id, "PAID_LEAVE");
                                      toast.success("Marked Paid Leave");
                                    } catch {
                                      toast.error("Failed to mark attendance");
                                    }
                                  }}
                                >
                                  Paid Leave
                                </button>
                                <button
                                  className={`dropdown-item ${status === "UNPAID_LEAVE" ? "active" : ""}`}
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    setOpenDropdownId(null);
                                    try {
                                      await markAttendance(today, emp.id, "UNPAID_LEAVE");
                                      toast.success("Marked Unpaid Leave");
                                    } catch {
                                      toast.error("Failed to mark attendance");
                                    }
                                  }}
                                >
                                  Unpaid Leave
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <button
                          className={`att-btn present-holiday ${status === "PRESENT_ON_HOLIDAY" ? "active" : ""}`}
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await markAttendance(today, emp.id, "PRESENT_ON_HOLIDAY");
                              toast.success("Marked Present on Holiday");
                            } catch {
                              toast.error("Failed to mark attendance");
                            }
                          }}
                          disabled={isLocked || !canEdit}
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

      {/* ================= PAGINATION ================= */}
      {filteredEmployees.length > 0 && (
        <div className="attendance-pagination-container">
          <div className="pagination-left">
            <span>Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="items-per-page-select"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>entries per page</span>
          </div>

          <div className="pagination-right">
            <button
              className="page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            >
              Previous
            </button>
            <div className="page-number-group">
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pg) => (
                <button
                  key={pg}
                  className={`page-btn ${pg === currentPage ? "active" : ""}`}
                  onClick={() => setCurrentPage(pg)}
                >
                  {pg}
                </button>
              ))}
            </div>
            <span className="page-summary">Page {currentPage} of {totalPages}</span>
            <button
              className="page-btn"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}