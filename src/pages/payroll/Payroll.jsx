// import { useState, useEffect } from "react";
// import toast from "react-hot-toast";
// import confetti from "canvas-confetti";

// import {
//   generatePayslip,
//   getPayrollStatus,
//   downloadPayslipPDF,
//   bulkGeneratePayslips,
//   bulkApprovePayslips,
//   downloadAllPayslipsZip,
//   bulkEmailPayslips,
//   getBulkProgress,
//   sendSinglePayslipEmail, // ✅ NEW
// } from "../../api/payroll";

// import "../../styles/payroll.css";

// export default function Payroll() {
//   const [month, setMonth] = useState(
//     new Date().toISOString().slice(0, 7)
//   );

//   const [filterStatus, setFilterStatus] = useState("ALL");
//   const [payrollData, setPayrollData] = useState([]);
//   const [loadingId, setLoadingId] = useState(null);

//   const [batchId, setBatchId] = useState(null);
//   const [progress, setProgress] = useState(null);
//   const [showModal, setShowModal] = useState(false);

//   /* ===============================
//      🎉 CONFETTI EFFECT
//   =============================== */
//   const fireConfetti = () => {
//     const colors = ["#FFD700", "#FFA500", "#2563eb", "#16a34a"];

//     confetti({
//       particleCount: 200,
//       spread: 120,
//       startVelocity: 60,
//       gravity: 0.9,
//       origin: { x: 0.5, y: 0.5 },
//       colors,
//     });

//     setTimeout(() => {
//       confetti({
//         particleCount: 100,
//         angle: 60,
//         spread: 80,
//         origin: { x: 0, y: 0.7 },
//         colors,
//       });
//     }, 300);

//     setTimeout(() => {
//       confetti({
//         particleCount: 100,
//         angle: 120,
//         spread: 80,
//         origin: { x: 1, y: 0.7 },
//         colors,
//       });
//     }, 600);
//   };

//   /* ===============================
//      FETCH STATUS
//   =============================== */
//   useEffect(() => {
//     fetchStatus();
//   }, [month, filterStatus]);

//   const fetchStatus = async () => {
//     try {
//       const res = await getPayrollStatus(month, filterStatus);
//       setPayrollData(res.data);
//     } catch {
//       toast.error("Failed to load payroll status");
//     }
//   };

//   /* ===============================
//      SINGLE GENERATE
//   =============================== */
//   const handleGeneratePayslip = async (employeeId) => {
//     try {
//       setLoadingId(employeeId);

//       await generatePayslip({
//         employee_id: employeeId,
//         month,
//       });

//       toast.success("Payslip generated successfully ✅");
//       fetchStatus();
//     } catch (err) {
//       toast.error(err.response?.data?.error || "Generation failed");
//     } finally {
//       setLoadingId(null);
//     }
//   };

//   /* ===============================
//      DOWNLOAD PDF
//   =============================== */
//   const handleDownload = async (payslipId) => {
//     try {
//       const res = await downloadPayslipPDF(payslipId);
//       const blob = new Blob([res.data], { type: "application/pdf" });
//       const url = window.URL.createObjectURL(blob);

//       const link = document.createElement("a");
//       link.href = url;
//       link.download = "Payslip.pdf";
//       link.click();
//     } catch {
//       toast.error("Download failed");
//     }
//   };

//   /* ===============================
//      SEND SINGLE EMAIL
//   =============================== */
//   const handleSendSingleEmail = async (employeeId) => {
//     try {
//       await sendSinglePayslipEmail(employeeId, month);
//       toast.success("Payslip emailed successfully 📧");
//     } catch (err) {
//       toast.error(
//         err.response?.data?.error || "Email sending failed"
//       );
//     }
//   };

//   /* ===============================
//      BULK GENERATE
//   =============================== */
//   const handleBulkGenerate = async () => {
//     try {
//       const res = await bulkGeneratePayslips(month);

//       toast.success(
//         `Generated: ${res.data.generated} | 
//          No Salary: ${res.data.skipped_no_salary} | 
//          Existing: ${res.data.skipped_existing}`
//       );

//       fetchStatus();
//     } catch {
//       toast.error("Bulk generation failed");
//     }
//   };

