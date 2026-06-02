import { useState, useEffect, useMemo } from "react";
import axios from "../../api/axios";
import { downloadPayslipPDF } from "../../api/payroll";
import "../../styles/mySalary.css";
import CountUp from "react-countup";

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
      setError(null);
      const res = await axios.get("/payroll/my-salary/");
      setPayments(res.data.payments || []);
      setSummary(res.data.summary || null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load salary statement logs");
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
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to download payslip copy");
    } finally {
      setDownloadingId(null);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Processing...";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PAID: { bg: "#dcfce7", text: "#166534", label: "Paid" },
      APPROVED: { bg: "#dbeafe", text: "#1e40af", label: "Approved" },
      PENDING: { bg: "#fef3c7", text: "#92400e", label: "Pending" }
    };
    const style = statusMap[status] || statusMap.PENDING;
    return (
      <span
        className="salary-status-badge"
        style={{ backgroundColor: style.bg, color: style.text }}
      >
        {style.label}
      </span>
    );
  };

  const safeNumber = (val) => parseFloat(val || 0);

  if (loading) {
    return (
      <div className="my-salary-container">
        <div className="salary-loading">
          <div className="salary-spinner"></div>
          <p>Loading financial records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-salary-container">
        <div className="salary-error">
          <div className="error-icon">⚠️</div>
          <h3>Error Fetching Statements</h3>
          <p>{error}</p>
          <button onClick={fetchSalaryData} className="retry-btn">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const quickPillOptions = [
    { value: "", label: "All Statements" },
    { value: "PAID", label: "Paid" },
    { value: "APPROVED", label: "Approved" },
    { value: "PENDING", label: "Pending" }
  ];

  return (
    <div className="my-salary-container">
      {/* HERO HEADER */}
      <div className="salary-header">
        <div>
          <h2>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle" }}>
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            My Salary Payments
          </h2>
          <p>Track your banking payout history, view status updates, and download copies</p>
        </div>
      </div>

      {/* FLOAT COMPACT KPIS */}
      {summary && (
        <div className="salary-summary-grid">
          <div className="salary-summary-card">
            <div className="summary-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
            </div>
            <div className="summary-content">
              <h4>Total Earnings YTD</h4>
              <p className="summary-amount">
                ₹<CountUp end={safeNumber(summary.total_salary_ytd)} duration={1.5} separator="," />
              </p>
            </div>
          </div>

          <div className="salary-summary-card">
            <div className="summary-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                <line x1="12" y1="18" x2="12" y2="18"></line>
                <line x1="12" y1="12" x2="12" y2="12"></line>
                <line x1="12" y1="6" x2="12" y2="6"></line>
              </svg>
            </div>
            <div className="summary-content">
              <h4>Last Net Payout</h4>
              <p className="summary-amount">
                ₹<CountUp end={safeNumber(summary.last_payment_amount)} duration={1.5} separator="," />
              </p>
            </div>
          </div>

          <div className="salary-summary-card">
            <div className="summary-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <div className="summary-content">
              <h4>Last Payout Date</h4>
              <p className="summary-date">{formatDate(summary.last_payment_date)}</p>
            </div>
          </div>
        </div>
      )}

      {/* SEARCH AND FILTERS */}
      <div className="salary-filters">
        <div className="filter-group" style={{ flex: 1.5 }}>
          <label>🔍 Search Month / Year</label>
          <input
            type="text"
            placeholder="e.g., January 2026"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-input"
          />
        </div>

        {/* Quick pill filters for super professional status toggling */}
        <div className="filter-group">
          <label>📌 Filter By Status</label>
          <div className="salary-pill-filters">
            {quickPillOptions.map((pill) => (
              <button
                key={pill.value}
                type="button"
                className={`salary-pill-btn ${statusFilter === pill.value ? "active" : ""}`}
                onClick={() => {
                  setStatusFilter(pill.value);
                  setCurrentPage(1);
                }}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-count">
          {filteredPayments.length} Statement Logs
        </div>
      </div>

      {filteredPayments.length === 0 ? (
        <div className="salary-empty">
          <div className="empty-icon">📂</div>
          <h3>No Records Discovered</h3>
          <p>
            {searchTerm || statusFilter
              ? "We couldn't find statements matching your active filter criteria."
              : "Your monthly salary payout statements will appear here once processed."}
          </p>
        </div>
      ) : (
        <>
          {/* STATEMENTS TABLE */}
          <div className="salary-table-wrapper">
            <table className="salary-table">
              <thead>
                <tr>
                  <th>Payout Period</th>
                  <th>Net Compensation</th>
                  <th>Payout Date</th>
                  <th>Payout Status</th>
                  <th style={{ textAlign: "right" }}>Payslip Document</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="month-cell">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: "8px", color: "var(--indigo-brand)", verticalAlign: "middle" }}>
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      {payment.month}
                    </td>
                    <td className="amount-cell">
                      {formatCurrency(payment.net_salary)}
                    </td>
                    <td className="date-cell">
                      {payment.payment_date ? (
                        <>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: "6px", verticalAlign: "middle", opacity: 0.7 }}>
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                          </svg>
                          {formatDate(payment.payment_date)}
                        </>
                      ) : (
                        <span style={{ fontStyle: "italic", opacity: 0.6 }}>Payout Pending</span>
                      )}
                    </td>
                    <td>{getStatusBadge(payment.status)}</td>
                    <td style={{ textAlign: "right" }}>
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
                          <>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                              <polyline points="7 10 12 15 17 10"></polyline>
                              <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            Download PDF
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION PANEL */}
          {totalPages > 1 && (
            <div className="salary-pagination">
              <div className="pagination-info">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredPayments.length)} of{" "}
                {filteredPayments.length} statements
              </div>
              <div className="pagination-controls">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="page-btn"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                  Prev
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
                        type="button"
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
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="page-btn"
                >
                  Next
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
