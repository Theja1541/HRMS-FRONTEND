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
      filtered = filtered.filter((e) => e.employee_name.toLowerCase().includes(search) || e.employee_id.toLowerCase().includes(search));
    }
    setCurrentPage(1);
    return filtered;
  }, [data, filters]);

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

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const [year, monthNum] = month.split("-");
  const transactionDate = new Date(year, monthNum - 1, 28).toLocaleDateString("en-GB");
  const reference = `Salary${new Date(year, monthNum - 1).toLocaleString("en-US", { month: "short" })}${year}`;

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

      <div className="table-container">
        <table className="payment-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Amount</th>
              <th>Account Details</th>
              <th>Date</th>
              <th>Reference</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="skeleton-row">
                  {[...Array(7)].map((_, j) => (
                    <td key={j}><div className="skeleton" /></td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr><td colSpan="7" className="no-data">No salary data found</td></tr>
            ) : (
              paginatedData.map((emp) => (
                <tr key={emp.employee_id}>
                  <td>
                    <div className="employee-info">
                      <div className="name">{emp.employee_name}</div>
                      <div className="code-cell">{emp.employee_id}</div>
                    </div>
                  </td>
                  <td className="amount">₹ {parseFloat(emp.net_pay).toLocaleString("en-IN")}</td>
                  <td>
                    <div className="account-info">
                      <div className="account-cell">{emp.account_number !== "N/A" ? `${emp.account_number.slice(0, 4)}...${emp.account_number.slice(-4)}` : "N/A"}</div>
                      <div className="ifsc-cell">{emp.ifsc}</div>
                    </div>
                  </td>
                  <td>{transactionDate}</td>
                  <td className="ref-cell">{reference}</td>
                  <td><span className={`status-badge ${emp.status?.toLowerCase().replace(" ", "-")}`}>{emp.status}</span></td>
                  <td className="actions">
                    <button className="btn-action view" onClick={() => handleViewPayslip(emp.payslip_id)} title="View Payslip">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    </button>
                    {emp.status === "APPROVED" && (
                      <button className="btn-action paid" onClick={() => setConfirmModal({ isOpen: true, payslipId: emp.payslip_id, employeeName: emp.employee_name })} title="Mark as Paid">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"/>
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
        <div className="pagination">
          <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>‹ Previous</button>
          <div className="page-numbers">
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const page = i + 1;
              return <button key={page} onClick={() => goToPage(page)} className={currentPage === page ? "active" : ""}>{page}</button>;
            })}
            {totalPages > 5 && <span>...</span>}
            {totalPages > 5 && <button onClick={() => goToPage(totalPages)} className={currentPage === totalPages ? "active" : ""}>{totalPages}</button>}
          </div>
          <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next ›</button>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, payslipId: null, employeeName: "" })}
        onConfirm={handleMarkPaid}
        employeeName={confirmModal.employeeName}
      />
    </div>
  );
}
