import { useEffect, useState } from "react";
import api from "../../api/axios";
import { formatINR } from "../../utils/currency";
import "../../styles/payrollSummary.css";

export default function PayrollSummary() {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(currentYear);
    const [month, setMonth] = useState(new Date().getMonth() + 1);

  /* ================= FETCH SUMMARY ================= */

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/payroll/summary/?year=${year}&month=${month}`);
        setSummary(res.data);
      } catch (err) {
        console.error("Failed to load payroll summary", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

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
          ? "payroll_report.xlsx"
          : "payroll_report.pdf";

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

  /* ================= STATES ================= */

  if (loading) {
    return <p style={{ padding: 24 }}>Loading payroll summary...</p>;
  }

  if (!summary) {
    return <p style={{ padding: 24 }}>No payroll data available.</p>;
  }

  /* ================= UI ================= */

  return (
    <div className="payroll-summary-page">

      <div className="page-header">
        <h2>Payroll Summary</h2>
        <p>Company-wide salary overview</p>
      </div>

      {/* DOWNLOAD BUTTONS */}
      <div className="download-section">
        <button
          className="btn"
          onClick={() => downloadFile("excel")}
          disabled={downloading}
        >
          📊 {downloading ? "Downloading..." : "Download Excel"}
        </button>

        <button
          className="btn"
          onClick={() => downloadFile("pdf")}
          disabled={downloading}
          style={{ marginLeft: 12 }}
        >
          🧾 {downloading ? "Downloading..." : "Download PDF"}
        </button>
      </div>


      <div className="filter-section">

        <select value={month} onChange={(e) => setMonth(e.target.value)}>
            {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
            </option>
            ))}
        </select>

        <select value={year} onChange={(e) => setYear(e.target.value)}>
            {Array.from({ length: 5 }, (_, i) => (
            <option key={i} value={currentYear - i}>
                {currentYear - i}
            </option>
            ))}
        </select>

        </div>

      {/* KPI CARDS */}
      <div className="summary-grid">

        <SummaryCard
          title="Total Monthly Payroll"
          value={formatINR(summary.total_monthly_ctc)}
        />

        <SummaryCard
          title="Total Yearly Payroll"
          value={formatINR(summary.total_yearly_ctc)}
        />

        <SummaryCard
          title="Total Employees"
          value={summary.total_employees}
        />

        <SummaryCard
          title="Average Monthly CTC"
          value={formatINR(summary.average_monthly_ctc)}
        />

      </div>
    </div>
  );
}



/* ================= CARD COMPONENT ================= */

const SummaryCard = ({ title, value }) => (
  <div className="summary-card">
    <h4>{title}</h4>
    <p>{value}</p>
  </div>
);