//   /* ===============================
//      BULK APPROVE
//   =============================== */
//   const handleBulkApprove = async () => {
//     try {
//       const res = await bulkApprovePayslips(month);
//       toast.success(`Approved ${res.data.approved_count} payslips`);
//       fetchStatus();
//     } catch {
//       toast.error("Bulk approval failed");
//     }
//   };

//   /* ===============================
//      DOWNLOAD ALL ZIP
//   =============================== */
//   const handleDownloadAll = async () => {
//     try {
//       const res = await downloadAllPayslipsZip(month);

//       const blob = new Blob([res.data], {
//         type: "application/zip",
//       });

//       const url = window.URL.createObjectURL(blob);

//       const link = document.createElement("a");
//       link.href = url;
//       link.download = `Payslips_${month}.zip`;
//       link.click();
//     } catch {
//       toast.error("ZIP download failed");
//     }
//   };

//   /* ===============================
//      BULK EMAIL
//   =============================== */
//   const handleSendEmails = async () => {
//     try {
//       const res = await bulkEmailPayslips(month);

//       setBatchId(res.data.batch_id);
//       setProgress({
//         total: res.data.total,
//         completed: 0,
//         failed: 0,
//       });

//       setShowModal(true);
//       toast.success(`📨 ${res.data.total} emails queued`);
//     } catch (err) {
//       toast.error(
//         err.response?.data?.error || "Email sending failed"
//       );
//     }
//   };

//   /* ===============================
//      LIVE PROGRESS POLLING
//   =============================== */
//   useEffect(() => {
//     if (!batchId) return;

//     const interval = setInterval(async () => {
//       try {
//         const res = await getBulkProgress(batchId);
//         setProgress(res.data);

//         if (
//           res.data.completed + res.data.failed >=
//           res.data.total
//         ) {
//           clearInterval(interval);

//           if (res.data.failed === 0) {
//             toast.success(
//               "🎉 All emails sent successfully!"
//             );
//             fireConfetti();
//           } else {
//             toast(
//               "Emails completed with some failures ⚠️"
//             );
//           }

//           setTimeout(() => {
//             setShowModal(false);
//             setBatchId(null);
//           }, 2500);
//         }
//       } catch {
//         clearInterval(interval);
//       }
//     }, 2000);

//     return () => clearInterval(interval);
//   }, [batchId]);

//   const percentage =
//     progress && progress.total > 0
//       ? Math.round(
//           ((progress.completed + progress.failed) /
//             progress.total) *
//             100
//         )
//       : 0;

//   /* ===============================
//      RENDER
//   =============================== */
//   return (
//     <div className="payroll-page">
//       <div className="page-header">
//         <div className="bulk-actions">
//           <button
//             className="btn-bulk"
//             onClick={handleBulkGenerate}
//           >
//             Generate All
//           </button>

//           <button
//             className="btn-approve"
//             onClick={handleBulkApprove}
//           >
//             Bulk Approve
//           </button>

//           <button
//             className="btn-zip"
//             onClick={handleDownloadAll}
//           >
//             Download All (ZIP)
//           </button>

//           <button
//             className="btn-email"
//             onClick={handleSendEmails}
//             disabled={showModal}
//           >
//             Send Payslips
//           </button>
//         </div>

//         <div>
//           <h2>Payroll</h2>
//           <p>Monthly salary processing</p>
//         </div>

//         <div style={{ display: "flex", gap: "12px" }}>
//           <input
//             type="month"
//             value={month}
//             onChange={(e) =>
//               setMonth(e.target.value)
//             }
//           />

//           <select
//             value={filterStatus}
//             onChange={(e) =>
//               setFilterStatus(e.target.value)
//             }
//             className="filter-select"
//           >
//             <option value="ALL">All</option>
//             <option value="DRAFT">Draft</option>
//             <option value="APPROVED">Approved</option>
//             <option value="PAID">Paid</option>
//             <option value="CANCELLED">Cancelled</option>
//           </select>
//         </div>
//       </div>

//       <div className="table-wrapper">
//         <table className="payroll-table">
//           <thead>
//             <tr>
//               <th>Employee</th>
//               <th>Salary</th>
//               <th>Payslip</th>
//               <th>Action</th>
//             </tr>
//           </thead>

