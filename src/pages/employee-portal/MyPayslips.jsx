// import { useEffect, useState } from "react";
// import { myPayslips, downloadPayslipPDF } from "../../api/payroll";
// import "../../styles/payroll.css";

// export default function MyPayslips() {
//   const [slips, setSlips] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [downloadingId, setDownloadingId] = useState(null);

//   useEffect(() => {
//     const fetchPayslips = async () => {
//       try {
//         const res = await myPayslips();
//         setSlips(res.data);
//       } catch (error) {
//         alert("Failed to load payslips");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPayslips();
//   }, []);

//   const formatMonth = (monthString) => {
//     const date = new Date(monthString);
//     return date.toLocaleDateString("en-US", {
//       month: "long",
//       year: "numeric",
//     });
//   };

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat("en-IN", {
//       style: "currency",
//       currency: "INR",
//     }).format(amount);
//   };

//   const handleDownload = async (payslipId, month) => {
//     try {
//       setDownloadingId(payslipId);

//       const res = await downloadPayslipPDF(payslipId);

//       const blob = new Blob([res.data], {
//         type: "application/pdf",
//       });

//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement("a");

//       link.href = url;
//       link.download = `Payslip_${month}.pdf`;
//       link.click();
//     } catch (error) {
//       alert("Failed to download payslip");
//     } finally {
//       setDownloadingId(null);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="payroll-page">
//         <p className="loading-text">Loading payslips...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="payroll-page">
//       <div className="page-header">
//         <div>
//           <h2>My Payslips</h2>
//           <p>Download your monthly salary slips</p>
//         </div>
//       </div>

//       {slips.length === 0 ? (
//         <div className="empty-card">
//           <h3>No Payslips Available</h3>
//           <p>Your payslips will appear here once generated.</p>
//         </div>
//       ) : (
//         <div className="table-wrapper">
//           <table className="payroll-table">
//             <thead>
//               <tr>
//                 <th>Month</th>
//                 <th>Net Pay</th>
//                 <th>Generated On</th>
//                 <th>Action</th>
//               </tr>
//             </thead>

//             <tbody>
//               {slips.map((slip) => (
//                 <tr key={slip.id}>
//                   <td>{formatMonth(slip.month)}</td>

//                   <td className="amount positive">
//                     {formatCurrency(slip.net_pay)}
//                   </td>

//                   <td>
//                     {new Date(slip.generated_on).toLocaleDateString()}
//                   </td>

//                   <td>
//                     <button
//                       className="btn-payslip"
//                       disabled={downloadingId === slip.id}
//                       onClick={() =>
//                         handleDownload(slip.id, slip.month)
//                       }
//                     >
//                       {downloadingId === slip.id
//                         ? "Downloading..."
//                         : "Download PDF"}
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }


import { useEffect, useState, useMemo } from "react";
import "../../styles/payroll.css";
import "../../styles/employeePayslips.css";

import api from "../../api/axios";
import { getMyPayslips, downloadPayslipPDF } from "../../api/payroll";

import companyLogo from "../../assets/company-logo.png";
import CompensationDashboard from "../../components/payroll/CompensationDashboard";

import CountUp from "react-countup";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

export default function MyPayslips() {

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
      currency: "INR"
    }).format(amount || 0);

  const safeNumber = (value) => parseFloat(value || 0);

  /* =========================================
     PREVIOUS SLIP
  ========================================= */

  const previousSlip = useMemo(() => {

    if (!selectedSlip || slips.length === 0) return null;

    const index = slips.findIndex(p => p.id === selectedSlip.id);

    if (index <= 0) return null;

    return slips[index - 1];

  }, [selectedSlip, slips]);

  const salaryDifference =
    safeNumber(selectedSlip?.net_pay) -
    safeNumber(previousSlip?.net_pay);

  const isIncrease = salaryDifference > 0;

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
     CHART DATA
  ========================================= */

  const chartData = useMemo(() => {

    return slips.map(s => ({
      month: formatMonth(s.month),
      salary: safeNumber(s.net_pay)
    })).reverse();

  }, [slips]);

  const getPayslipChartData = (slip) => {

    if (!slip) return [];

    const earnings =
      safeNumber(slip.basic) +
      safeNumber(slip.hra) +
      safeNumber(slip.da) +
      safeNumber(slip.conveyance) +
      safeNumber(slip.medical) +
      safeNumber(slip.bonus);

    const deductions =
      safeNumber(slip.employee_pf) +
      safeNumber(slip.employee_esi) +
      safeNumber(slip.professional_tax) +
      safeNumber(slip.lop_deduction) +
      safeNumber(slip.tds_amount);

    return [
      { name: "Earnings", value: earnings },
      { name: "Deductions", value: deductions }
    ];

  };

  const chartColors = ["#22c55e", "#ef4444"];

  /* =========================================
     LOADING
  ========================================= */

  if (loading) {

    return (
      <div className="payroll-page">
        <p className="loading-text">Loading payslips...</p>
      </div>
    );

  }

  /* =========================================
     UI
  ========================================= */

  return (

    <div className="payroll-page">

      {/* HEADER */}

      <div className="page-header">
        <h2>My Payslips</h2>
        <p>View and download your monthly salary slips</p>
      </div>

      <CompensationDashboard />

      {/* SUMMARY */}

      {summary && (

        <div className="payslip-summary-grid">

          <div className="summary-card">
            <h4>Latest Salary</h4>
            <p>
              ₹ <CountUp end={safeNumber(summary.latest_net_pay)} duration={1.2} separator="," />
            </p>
          </div>

          <div className="summary-card">
            <h4>YTD Earnings</h4>
            <p>
              ₹ <CountUp end={safeNumber(summary.ytd_earnings)} duration={1.2} separator="," />
            </p>
          </div>

          <div className="summary-card">
            <h4>Total PF</h4>
            <p>
              ₹ <CountUp end={safeNumber(summary.ytd_pf)} duration={1.2} separator="," />
            </p>
          </div>

          <div className="summary-card">
            <h4>Total Tax Paid</h4>
            <p>
              ₹ <CountUp end={safeNumber(summary.ytd_tax)} duration={1.2} separator="," />
            </p>
          </div>

          <div className="summary-card">
            <h4>LOP Days</h4>
            <p>
              <CountUp end={safeNumber(summary.ytd_lop_days)} duration={1} />
            </p>
          </div>

        </div>

      )}

      {/* SALARY TREND */}

      {chartData.length > 0 && (

        <div className="salary-chart-card">

          <h3>Salary Trend</h3>

          <ResponsiveContainer width="100%" height={300}>

            <LineChart data={chartData}>

              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />

              <Line
                type="monotone"
                dataKey="salary"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 5 }}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>

      )}

      {/* PAYSLIP TABLE */}

      <div className="table-wrapper">

        <table className="payroll-table">

          <thead>
            <tr>
              <th>Month</th>
              <th>Net Pay</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {slips.length === 0 && (
              <tr>
                <td colSpan="4" className="loading-text">
                  No payslips available
                </td>
              </tr>
            )}

            {slips.map(slip => {

              const canDownload =
                slip.status === "APPROVED" ||
                slip.status === "PAID";

              return (

                <tr key={slip.id}>

                  <td>{formatMonth(slip.month)}</td>

                  <td className="amount positive">
                    {formatCurrency(slip.net_pay)}
                  </td>

                  <td>
                    <span className={`status status-${slip.status.toLowerCase()}`}>
                      {slip.status}
                    </span>
                  </td>

                  <td>

                    <button
                      className="btn-view"
                      disabled={!canDownload}
                      onClick={() => setSelectedSlip(slip)}
                    >
                      View
                    </button>

                    <button
                      className="btn-payslip"
                      disabled={!canDownload || downloadingId === slip.id}
                      onClick={() => handleDownload(slip.id, slip.month)}
                    >
                      {downloadingId === slip.id
                        ? "Downloading..."
                        : "Download"}
                    </button>

                  </td>

                </tr>

              );

            })}

          </tbody>

        </table>

      </div>

      {/* PAYSLIP MODAL */}

      {selectedSlip && (

        <div
          className="modal-overlay"
          onClick={() => setSelectedSlip(null)}
        >

          <div
            className="modal-card payslip-modal professional"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="payslip-header">

              <img src={companyLogo} alt="Company Logo" />

              <div>
                <h3>Genius Minds Making Code Pvt Ltd</h3>
                <p>Official Salary Payslip</p>
              </div>

            </div>

            <hr />

            <div className="payslip-meta">

              <div>
                <strong>Month:</strong> {formatMonth(selectedSlip.month)}
              </div>

              <div>
                <strong>Status:</strong> {selectedSlip.status}
              </div>

              <div>
                <strong>LOP Days:</strong> {selectedSlip.lop_days}
              </div>

            </div>

            <div className="net-pay-box">

              Net Pay

              <CountUp
                end={safeNumber(selectedSlip.net_pay)}
                duration={1.5}
                separator=","
                decimals={2}
                prefix="₹ "
              />

            </div>

            <div className="modal-actions">

              <button
                className="btn-payslip"
                onClick={() =>
                  handleDownload(selectedSlip.id, selectedSlip.month)
                }
              >
                Download PDF
              </button>

              <button
                className="btn-close"
                onClick={() => setSelectedSlip(null)}
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}