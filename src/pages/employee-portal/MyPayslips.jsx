import { useEffect, useState, useMemo } from "react";
import "../../styles/employeePayslips.css";
import api from "../../api/axios";
import { getMyPayslips, downloadPayslipPDF } from "../../api/payroll";
import companyLogo from "../../assets/company-logo.png";
import { useAuth } from "../../auth/AuthContext";
import CountUp from "react-countup";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from "recharts";

export default function MyPayslips() {
  const { user } = useAuth();
  const companyName = user?.company?.name || "HRMS";

  const [slips, setSlips] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [selectedSlip, setSelectedSlip] = useState(null);

  /* =========================================
     FETCH DATA
  ========================================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [slipsRes, summaryRes] = await Promise.all([
          getMyPayslips(),
          api.get("/payroll/my-summary/")
        ]);

        const slipsData = slipsRes?.data || [];
        const filtered = slipsData.filter(
          p => p.status === "APPROVED" || p.status === "PAID"
        );
        const sorted = filtered.sort(
          (a, b) => new Date(b.month) - new Date(a.month)
        );

        setSlips(sorted);
        setSummary(summaryRes.data);
      } catch (error) {
        console.error("Payroll load failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* =========================================
     HELPERS
  ========================================= */
  const formatMonth = (monthString) => {
    if (!monthString) return "";
    const date = new Date(monthString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric"
    });
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount || 0);

  const safeNumber = (value) => parseFloat(value || 0);

  /* =========================================
     MONTH OVER MONTH ANALYSIS
  ========================================= */
  const previousSlip = useMemo(() => {
    if (!selectedSlip || slips.length === 0) return null;
    const index = slips.findIndex(p => p.id === selectedSlip.id);
    if (index === -1 || index === slips.length - 1) return null;
    return slips[index + 1]; // sorted descending, so index + 1 is the previous month's slip
  }, [selectedSlip, slips]);

  const monthDifference = useMemo(() => {
    if (!selectedSlip || !previousSlip) return null;
    const diff = safeNumber(selectedSlip.net_pay) - safeNumber(previousSlip.net_pay);
    const pct = previousSlip.net_pay > 0 ? (diff / previousSlip.net_pay) * 100 : 0;
    return {
      value: diff,
      percentage: pct,
      isIncrease: diff > 0,
      isConstant: diff === 0
    };
  }, [selectedSlip, previousSlip]);

  /* =========================================
     DOWNLOAD PDF
  ========================================= */
  const handleDownload = async (id, month) => {
    try {
      setDownloadingId(id);
      const response = await downloadPayslipPDF(id);
      const blob = new Blob([response.data], {
        type: "application/pdf"
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Payslip_${formatMonth(month)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Download failed");
    } finally {
      setDownloadingId(null);
    }
  };

  /* =========================================
     CHART DATA GENERATORS
  ========================================= */
  const chartData = useMemo(() => {
    return slips.map(s => ({
      month: new Date(s.month).toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      salary: safeNumber(s.net_pay)
    })).reverse();
  }, [slips]);

  const getPayslipBreakdown = (slip) => {
    if (!slip) return { earnings: [], deductions: [], totalEarnings: 0, totalDeductions: 0 };

    const earningsList = [
      { name: "Basic Salary", value: safeNumber(slip.basic) },
      { name: "House Rent Allowance (HRA)", value: safeNumber(slip.hra) },
      { name: "Dearness Allowance (DA)", value: safeNumber(slip.da) },
      { name: "Conveyance Allowance", value: safeNumber(slip.conveyance) },
      { name: "Medical Allowance", value: safeNumber(slip.medical) },
      { name: "Performance Bonus", value: safeNumber(slip.bonus) }
    ].filter(item => item.value > 0);

    const deductionsList = [
      { name: "Provident Fund (PF)", value: safeNumber(slip.employee_pf) },
      { name: "ESIC Contribution", value: safeNumber(slip.employee_esi) },
      { name: "Professional Tax (PT)", value: safeNumber(slip.professional_tax) },
      { name: "Leave Without Pay (LOP)", value: safeNumber(slip.lop_deduction) },
      { name: "TDS / Income Tax", value: safeNumber(slip.tds_amount) }
    ].filter(item => item.value > 0);

    const totalEarnings = earningsList.reduce((acc, item) => acc + item.value, 0);
    const totalDeductions = deductionsList.reduce((acc, item) => acc + item.value, 0);

    return {
      earnings: earningsList,
      deductions: deductionsList,
      totalEarnings,
      totalDeductions
    };
  };

  const donutChartData = useMemo(() => {
    if (!selectedSlip) return [];
    const breakdown = getPayslipBreakdown(selectedSlip);
    return [
      { name: "Take Home Net Pay", value: safeNumber(selectedSlip.net_pay) },
      { name: "Total Deductions", value: breakdown.totalDeductions }
    ];
  }, [selectedSlip]);

  const DONUT_COLORS = ["#10b981", "#ef4444"];

  /* =========================================
     LOADING SKELETONS
  ========================================= */
  if (loading) {
    return (
      <div className="payroll-page" style={{ padding: "40px" }}>
        <div style={{ background: "white", borderRadius: "20px", padding: "40px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}>
          <div style={{ height: "40px", width: "40%", background: "#f1f5f9", borderRadius: "8px", marginBottom: "20px", animation: "pulse-glow 1.5s infinite" }}></div>
          <div style={{ height: "20px", width: "20%", background: "#f1f5f9", borderRadius: "8px", marginBottom: "40px", animation: "pulse-glow 1.5s infinite" }}></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "20px", marginBottom: "40px" }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{ height: "120px", background: "#f1f5f9", borderRadius: "16px", animation: "pulse-glow 1.5s infinite" }}></div>
            ))}
          </div>
          <div style={{ height: "300px", background: "#f1f5f9", borderRadius: "16px", animation: "pulse-glow 1.5s infinite" }}></div>
        </div>
      </div>
    );
  }

  const breakdown = selectedSlip ? getPayslipBreakdown(selectedSlip) : null;

  return (
    <div className="payroll-page">
      {/* HEADER BANNER */}
      <div className="page-header">
        <div>
          <h2>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle" }}>
              <rect x="2" y="4" width="20" height="16" rx="2"></rect>
              <line x1="12" y1="18" x2="12" y2="18"></line>
              <line x1="12" y1="12" x2="12" y2="12"></line>
              <line x1="12" y1="6" x2="12" y2="6"></line>
            </svg>
            My Payslips Portal
          </h2>
          <p>Securely view, analyze, and download your monthly itemized salary slips</p>
        </div>
      </div>

      {/* CONSOLIDATED GLOWING KPIS (ADMIN SUMMARY STYLE) */}
      {summary && (
        <div className="payslip-summary-grid">
          {/* Latest Net Salary */}
          <div className="payslip-kpi-card success">
            <div className="kpi-card-icon">
              <span>💰</span>
            </div>
            <div className="kpi-card-content">
              <h4>Latest Net Salary</h4>
              <div className="kpi-card-value">
                ₹<CountUp end={safeNumber(summary.latest_net_pay)} duration={1.5} separator="," />
              </div>
              <span className="kpi-card-subtitle">Net Take-Home Pay</span>
            </div>
          </div>

          {/* YTD Earnings */}
          <div className="payslip-kpi-card primary">
            <div className="kpi-card-icon">
              <span>📈</span>
            </div>
            <div className="kpi-card-content">
              <h4>YTD Earnings (Gross)</h4>
              <div className="kpi-card-value">
                ₹<CountUp end={safeNumber(summary.ytd_earnings)} duration={1.5} separator="," />
              </div>
              <span className="kpi-card-subtitle">Year-to-Date Gross CTC</span>
            </div>
          </div>

          {/* Total PF */}
          <div className="payslip-kpi-card secondary">
            <div className="kpi-card-icon">
              <span>🏦</span>
            </div>
            <div className="kpi-card-content">
              <h4>Total PF Contribution</h4>
              <div className="kpi-card-value">
                ₹<CountUp end={safeNumber(summary.ytd_pf)} duration={1.5} separator="," />
              </div>
              <span className="kpi-card-subtitle">Provident Fund Balance</span>
            </div>
          </div>

          {/* Income Tax Paid */}
          <div className="payslip-kpi-card danger">
            <div className="kpi-card-icon">
              <span>🧾</span>
            </div>
            <div className="kpi-card-content">
              <h4>Income Tax Paid (TDS)</h4>
              <div className="kpi-card-value">
                ₹<CountUp end={safeNumber(summary.ytd_tax)} duration={1.5} separator="," />
              </div>
              <span className="kpi-card-subtitle">Total TDS Deducted</span>
            </div>
          </div>

          {/* LOP Days */}
          <div className="payslip-kpi-card warning">
            <div className="kpi-card-icon">
              <span>📅</span>
            </div>
            <div className="kpi-card-content">
              <h4>Unpaid Leaves (LOP)</h4>
              <div className="kpi-card-value">
                <CountUp end={safeNumber(summary.ytd_lop_days)} duration={1} /> Days
              </div>
              <span className="kpi-card-subtitle">Loss of Pay Count</span>
            </div>
          </div>
        </div>
      )}

      {/* TREND ANALYTICS */}
      {chartData.length > 0 && (
        <div className="salary-chart-card">
          <h3>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle" }}>
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            Net Salary Trajectory Trend
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="salaryGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="custom-chart-tooltip">
                        <div className="tooltip-month">{payload[0].payload.month}</div>
                        <div className="tooltip-value">{formatCurrency(payload[0].value)}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="salary"
                stroke="#2563eb"
                strokeWidth={3.5}
                fillOpacity={1}
                fill="url(#salaryGrad)"
                dot={{ r: 5, stroke: "#ffffff", strokeWidth: 2, fill: "#2563eb" }}
                activeDot={{ r: 8, stroke: "#ffffff", strokeWidth: 2.5, fill: "#1e293b" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* STATEMENTS TABLE */}
      <div className="table-wrapper">
        <table className="payroll-table">
          <thead>
            <tr>
              <th>Statement Month</th>
              <th>Net Compensation</th>
              <th>Payout Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {slips.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  No approved payslips available in your history.
                </td>
              </tr>
            )}
            {slips.map(slip => {
              const canDownload = slip.status === "APPROVED" || slip.status === "PAID";
              return (
                <tr key={slip.id}>
                  <td style={{ fontWeight: 700 }}>{formatMonth(slip.month)}</td>
                  <td className="amount positive">{formatCurrency(slip.net_pay)}</td>
                  <td>
                    <span className={`status status-${slip.status.toLowerCase()}`}>
                      {slip.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="btn-view"
                      disabled={!canDownload}
                      onClick={() => setSelectedSlip(slip)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      Statement Details
                    </button>
                    <button
                      className="btn-payslip"
                      disabled={!canDownload || downloadingId === slip.id}
                      onClick={() => handleDownload(slip.id, slip.month)}
                    >
                      {downloadingId === slip.id ? (
                        <>
                          <span className="btn-spinner"></span>
                          Downloading...
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                          </svg>
                          Download Statement
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MASTERPIECE DIGITAL PAYSLIP MODAL */}
      {selectedSlip && breakdown && (
        <div className="modal-overlay" onClick={() => setSelectedSlip(null)}>
          <div
            className="modal-card payslip-modal professional"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background Watermark */}
            <div className="payslip-watermark">HRMS PAYROLL</div>

            {/* Header section */}
            <div className="payslip-header">
              <img src={companyLogo || "/placeholder-logo.png"} alt="HRMS Logo" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1599305445671-ac291c95aba9?w=80&fit=crop&q=80" }} />
              <div>
                <h3>{companyName}</h3>
                <p>Employee Payroll Statement</p>
              </div>
            </div>

            {/* Metadata Table-like Panel */}
            <div className="payslip-meta-grid">
              <div className="meta-item">
                <span>Month / Year</span>
                <span>{formatMonth(selectedSlip.month)}</span>
              </div>
              <div className="meta-item">
                <span>Statement ID</span>
                <span>#PAY-{selectedSlip.id}</span>
              </div>
              <div className="meta-item">
                <span>Unpaid Leave (LOP)</span>
                <span>{selectedSlip.lop_days || 0} Days</span>
              </div>
              <div className="meta-item">
                <span>Status</span>
                <span style={{ color: selectedSlip.status === "PAID" ? "#10b981" : "#0ea5e9" }}>{selectedSlip.status}</span>
              </div>
            </div>

            {/* Visual ratio chart panel */}
            <div className="payslip-chart-panel">
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie
                    data={donutChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={50}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {donutChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="payslip-chart-legend">
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: "#10b981" }}></div>
                  <span>Net Take Home ({Math.round((selectedSlip.net_pay / (breakdown.totalEarnings || 1)) * 100)}%)</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: "#ef4444" }}></div>
                  <span>Total Deductions ({Math.round((breakdown.totalDeductions / (breakdown.totalEarnings || 1)) * 100)}%)</span>
                </div>
              </div>
            </div>

            {/* Dual Column Ledgers */}
            <div className="payslip-ledger-container">
              {/* Earnings Column */}
              <div className="payslip-column earnings">
                <h4>
                  <span>Earnings Breakdown</span>
                  <span style={{ color: "#10b981" }}>+ Credit</span>
                </h4>
                {breakdown.earnings.map((earn, i) => (
                  <div className="ledger-row" key={i}>
                    <div className="ledger-row-header">
                      <span>{earn.name}</span>
                      <span>{formatCurrency(earn.value)}</span>
                    </div>
                    <div className="payslip-progress-bg">
                      <div
                        className="payslip-progress-bar"
                        style={{ width: `${(earn.value / (breakdown.totalEarnings || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
                {/* Total Earnings */}
                <div className="ledger-row highlight-row">
                  <div className="ledger-row-header">
                    <span>Gross Earnings</span>
                    <span>{formatCurrency(breakdown.totalEarnings)}</span>
                  </div>
                </div>
              </div>

              {/* Deductions Column */}
              <div className="payslip-column deductions">
                <h4>
                  <span>Deductions Breakdown</span>
                  <span style={{ color: "#ef4444" }}>- Debit</span>
                </h4>
                {breakdown.deductions.length === 0 ? (
                  <div style={{ color: "#64748b", fontSize: "13px", fontStyle: "italic", padding: "10px 0" }}>
                    No deductions processed for this period.
                  </div>
                ) : (
                  breakdown.deductions.map((ded, i) => (
                    <div className="ledger-row" key={i}>
                      <div className="ledger-row-header">
                        <span>{ded.name}</span>
                        <span>{formatCurrency(ded.value)}</span>
                      </div>
                      <div className="payslip-progress-bg">
                        <div
                          className="payslip-progress-bar"
                          style={{ width: `${(ded.value / (breakdown.totalEarnings || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                )}
                {/* Total Deductions */}
                <div className="ledger-row highlight-row">
                  <div className="ledger-row-header">
                    <span>Total Deductions</span>
                    <span>{formatCurrency(breakdown.totalDeductions)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Glowing Net Pay Callout & Hike Difference */}
            <div className="net-pay-glowing-card">
              <span className="label">Take-Home Compensation (Net Salary)</span>
              <span className="amount">
                <CountUp
                  end={safeNumber(selectedSlip.net_pay)}
                  duration={1.5}
                  separator=","
                  decimals={0}
                  prefix="₹"
                />
              </span>

              {/* Month over Month Tracker Badge */}
              {monthDifference && (
                <div className={`payslip-diff-pill ${monthDifference.isIncrease ? 'up' : monthDifference.isConstant ? 'neutral' : 'down'}`}>
                  {monthDifference.isIncrease ? (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <line x1="12" y1="19" x2="12" y2="5"></line>
                        <polyline points="5 12 12 5 19 12"></polyline>
                      </svg>
                      {formatCurrency(Math.abs(monthDifference.value))} ({monthDifference.percentage.toFixed(1)}%) vs last month
                    </>
                  ) : monthDifference.isConstant ? (
                    <span>Same as last month</span>
                  ) : (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <polyline points="19 12 12 19 5 12"></polyline>
                      </svg>
                      {formatCurrency(Math.abs(monthDifference.value))} ({Math.abs(monthDifference.percentage).toFixed(1)}%) vs last month
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="modal-actions">
              <button
                className="btn-payslip"
                disabled={downloadingId === selectedSlip.id}
                onClick={() => handleDownload(selectedSlip.id, selectedSlip.month)}
                style={{ borderRadius: "var(--radius-sm)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download PDF Copy
              </button>
              <button className="btn-close" onClick={() => setSelectedSlip(null)}>
                Close Statement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}