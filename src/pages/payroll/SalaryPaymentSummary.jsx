import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import { downloadPayslipPDF, markPayslipPaid } from "../../api/payroll";
import "../../styles/salary-payment-summary.css";



const ConfirmModal = ({ isOpen, onClose, onConfirm, employeeName }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Confirm Payment</h3>
        <p>Mark salary as PAID for <strong>{employeeName}</strong>?</p>
        <div className="modal-actions">
          <button onClick={onClose} className="btn-cancel">Cancel</button>
          <button onClick={onConfirm} className="btn-confirm">Confirm</button>
        </div>
      </div>
    </div>
  );
};

export default function SalaryPaymentSummary() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [data, setData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({ department: "ALL", status: "ALL", search: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, payslipId: null, employeeName: "" });
  const itemsPerPage = 10;
  const companyAccount = "1234567890";

  useEffect(() => {
    fetchData();
  }, [month]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/payroll/status/", { params: { month, status: "ALL" } });
      const employees = res.data.employees || [];
      const processed = employees
        .filter((emp) => emp.payslip_generated)
        .map((emp) => ({
          employee_id: emp.employee_id,
          employee_name: emp.employee_name,
          account_number: emp.account_number || "N/A",
          ifsc: emp.ifsc || "N/A",
          net_pay: emp.net_pay || 0,
          status: emp.payslip_status,
          payslip_id: emp.payslip_id,
          department: emp.department || "N/A",
        }));
      setData(processed);
      setDepartments([...new Set(processed.map((e) => e.department))]);
    } catch {
      toast.error("Failed to load salary data");
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    let filtered = data;
    if (filters.department !== "ALL") filtered = filtered.filter((e) => e.department === filters.department);
    if (filters.status !== "ALL") filtered = filtered.filter((e) => e.status === filters.status);
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter((e) => e.employee_name.toLowerCase().includes(search) || String(e.employee_id).toLowerCase().includes(search));
    }
    return filtered;
  }, [data, filters]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const stats = useMemo(() => {
    const paid = filteredData.filter((e) => e.status === "PAID").length;
    const pending = filteredData.filter((e) => e.status !== "PAID").length;
    const total = filteredData.reduce((sum, e) => sum + parseFloat(e.net_pay || 0), 0);
    return { total: filteredData.length, paid, pending, totalAmount: total };
  }, [filteredData]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const [year, monthNum] = month.split("-");
  const transactionDate = new Date(year, monthNum - 1, 28).toLocaleDateString("en-GB");
  const reference = `Salary${new Date(year, monthNum - 1).toLocaleString("en-US", { month: "short" })}${year}`;

  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    if (currentPage <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push("…", totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, "…");
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, "…", currentPage - 1, currentPage, currentPage + 1, "…", totalPages);
    }
    return pages;
  };

  const formatAccount = (acc) => {
    if (!acc || acc === "N/A") return "—";
    if (acc.length <= 8) return acc;
    return `${acc.slice(0, 4)}••••${acc.slice(-4)}`;
  };

  const handleMarkPaid = async () => {
    try {
      await markPayslipPaid(confirmModal.payslipId);
      toast.success("Marked as PAID");
      setConfirmModal({ isOpen: false, payslipId: null, employeeName: "" });
      fetchData();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleViewPayslip = async (payslipId) => {
    try {
      const res = await downloadPayslipPDF(payslipId);
      const blob = new Blob([res.data], { type: "application/pdf" });
      window.open(window.URL.createObjectURL(blob), "_blank");
    } catch {
      toast.error("Failed to load payslip");
    }
  };

  const exportToExcel = () => {
    const headers = ["Debit Account", "Amount", "Currency", "Beneficiary Name", "Account Number", "IFSC", "Date", "Mode", "Reference", "Code", "Status"];
    const rows = filteredData.map((e) => [
      companyAccount, e.net_pay, "INR", e.employee_name, e.account_number, e.ifsc, transactionDate, "NEFT", reference, e.employee_id, e.status
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Salary_Payment_${month}.csv`;
    a.click();
    toast.success("Exported to Excel");
  };

  const resetFilters = () => {
    setFilters({ department: "ALL", status: "ALL", search: "" });
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="salary-payment-summary">
      <div className="summary-header">
        <div>
          <h2>💰 Salary Payment Summary</h2>
          <p>Bank transfer sheet for {new Date(month).toLocaleString("en-US", { month: "long", year: "numeric" })}</p>
        </div>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="month-input" />
      </div>

      <div className="summary-stats">
        <div className="stat-card blue">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h4>Total Employees</h4>
            <p>{stats.total}</p>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">💵</div>
          <div className="stat-content">
            <h4>Total Payout</h4>
            <p>₹ {stats.totalAmount.toLocaleString("en-IN")}</p>
          </div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <h4>Paid</h4>
            <p>{stats.paid} employees</p>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h4>Pending</h4>
            <p>{stats.pending} employees</p>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="filters-left">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="🔍 Search by name or ID..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="search-input"
            />
          </div>
          <select value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })}>
            <option value="ALL">All Departments</option>
            {departments.map((dept) => <option key={dept} value={dept}>{dept}</option>)}
          </select>
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="ALL">All Status</option>
            <option value="APPROVED">Approved</option>
            <option value="PAID">Paid</option>
            <option value="NOT PAID">Not Paid</option>
          </select>
          <button onClick={resetFilters} className="btn-reset">Reset</button>
        </div>
        <button onClick={exportToExcel} className="btn-export">📥 Export Excel</button>
      </div>

      <div className="table-wrapper" role="region" aria-label="Salary payment table">
        <div className="table-container">
          <table className="payment-table">
            <thead>
              <tr>
                <th className="th-employee">Employee</th>
                <th className="th-amount">Net Pay</th>
                <th className="th-account">Bank Account</th>
                <th className="th-date">Payment Date</th>
                <th className="th-ref">Reference</th>
                <th className="th-status">Status</th>
                <th className="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="skeleton-row">
                    <td><div className="skeleton skeleton-name" /></td>
                    <td><div className="skeleton skeleton-amount" /></td>
                    <td><div className="skeleton skeleton-account" /></td>
                    <td><div className="skeleton skeleton-date" /></td>
                    <td><div className="skeleton skeleton-ref" /></td>
                    <td><div className="skeleton skeleton-status" /></td>
                    <td><div className="skeleton skeleton-actions" /></td>
                  </tr>
                ))
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    <div className="no-data-content">
                      <span className="no-data-icon" aria-hidden>📋</span>
                      <p>No salary records for this month</p>
                      <span className="no-data-hint">Select another month or generate payslips first.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((emp) => (
                  <tr key={emp.payslip_id ?? emp.employee_id}>
                    <td className="cell-employee">
                      <div className="employee-info">
                        <span className="employee-avatar" aria-hidden>
                          {(emp.employee_name || "?").charAt(0).toUpperCase()}
                        </span>
                        <div className="employee-meta">
                          <span className="name">{emp.employee_name}</span>
                          <span className="code-cell">ID: {emp.employee_id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="cell-amount amount">
                      <span className="amount-value">₹ {parseFloat(emp.net_pay).toLocaleString("en-IN")}</span>
                    </td>
                    <td className="cell-account">
                      <div className="account-info">
                        <span className="account-cell">{formatAccount(emp.account_number)}</span>
                        <span className="ifsc-cell">{emp.ifsc && emp.ifsc !== "N/A" ? emp.ifsc : "—"}</span>
                      </div>
                    </td>
                    <td className="cell-date">{transactionDate}</td>
                    <td className="cell-ref ref-cell">{reference}</td>
                    <td className="cell-status">
                      <span className={`status-badge status-${(emp.status || "").toLowerCase().replace(/\s+/g, "-")}`} role="status">
                        {emp.status}
                      </span>
                    </td>
                    <td className="cell-actions actions">
                      <button
                        type="button"
                        className="btn-action view"
                        onClick={() => handleViewPayslip(emp.payslip_id)}
                        title="View payslip"
                        aria-label={`View payslip for ${emp.employee_name}`}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                      {emp.status === "APPROVED" && (
                        <button
                          type="button"
                          className="btn-action paid"
                          onClick={() => setConfirmModal({ isOpen: true, payslipId: emp.payslip_id, employeeName: emp.employee_name })}
                          title="Mark as paid"
                          aria-label={`Mark ${emp.employee_name} as paid`}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="pagination" role="navigation" aria-label="Table pagination">
            <button
              type="button"
              className="pagination-btn pagination-prev"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              Previous
            </button>
            <div className="page-numbers">
              {getPageNumbers().map((page, idx) =>
                page === "…" ? (
                  <span key={`ellipsis-${idx}`} className="page-ellipsis" aria-hidden>…</span>
                ) : (
                  <button
                    key={page}
                    type="button"
                    className={`pagination-btn page-num ${currentPage === page ? "active" : ""}`}
                    onClick={() => goToPage(page)}
                    aria-label={`Page ${page}`}
                    aria-current={currentPage === page ? "page" : undefined}
                  >
                    {page}
                  </button>
                )
              )}
            </div>
            <button
              type="button"
              className="pagination-btn pagination-next"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, payslipId: null, employeeName: "" })}
        onConfirm={handleMarkPaid}
        employeeName={confirmModal.employeeName}
      />
    </div>
  );
}
