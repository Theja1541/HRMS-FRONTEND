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
import EditedAttendanceModal from "../../components/attendance/EditedAttendanceModal";

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    employee_id: null,
    date: "",
    status: "PRESENT",
    check_in: "",
    edit_reason: "",
  });
  const [saving, setSaving] = useState(false);
  const [bulkEdit, setBulkEdit] = useState(false);
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showEditHistoryModal, setShowEditHistoryModal] = useState(false);
  const [editHistory, setEditHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyMonth, setHistoryMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

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
      .filter((e) => {
        const searchLower = searchTerm.toLowerCase();
        const fullName = `${e.first_name} ${e.last_name}`.toLowerCase();
        const empId = (e.employee_id || "").toLowerCase();
        return fullName.includes(searchLower) || empId.includes(searchLower);
      });
  }, [employees, searchTerm]);

  useEffect(() => {
    if (searchTerm && filteredEmployees.length === 1) {
      setSelectedEmployee(filteredEmployees[0].id.toString());
    } else if (searchTerm && filteredEmployees.length > 0) {
      setSelectedEmployee(filteredEmployees[0].id.toString());
    } else if (!searchTerm) {
      setSelectedEmployee("ALL");
    }
  }, [searchTerm, filteredEmployees]);

  useEffect(() => {
    const fetchPendingLeaves = async () => {
      try {
        const res = await axios.get("/leaves/requests/?status=PENDING");
        setPendingLeaves(res.data?.length || 0);
      } catch (err) {
        console.error("Failed to fetch pending leaves", err);
      }
    };
    fetchPendingLeaves();
  }, []);

  useEffect(() => {
    if (
      selectedEmployee !== "ALL" &&
      !filteredEmployees.some(
        (emp) => emp.id === Number(selectedEmployee)
      )
    ) {
      if (filteredEmployees.length > 0) {
        setSelectedEmployee(filteredEmployees[0].id.toString());
      } else {
        setSelectedEmployee("ALL");
      }
    }
  }, [filteredEmployees, selectedEmployee]);

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
    const record = attendance?.[date]?.[String(empId)];
    return {
      status: record?.status || "-",
      isEdited: record?.is_edited || false
    };
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

  const handleSaveAttendance = async () => {
    if (!editData.edit_reason || editData.edit_reason.trim() === "") {
      showToast({
        message: "Edit reason is required",
        type: "error",
      });
      return;
    }

    try {
      setSaving(true);

      if (bulkEdit) {
        await axios.post("/attendance/bulk-mark/", {
          date: editData.date,
          status: editData.status,
          edit_reason: editData.edit_reason,
        });
        showToast({
          message: "Bulk attendance updated successfully",
          type: "success",
        });
      } else {
        await axios.post("/attendance/mark/", editData);
        showToast({
          message: "Attendance updated successfully",
          type: "success",
        });
      }

      setShowEditModal(false);
      window.location.reload();
    } catch (err) {
      showToast({
        message: err.response?.data?.error || "Failed to update attendance",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    setEditData({
      employee_id: activeEmployees.length > 0 ? activeEmployees[0].id : null,
      date: todayStr,
      status: "PRESENT",
      check_in: "",
      edit_reason: "",
    });
    setBulkEdit(false);
    setShowEditModal(true);
  };

  const handleBulkEditClick = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    setEditData({
      employee_id: null,
      date: todayStr,
      status: "PRESENT",
      check_in: "",
      edit_reason: "",
    });
    setBulkEdit(true);
    setShowEditModal(true);
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
     FETCH EDIT HISTORY
  ======================= */
  const handleViewEditHistory = async () => {
    setShowEditHistoryModal(true);
    setShowMoreMenu(false);
    fetchEditHistory(historyMonth);
  };

  const fetchEditHistory = async (selectedMonth) => {
    try {
      setLoadingHistory(true);
      const res = await axios.get(`/attendance/edited-history/?month=${selectedMonth}`);
      setEditHistory(res.data || []);
    } catch (err) {
      showToast({
        message: "Failed to fetch edit history",
        type: "error",
      });
    } finally {
      setLoadingHistory(false);
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
        <h2>📅 Monthly Attendance</h2>
        <div className="header-controls">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="month-input"
          />
          <input
            type="text"
            placeholder="🔍 Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <div className="more-menu-wrapper">
            <button
              className="btn-more"
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              disabled={isLocked}
            >
              ⋯ More
            </button>
            {showMoreMenu && (
              <div className="more-dropdown">
                <button onClick={() => { handleEditClick(); setShowMoreMenu(false); }}>Edit Attendance</button>
                <button onClick={() => { handleBulkEditClick(); setShowMoreMenu(false); }}>Bulk Edit All</button>
                <button onClick={handleViewEditHistory}>View Edited Attendance</button>
                <button onClick={() => { setShowConfirmModal(true); setShowMoreMenu(false); }}>Send Monthly Emails</button>
                <button onClick={() => { setShowGenerateModal(true); setShowMoreMenu(false); }}>Generate Today</button>
              </div>
            )}
          </div>
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

      {/* CONFIRM EMAIL MODAL */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Send Monthly Attendance Emails?</h3>
            <p>This will send attendance reports to all employees for {month}.</p>
            <div className="modal-actions">
              <button onClick={() => setShowConfirmModal(false)}>Cancel</button>
              <button onClick={handleSendMonthlyEmail} disabled={sending}>
                {sending ? "Sending..." : "Confirm Send"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GENERATE TODAY MODAL */}
      {showGenerateModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Generate Today's Attendance?</h3>
            <p>This will auto-mark attendance for all active employees based on holidays, weekends, and leaves.</p>
            <div className="modal-actions">
              <button onClick={() => setShowGenerateModal(false)}>Cancel</button>
              <button onClick={handleGenerateToday} disabled={loadingGenerate}>
                {loadingGenerate ? "Generating..." : "Confirm Generate"}
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* EDIT ATTENDANCE MODAL */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>{bulkEdit ? "Bulk Edit Attendance" : "Edit Attendance"}</h3>
            {!bulkEdit && (
              <div className="form-group">
                <label>Employee</label>
                <select
                  value={editData.employee_id || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, employee_id: Number(e.target.value) })
                  }
                >
                  <option value="">Select Employee</option>
                  {activeEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {bulkEdit && (
              <p style={{ color: "#f59e0b", marginBottom: "10px" }}>
                This will mark attendance for ALL active employees
              </p>
            )}
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={editData.date}
                onChange={(e) =>
                  setEditData({ ...editData, date: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                value={editData.status}
                onChange={(e) =>
                  setEditData({ ...editData, status: e.target.value })
                }
              >
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="HALF_DAY">Half Day</option>
                <option value="PAID_LEAVE">Paid Leave</option>
                <option value="UNPAID_LEAVE">Unpaid Leave</option>
                <option value="HOLIDAY">Holiday</option>
                <option value="WEEK_OFF">Week Off</option>
              </select>
            </div>
            {!bulkEdit && (
              <div className="form-group">
                <label>Check-in Time (Optional)</label>
                <input
                  type="time"
                  value={editData.check_in}
                  onChange={(e) =>
                    setEditData({ ...editData, check_in: e.target.value })
                  }
                />
              </div>
            )}
            <div className="form-group">
              <label>Edit Reason *</label>
              <textarea
                placeholder="Enter reason for editing attendance (e.g., employee forgot to punch, system error, manual correction)"
                value={editData.edit_reason}
                onChange={(e) =>
                  setEditData({ ...editData, edit_reason: e.target.value })
                }
                rows={3}
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                required
              />
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowEditModal(false)}>Cancel</button>
              <button onClick={handleSaveAttendance} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT HISTORY MODAL */}
      <EditedAttendanceModal
        isOpen={showEditHistoryModal}
        onClose={() => setShowEditHistoryModal(false)}
        editHistory={editHistory}
        loading={loadingHistory}
        onMonthChange={fetchEditHistory}
        currentMonth={historyMonth}
      />

      {/* CALENDAR VIEW */}
      {selectedEmployee !== "ALL" && (
        <div className="calendar-container">
          <div className="calendar-header">
            <h3>
              {activeEmployees[0]?.first_name} {activeEmployees[0]?.last_name} ({activeEmployees[0]?.employee_id})
            </h3>
            <span>{new Date(year, monthIndex).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </div>
          <div className="calendar-grid">
            <div className="calendar-weekdays">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>
            <div className="calendar-days">
              {Array.from({ length: new Date(year, monthIndex, 1).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="calendar-day empty"></div>
              ))}
              {days.map((day) => {
                const statusData = getStatus(activeEmployees[0]?.id, day);
                const status = statusData.status;
                const isEdited = statusData.isEdited;
                const date = new Date(year, monthIndex, day);
                const isToday = date.toDateString() === new Date().toDateString();
                return (
                  <div
                    key={day}
                    className={`calendar-day ${status.toLowerCase()} ${isToday ? 'today' : ''}`}
                  >
                    <div className="day-number">
                      {day}
                      {isEdited && (
                        <span style={{
                          marginLeft: "5px",
                          fontSize: "10px",
                          backgroundColor: "#f59e0b",
                          color: "white",
                          padding: "2px 5px",
                          borderRadius: "3px",
                          fontWeight: "bold"
                        }}>
                          Edited
                        </span>
                      )}
                    </div>
                    <div className="day-status">
                      {status === "PRESENT" ? "Present" :
                       status === "ABSENT" ? "Absent" :
                       status === "PAID_LEAVE" ? "Paid Leave" :
                       status === "UNPAID_LEAVE" ? "Unpaid Leave" :
                       status === "HALF_DAY" ? "Half Day" :
                       status === "HOLIDAY" ? "Holiday" :
                       status === "WEEK_OFF" ? "Week Off" : "-"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {selectedEmployee === "ALL" && (
        <div className="calendar-placeholder">
          <div className="placeholder-content">
            <div className="placeholder-icon">👥</div>
            <h3>Select an Employee</h3>
            <p>Search and select an employee to view their monthly attendance calendar</p>
          </div>
        </div>
      )}
    </div>
  );
}