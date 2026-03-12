import { useState, useMemo } from "react";
import "../../styles/editedAttendanceModal.css";

export default function EditedAttendanceModal({ 
  isOpen, 
  onClose, 
  editHistory, 
  loading,
  onMonthChange,
  currentMonth 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchId, setSearchId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState(null);
  const itemsPerPage = 20;

  const filteredData = useMemo(() => {
    return editHistory.filter((record) => {
      const matchesName = record.employee_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesId = record.employee_id.toLowerCase().includes(searchId.toLowerCase());
      const matchesStatus = !statusFilter || 
        `${record.previous_status}_${record.updated_status}` === statusFilter;
      return matchesName && matchesId && matchesStatus;
    });
  }, [editHistory, searchTerm, searchId, statusFilter]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const getStatusBadge = (status, type) => {
    const colors = {
      PRESENT: { bg: type === "prev" ? "#fee2e2" : "#d1fae5", text: type === "prev" ? "#991b1b" : "#065f46" },
      ABSENT: { bg: type === "prev" ? "#fee2e2" : "#fee2e2", text: type === "prev" ? "#991b1b" : "#991b1b" },
      PAID_LEAVE: { bg: "#fed7aa", text: "#9a3412" },
      UNPAID_LEAVE: { bg: "#fed7aa", text: "#9a3412" },
      HALF_DAY: { bg: "#fef3c7", text: "#92400e" },
      HOLIDAY: { bg: "#e0e7ff", text: "#3730a3" },
      WEEK_OFF: { bg: "#f3f4f6", text: "#374151" }
    };
    const color = colors[status] || { bg: "#f3f4f6", text: "#374151" };
    return (
      <span className="status-badge" style={{ background: color.bg, color: color.text }}>
        {status?.replace("_", " ")}
      </span>
    );
  };

  const exportToCSV = () => {
    const headers = ["Employee,Employee ID,Date,Previous Status,Updated Status,Edited By,Reason,Edited Time"];
    const rows = filteredData.map(r => 
      `"${r.employee_name}","${r.employee_id}","${r.date}","${r.previous_status}","${r.updated_status}","${r.edited_by}","${r.edit_reason}","${new Date(r.edited_at).toLocaleString()}"`
    );
    const csv = [...headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_edits_${currentMonth}.csv`;
    a.click();
  };

  if (!isOpen) return null;

  return (
    <div className="eam-overlay">
      <div className="eam-container">
        <div className="eam-header">
          <div className="eam-header-content">
            <div>
              <h2>📋 Attendance Edit History</h2>
              <p>Track and audit all attendance modifications</p>
            </div>
            <button className="eam-close-btn" onClick={onClose}>×</button>
          </div>

          <div className="eam-filters">
            <div className="eam-filter-group">
              <label>📅 Month</label>
              <input 
                type="month" 
                value={currentMonth} 
                onChange={(e) => { onMonthChange(e.target.value); setCurrentPage(1); }}
                className="eam-month-input"
              />
            </div>
            <div className="eam-filter-divider"></div>
            <div className="eam-filter-group">
              <label>🔍 Employee Name</label>
              <input 
                type="text" 
                placeholder="Search name..." 
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="eam-search-input"
              />
            </div>
            <div className="eam-filter-group">
              <label>🆔 Employee ID</label>
              <input 
                type="text" 
                placeholder="Search ID..." 
                value={searchId}
                onChange={(e) => { setSearchId(e.target.value); setCurrentPage(1); }}
                className="eam-search-input"
              />
            </div>
            <div className="eam-filter-group">
              <label>🔄 Status Change</label>
              <select 
                value={statusFilter} 
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="eam-select"
              >
                <option value="">All Changes</option>
                <option value="ABSENT_PRESENT">ABSENT → PRESENT</option>
                <option value="PRESENT_ABSENT">PRESENT → ABSENT</option>
                <option value="PRESENT_PAID_LEAVE">PRESENT → LEAVE</option>
                <option value="ABSENT_PAID_LEAVE">ABSENT → LEAVE</option>
              </select>
            </div>
            <button className="eam-export-btn" onClick={exportToCSV}>
              📥 Export CSV
            </button>
            <div className="eam-count-badge">{filteredData.length} Records</div>
          </div>
        </div>

        <div className="eam-body">
          {loading ? (
            <div className="eam-empty">
              <div className="eam-empty-icon">⏳</div>
              <div className="eam-empty-title">Loading...</div>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="eam-empty">
              <div className="eam-empty-icon">📝</div>
              <div className="eam-empty-title">No Attendance Edits Found</div>
              <div className="eam-empty-text">
                {searchTerm || searchId || statusFilter 
                  ? "Try adjusting your filters" 
                  : "No edits have been made this month"}
              </div>
            </div>
          ) : (
            <div className="eam-table-wrapper">
              <table className="eam-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>ID</th>
                    <th>Date</th>
                    <th>Status Change</th>
                    <th>Edited By</th>
                    <th>Reason</th>
                    <th>Time</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((record) => (
                    <>
                      <tr 
                        key={record.id} 
                        className={`eam-row ${record.is_bulk_edit ? "bulk-edit" : "manual-edit"}`}
                      >
                        <td className="eam-employee">
                          <div className="eam-employee-name">{record.employee_name}</div>
                        </td>
                        <td className="eam-id">{record.employee_id}</td>
                        <td className="eam-date">
                          {new Date(record.date).toLocaleDateString("en-US", { 
                            month: "short", 
                            day: "numeric", 
                            year: "numeric" 
                          })}
                        </td>
                        <td className="eam-status-change">
                          <div className="eam-status-flow">
                            {getStatusBadge(record.previous_status, "prev")}
                            <span className="eam-arrow">→</span>
                            {getStatusBadge(record.updated_status, "new")}
                          </div>
                        </td>
                        <td className="eam-editor">
                          <div className="eam-editor-info">
                            <div className="eam-avatar">
                              {record.edited_by.split(" ").map(n => n[0]).join("").toUpperCase()}
                            </div>
                            <span>{record.edited_by}</span>
                          </div>
                        </td>
                        <td className="eam-reason">
                          <div className="eam-reason-text">
                            {record.edit_reason.length > 40 
                              ? `${record.edit_reason.substring(0, 40)}...` 
                              : record.edit_reason}
                          </div>
                          {record.edit_reason.length > 40 && (
                            <button 
                              className="eam-view-btn"
                              onClick={() => setExpandedRow(expandedRow === record.id ? null : record.id)}
                            >
                              {expandedRow === record.id ? "Hide" : "View"}
                            </button>
                          )}
                        </td>
                        <td className="eam-time">
                          {new Date(record.edited_at).toLocaleString("en-US", { 
                            month: "short", 
                            day: "numeric", 
                            hour: "2-digit", 
                            minute: "2-digit" 
                          })}
                        </td>
                        <td className="eam-type">
                          <span className={`eam-type-badge ${record.is_bulk_edit ? "bulk" : "manual"}`}>
                            {record.is_bulk_edit ? "Bulk Edit" : "Manual Edit"}
                          </span>
                        </td>
                      </tr>
                      {expandedRow === record.id && (
                        <tr className="eam-expanded-row">
                          <td colSpan="8">
                            <div className="eam-expanded-content">
                              <strong>Full Reason:</strong>
                              <p>{record.edit_reason}</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {filteredData.length > itemsPerPage && (
          <div className="eam-footer">
            <div className="eam-pagination-info">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length}
            </div>
            <div className="eam-pagination">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="eam-page-btn"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`eam-page-btn ${currentPage === page ? "active" : ""}`}
                    >
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="eam-page-dots">...</span>;
                }
                return null;
              })}
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="eam-page-btn"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
