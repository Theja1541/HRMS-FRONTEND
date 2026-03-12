import { useState, useEffect, useMemo } from "react";
import axios from "../../api/axios";
import { downloadPayslipPDF } from "../../api/payroll";
import "../../styles/mySalary.css";

export default function MySalary() {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchSalaryData();
  }, []);

  const fetchSalaryData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/payroll/my-salary/");
      setPayments(res.data.payments || []);
      setSummary(res.data.summary || null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load salary data");
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const monthMatch = payment.month.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = !statusFilter || payment.status === statusFilter;
      return monthMatch && statusMatch;
    });
  }, [payments, searchTerm, statusFilter]);

  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPayments.slice(start, start + itemsPerPage);
  }, [filteredPayments, currentPage]);

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  const handleDownload = async (paymentId, month) => {
    try {
      setDownloadingId(paymentId);
      const res = await downloadPayslipPDF(paymentId);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Payslip_${month}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to download payslip");
    } finally {
      setDownloadingId(null);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PAID: { bg: "#d1fae5", text: "#065f46", label: "Paid" },
      APPROVED: { bg: "#dbeafe", text: "#1e40af", label: "Approved" },
      PENDING: { bg: "#fef3c7", text: "#92400e", label: "Pending" },
    };
    const style = statusMap[status] || statusMap.PENDING;
    return (
      <span
        className="salary-status-badge"
        style={{ background: style.bg, color: style.text }}
      >
        {style.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="my-salary-container">
        <div className="salary-loading">
          <div className="salary-spinner"></div>
          <p>Loading salary data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-salary-container">
        <div className="salary-error">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button onClick={fetchSalaryData} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-salary-container">
      <div className="salary-header">
        <div>
          <h2>💰 My Salary Payments</h2>
          <p>Track your salary payment history and download payslips</p>
        </div>
      </div>

      {summary && (
        <div className="salary-summary-grid">
          <div className="salary-summary-card">
            <div className="summary-icon">📊</div>
            <div className="summary-content">
              <h4>Total Salary (YTD)</h4>
              <p className="summary-amount">{formatCurrency(summary.total_salary_ytd)}</p>
            </div>
          </div>
          <div className="salary-summary-card">
            <div className="summary-icon">💵</div>
            <div className="summary-content">
              <h4>Last Payment</h4>
              <p className="summary-amount">{formatCurrency(summary.last_payment_amount)}</p>
            </div>
          </div>
          <div className="salary-summary-card">
            <div className="summary-icon">📅</div>
            <div className="summary-content">
              <h4>Last Payment Date</h4>
              <p className="summary-date">{formatDate(summary.last_payment_date)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="salary-filters">
        <div className="filter-group">
          <label>🔍 Search Month/Year</label>
          <input
            type="text"
            placeholder="e.g., January 2024"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <label>📌 Status</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="PAID">Paid</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>
        <div className="filter-count">{filteredPayments.length} Records</div>
      </div>

      {filteredPayments.length === 0 ? (
        <div className="salary-empty">
          <div className="empty-icon">📭</div>
          <h3>No Payment Records Found</h3>
          <p>
            {searchTerm || statusFilter
              ? "Try adjusting your filters"
              : "Your salary payments will appear here"}
          </p>
        </div>
      ) : (
        <>
          <div className="salary-table-wrapper">
            <table className="salary-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Net Salary</th>
                  <th>Payment Date</th>
                  <th>Status</th>
                  <th>Payslip</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="month-cell">{payment.month}</td>
                    <td className="amount-cell">{formatCurrency(payment.net_salary)}</td>
                    <td className="date-cell">{formatDate(payment.payment_date)}</td>
                    <td>{getStatusBadge(payment.status)}</td>
                    <td>
                      <button
                        className="download-btn"
                        onClick={() => handleDownload(payment.id, payment.month)}
                        disabled={downloadingId === payment.id || payment.status === "PENDING"}
                      >
                        {downloadingId === payment.id ? (
                          <>
                            <span className="btn-spinner"></span> Downloading...
                          </>
                        ) : (
                          <>📥 Download</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="salary-pagination">
              <div className="pagination-info">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredPayments.length)} of{" "}
                {filteredPayments.length}
              </div>
              <div className="pagination-controls">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="page-btn"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`page-btn ${currentPage === page ? "active" : ""}`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="page-dots">...</span>;
                  }
                  return null;
                })}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="page-btn"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