//           <tbody>
//             {payrollData.length === 0 ? (
//               <tr>
//                 <td colSpan="4" className="loading-text">
//                   No payroll records found
//                 </td>
//               </tr>
//             ) : (
//               payrollData.map((emp) => (
//                 <tr key={emp.employee_id}>
//                   <td>{emp.employee_name}</td>

//                   <td>
//                     {emp.salary_set ? (
//                       <span className="status success">
//                         Salary Set
//                       </span>
//                     ) : (
//                       <span className="status error">
//                         Not Set
//                       </span>
//                     )}
//                   </td>

//                   <td>
//                     {emp.payslip_generated ? (
//                       <span
//                         className={`status ${emp.payslip_status?.toLowerCase()}`}
//                       >
//                         {emp.payslip_status}
//                       </span>
//                     ) : (
//                       <span className="status pending">
//                         Not Generated
//                       </span>
//                     )}
//                   </td>

//                   <td>
//                     {emp.salary_set ? (
//                       <>
//                         {!emp.payslip_generated && (
//                           <button
//                             className="btn-payslip"
//                             disabled={
//                               loadingId ===
//                               emp.employee_id
//                             }
//                             onClick={() =>
//                               handleGeneratePayslip(
//                                 emp.employee_id
//                               )
//                             }
//                           >
//                             {loadingId ===
//                             emp.employee_id
//                               ? "Generating..."
//                               : "Generate"}
//                           </button>
//                         )}

//                         {emp.payslip_generated &&
//                           emp.payslip_id && (
//                             <>
//                               <button
//                                 className="btn-payslip"
//                                 onClick={() =>
//                                   handleDownload(
//                                     emp.payslip_id
//                                   )
//                                 }
//                               >
//                                 Download PDF
//                               </button>

