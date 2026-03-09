import { useEffect, useState } from "react";
import api from "../../api/axios";
import { formatINR } from "../../utils/currency";
import "../../styles/payrollSummary.css";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function PayrollSummary() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  /* ================= FETCH SUMMARY ================= */

  useEffect(() => {
    fetchSummary();
  }, [year, month]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/payroll/summary/?year=${year}&month=${month}`);
      const data = res.data;
      
      // Calculate additional metrics
      const totalYearlyCTC = (data.total_monthly_ctc || 0) * 12;
      
      setSummary({
        ...data,
        total_yearly_ctc: totalYearlyCTC,
      });
    } catch (err) {
      console.error("Failed to load payroll summary", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= DOWNLOAD FILE ================= */

  const downloadFile = async (type) => {
    try {
      setDownloading(true);

      const endpoint =
        type === "excel"
          ? `/payroll/export/excel/?year=${year}&month=${month}`
          : `/payroll/export/pdf/?year=${year}&month=${month}`;

      const response = await api.get(endpoint, {
        responseType: "blob",
      });

      const blob = new Blob([response.data]);
      const link = document.createElement("a");

      link.href = window.URL.createObjectURL(blob);
      link.download =
        type === "excel"
          ? `payroll_${year}_${month}.xlsx`
          : `payroll_${year}_${month}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download report.");
    } finally {
      setDownloading(false);
    }
  };

  /* ================= LOADING STATE ================= */

  if (loading) {
    return (
      <div className="payroll-summary-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading payroll summary...</p>
        </div>
      </div>
    );
  }

  /* ================= EMPTY STATE ================= */

  if (!summary || summary.total_employees === 0) {
    return (
      <div className="payroll-summary-page">
        <div className="page-header">
          <div className="header-content">
            <h1>Payroll Summary</h1>
            <p>Company-wide salary overview and analytics</p>
          </div>
        </div>
        <div className="empty-state">
          <span className="empty-icon">📊</span>
          <h3>No Payroll Data Available</h3>
          <p>Generate payslips for {new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })} to see summary</p>
        </div>
      </div>
    );
  }

  /* ================= CHART DATA ================= */

  const monthlyData = [
    {
      name: new Date(year, month - 1).toLocaleString('default', { month: 'short' }),
      "Gross Salary": summary.total_monthly_ctc || 0,
      "Net Pay": summary.total_net_pay || 0,
    },
  ];

  const distributionData = [
    { name: "Net Pay", value: summary.total_net_pay || 0, color: "#16a34a" },
    { name: "Deductions", value: (summary.total_monthly_ctc || 0) - (summary.total_net_pay || 0), color: "#ef4444" },
  ];

  /* ================= UI ================= */

  return (
    <div className="payroll-summary-page">
      
      {/* HEADER */}
      <div className="page-header">
        <div className="header-content">
          <h1>Payroll Summary</h1>
          <p>Company-wide salary overview and analytics</p>
        </div>
        <div className="header-actions">
          <button
            className="btn-download excel"
            onClick={() => downloadFile("excel")}
            disabled={downloading}
          >
            <span>📊</span>
            {downloading ? "Downloading..." : "Export Excel"}
          </button>
          <button
            className="btn-download pdf"
            onClick={() => downloadFile("pdf")}
            disabled={downloading}
          >
            <span>📄</span>
            {downloading ? "Downloading..." : "Export PDF"}
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="filter-section">
        <div className="filter-group">
          <label>📅 Month</label>
          <select value={month} onChange={(e) => setMonth(e.target.value)}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>📆 Year</label>
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            {Array.from({ length: 5 }, (_, i) => (
              <option key={i} value={currentYear - i}>
                {currentYear - i}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="summary-grid">
        <div className="summary-card primary">
          <div className="card-icon">
            <span>💰</span>
          </div>
          <div className="card-content">
            <h4>Total Monthly Payroll</h4>
            <p className="value">{formatINR(summary.total_monthly_ctc)}</p>
            <span className="subtitle">Gross Salary</span>
          </div>
        </div>

        <div className="summary-card success">
          <div className="card-icon">
            <span>💵</span>
          </div>
          <div className="card-content">
            <h4>Total Net Pay</h4>
            <p className="value">{formatINR(summary.total_net_pay)}</p>
            <span className="subtitle">After Deductions</span>
          </div>
        </div>

        <div className="summary-card info">
          <div className="card-icon">
            <span>👥</span>
          </div>
          <div className="card-content">
            <h4>Total Employees</h4>
            <p className="value">{summary.total_employees}</p>
            <span className="subtitle">Active Payroll</span>
          </div>
        </div>

        <div className="summary-card warning">
          <div className="card-icon">
            <span>📊</span>
          </div>
          <div className="card-content">
            <h4>Average Monthly CTC</h4>
            <p className="value">{formatINR(summary.average_monthly_ctc)}</p>
            <span className="subtitle">Per Employee</span>
          </div>
        </div>

        <div className="summary-card secondary">
          <div className="card-icon">
            <span>📈</span>
          </div>
          <div className="card-content">
            <h4>Projected Yearly Cost</h4>
            <p className="value">{formatINR(summary.total_yearly_ctc)}</p>
            <span className="subtitle">Annual Projection</span>
          </div>
        </div>

        <div className="summary-card danger">
          <div className="card-icon">
            <span>➖</span>
          </div>
          <div className="card-content">
            <h4>Total Deductions</h4>
            <p className="value">{formatINR((summary.total_monthly_ctc || 0) - (summary.total_net_pay || 0))}</p>
            <span className="subtitle">PF, ESI, Tax, etc.</span>
          </div>
        </div>
      </div>

      {/* CHARTS */}
      <div className="charts-section">
        
        {/* BAR CHART */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Salary Breakdown</h3>
            <p>Gross vs Net Pay Comparison</p>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatINR(value)} />
                <Legend />
                <Bar dataKey="Gross Salary" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Net Pay" fill="#16a34a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Salary Distribution</h3>
            <p>Net Pay vs Deductions</p>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatINR(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* INFO SECTION */}
      <div className="info-section">
        <div className="info-card">
          <h4>📌 Summary Details</h4>
          <div className="info-row">
            <span>Period:</span>
            <strong>{new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</strong>
          </div>
          <div className="info-row">
            <span>Deduction Rate:</span>
            <strong>
              {summary.total_monthly_ctc > 0 
                ? (((summary.total_monthly_ctc - summary.total_net_pay) / summary.total_monthly_ctc) * 100).toFixed(1)
                : 0}%
            </strong>
          </div>
          <div className="info-row">
            <span>Average Net Pay:</span>
            <strong>{formatINR((summary.total_net_pay || 0) / (summary.total_employees || 1))}</strong>
          </div>
        </div>
      </div>

    </div>
  );
}