//                               <button
//                                 className="btn-email-single"
//                                 onClick={() =>
//                                   handleSendSingleEmail(
//                                     emp.employee_id
//                                   )
//                                 }
//                               >
//                                 Send Email
//                               </button>
//                             </>
//                           )}
//                       </>
//                     ) : (
//                       <button
//                         disabled
//                         className="btn-disabled"
//                       >
//                         Set Salary First
//                       </button>
//                     )}
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {showModal && progress && (
//         <div className="progress-modal">
//           <div className="progress-box">
//             <h3>📨 Sending Payslips...</h3>

//             <p>
//               Sending{" "}
//               {progress.completed +
//                 progress.failed}{" "}
//               / {progress.total} emails (
//               {percentage}%)
//             </p>

//             <div className="progress-bar">
//               <div
//                 className="progress-fill"
//                 style={{
//                   width: `${percentage}%`,
//                 }}
//               />
//             </div>

//             <div className="progress-stats">
//               <span>
//                 ✅ Success: {progress.completed}
//               </span>
//               <span>
//                 ❌ Failed: {progress.failed}
//               </span>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import { generateFullFinal } from "../../api/payroll";

import {
  generatePayslip,
  getPayrollStatus,
  downloadPayslipPDF,
  bulkGeneratePayslips,
  bulkApprovePayslips,
  downloadAllPayslipsZip,
  bulkEmailPayslips,
  sendSinglePayslipEmail,
} from "../../api/payroll";

import "../../styles/payroll.css";

export default function Payroll() {
  const [month, setMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const [filterStatus, setFilterStatus] = useState("ALL");
  const [payrollData, setPayrollData] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [loadingBulkEmail, setLoadingBulkEmail] = useState(false);

  const [showFNFModal, setShowFNFModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [fnfData, setFnfData] = useState({
    last_working_date: "",
    notice_recovery: 0,
    loan_recovery: 0,
    bonus: 0,
  });
  const [fnfResult, setFnfResult] = useState(null);

  /* =====================================================
     🎉 CONFETTI
  ===================================================== */

  const fireConfetti = () => {
    confetti({
      particleCount: 180,
      spread: 120,
      origin: { x: 0.5, y: 0.5 },
    });
  };

  /* =====================================================
     FETCH PAYROLL STATUS
  ===================================================== */

  useEffect(() => {
    fetchStatus();
  }, [month, filterStatus]);

  const fetchStatus = async () => {
    try {
      const res = await getPayrollStatus(month, filterStatus);
      setPayrollData(res.data);
    } catch {
      toast.error("Failed to load payroll data");
    }
  };

  /* =====================================================
     GENERATE SINGLE PAYSLIP
  ===================================================== */

  const handleGeneratePayslip = async (employeeId) => {
    try {
      setLoadingId(employeeId);

      await generatePayslip({
        employee_id: employeeId,
        month,
      });

      toast.success("Payslip generated successfully ✅");
      fetchStatus();
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Generation failed"
      );
    } finally {
      setLoadingId(null);
    }
  };

  const handleGenerateFNF = async () => {
  try {
    const res = await generateFullFinal({
      employee_id: selectedEmployee,
      ...fnfData,
    });

    setFnfResult(res.data);
    toast.success("Full & Final generated successfully 💼");
  } catch (err) {
    toast.error(
      err.response?.data?.error || "FNF generation failed"
    );
  }
};

  /* =====================================================
     DOWNLOAD PDF
  ===================================================== */

  const handleDownload = async (payslipId) => {
    try {
      const res = await downloadPayslipPDF(payslipId);

      const blob = new Blob([res.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "Payslip.pdf";
      link.click();
    } catch {
      toast.error("Download failed");
    }
  };

  /* =====================================================
     SEND SINGLE EMAIL
  ===================================================== */

  const handleSendSingleEmail = async (employeeId) => {
    try {
      await sendSinglePayslipEmail(employeeId, month);
      toast.success("Payslip emailed successfully 📧");
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Email sending failed"
      );
    }
  };

  /* =====================================================
     BULK GENERATE
  ===================================================== */

  const handleBulkGenerate = async () => {
    try {
      const res = await bulkGeneratePayslips(month);

      toast.success(
        `Generated: ${res.data.generated} | 
         No Salary: ${res.data.skipped_no_salary} | 
         Existing: ${res.data.skipped_existing}`
      );

      fetchStatus();
    } catch {
      toast.error("Bulk generation failed");
    }
  };

  /* =====================================================
     BULK APPROVE
  ===================================================== */

  const handleBulkApprove = async () => {
    try {
      const res = await bulkApprovePayslips(month);

      toast.success(
        `Approved ${res.data.approved_count} payslips`
      );

      fetchStatus();
    } catch {
      toast.error("Bulk approval failed");
    }
  };

  /* =====================================================
     DOWNLOAD ALL ZIP
  ===================================================== */

  const handleDownloadAll = async () => {
    try {
      const res = await downloadAllPayslipsZip(month);

      const blob = new Blob([res.data], {
        type: "application/zip",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `Payslips_${month}.zip`;
      link.click();
    } catch {
      toast.error("ZIP download failed");
    }
  };

  /* =====================================================
     BULK EMAIL (Synchronous)
  ===================================================== */

  const handleBulkEmail = async () => {
    try {
      setLoadingBulkEmail(true);

      const res = await bulkEmailPayslips(month);

      const { total, completed, failed } = res.data;

      if (failed === 0) {
        toast.success(
          `🎉 All ${completed}/${total} payslips emailed successfully`
        );
        fireConfetti();
      } else {
        toast(
          `Completed: ${completed}/${total} | Failed: ${failed}`
        );
      }
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
          "Bulk email sending failed"
      );
    } finally {
      setLoadingBulkEmail(false);
    }
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="payroll-page">
      {/* ================= HEADER ================= */}
      <div className="page-header">
        <div className="bulk-actions">
          <button
            className="btn-bulk"
            onClick={handleBulkGenerate}
          >
            Generate All
          </button>

          <button
            className="btn-approve"
            onClick={handleBulkApprove}
          >
            Bulk Approve
          </button>

          <button
            className="btn-zip"
            onClick={handleDownloadAll}
          >
            Download All (ZIP)
          </button>

          <button
            className="btn-email"
            onClick={handleBulkEmail}
            disabled={loadingBulkEmail}
          >
            {loadingBulkEmail
              ? "Sending..."
              : "Send Payslips"}
          </button>
        </div>

        <div>
          <h2>Payroll</h2>
          <p>Monthly salary processing</p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <input
            type="month"
            value={month}
            onChange={(e) =>
              setMonth(e.target.value)
            }
          />

          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value)
            }
            className="filter-select"
          >
            <option value="ALL">All</option>
            <option value="DRAFT">Draft</option>
            <option value="APPROVED">
              Approved
            </option>
            <option value="PAID">Paid</option>
            <option value="CANCELLED">
              Cancelled
            </option>
          </select>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="table-wrapper">
        <table className="payroll-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Salary</th>
              <th>Payslip</th>
              <th>LOP</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {payrollData.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="loading-text"
                >
                  No payroll records found
                </td>
              </tr>
            ) : (
              payrollData.map((emp) => (
                <tr key={emp.employee_id}>
                  <td>{emp.employee_name}</td>

                  <td>
                    {emp.salary_set ? (
                      <span className="status success">
                        Salary Set
                      </span>
                    ) : (
                      <span className="status error">
                        Not Set
                      </span>
                    )}
                  </td>

                  <td>
                    {emp.lop_days > 0 ? (
                      <span className="status error">
                        {emp.lop_days} days
                      </span>
                    ) : (
                      <span className="status success">
                        0
                      </span>
                    )}
                  </td>

                  <td>
                    {emp.payslip_generated ? (
                      <span
                        className={`status ${emp.payslip_status?.toLowerCase()}`}
                      >
                        {emp.payslip_status}
                      </span>
                    ) : (
                      <span className="status pending">
                        Not Generated
                      </span>
                    )}
                  </td>

                  <td>
                    {emp.salary_set ? (
                      <>
                        {!emp.payslip_generated && (
                          <button
                            className="btn-payslip"
                            disabled={
                              loadingId ===
                              emp.employee_id
                            }
                            onClick={() =>
                              handleGeneratePayslip(
                                emp.employee_id
                              )
                            }
                          >
                            {loadingId ===
                            emp.employee_id
                              ? "Generating..."
                              : "Generate"}
                          </button>
                        )}

                        {emp.payslip_generated &&
                          emp.payslip_id && (
                            <>
                              <button
                                className="btn-payslip"
                                onClick={() =>
                                  handleDownload(
                                    emp.payslip_id
                                  )
                                }
                              >
                                Download PDF
                              </button>

                              <button
                                className="btn-email-single"
                                onClick={() =>
                                  handleSendSingleEmail(
                                    emp.employee_id
                                  )
                                }
                              >
                                Send Email
                              </button>
                            </>
                          )}
                      </>
                    ) : (
                      <button
                        disabled
                        className="btn-disabled"
                      >
                        Set Salary First
                      </button>
                    )}
                    <button
                      className="btn-fnf"
                      onClick={() => {
                        setSelectedEmployee(emp.employee_id);
                        setShowFNFModal(true);
                        setFnfResult(null);
                      }}
                    >
                      Full & Final
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {showFNFModal && (
  <div className="modal-overlay">
    <div className="modal-card">
      <h3>Full & Final Settlement</h3>

      <input
        type="date"
        placeholder="Last Working Date"
        value={fnfData.last_working_date}
        onChange={(e) =>
          setFnfData({
            ...fnfData,
            last_working_date: e.target.value,
          })
        }
      />

      <input
        type="number"
        placeholder="Notice Recovery"
        value={fnfData.notice_recovery}
        onChange={(e) =>
          setFnfData({
            ...fnfData,
            notice_recovery: e.target.value,
          })
        }
      />

      <input
        type="number"
        placeholder="Loan Recovery"
        value={fnfData.loan_recovery}
        onChange={(e) =>
          setFnfData({
            ...fnfData,
            loan_recovery: e.target.value,
          })
        }
      />

      <input
        type="number"
        placeholder="Bonus"
        value={fnfData.bonus}
        onChange={(e) =>
          setFnfData({
            ...fnfData,
            bonus: e.target.value,
          })
        }
      />

      <div style={{ marginTop: "12px" }}>
        <button
          className="btn-payslip"
          onClick={handleGenerateFNF}
        >
          Generate
        </button>

        <button
          className="btn-disabled"
          onClick={() => setShowFNFModal(false)}
          style={{ marginLeft: "10px" }}
        >
          Close
        </button>
      </div>

      {fnfResult && (
        <div className="fnf-summary">
          <p>Salary Earned: ₹ {fnfResult.salary_earned}</p>
          <p>Leave Encashment: ₹ {fnfResult.leave_encashment}</p>
          <p>TDS: ₹ {fnfResult.tds_amount}</p>
          <h4>
            Final Amount: ₹ {fnfResult.final_amount}
          </h4>
        </div>
      )}
    </div>
  </div>
)}
    </div>
  );
}