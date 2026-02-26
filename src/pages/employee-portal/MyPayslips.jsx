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


import { useEffect, useState } from "react";
import { myPayslips, downloadPayslipPDF } from "../../api/payroll";
import "../../styles/payroll.css";

export default function MyPayslips() {
  const [slips, setSlips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        const res = await myPayslips();

        // Sort latest month first
        const sorted = res.data.sort(
          (a, b) => new Date(b.month) - new Date(a.month)
        );

        setSlips(sorted);
      } catch (error) {
        alert("Failed to load payslips");
      } finally {
        setLoading(false);
      }
    };

    fetchPayslips();
  }, []);

  const formatMonth = (monthString) => {
    const date = new Date(monthString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const handleDownload = async (payslipId, month) => {
    try {
      setDownloadingId(payslipId);

      const res = await downloadPayslipPDF(payslipId);

      const blob = new Blob([res.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `Payslip_${month}.pdf`;
      link.click();
    } catch (error) {
      alert("Failed to download payslip");
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="payroll-page">
        <p className="loading-text">Loading payslips...</p>
      </div>
    );
  }

  return (
    <div className="payroll-page">
      <div className="page-header">
        <div>
          <h2>My Payslips</h2>
          <p>Download your monthly salary slips</p>
        </div>
      </div>

      {slips.length === 0 ? (
        <div className="empty-card">
          <h3>No Payslips Available</h3>
          <p>Your payslips will appear here once generated.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="payroll-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Net Pay</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {slips.map((slip) => (
                <tr key={slip.id}>
                  <td>{formatMonth(slip.month)}</td>

                  <td className="amount positive">
                    {formatCurrency(slip.net_pay)}
                  </td>

                  <td>
                    <span className={`status-badge ${slip.status.toLowerCase()}`}>
                      {slip.status}
                    </span>
                  </td>

                  <td>
                    <button
                      className="btn-payslip"
                      disabled={
                        downloadingId === slip.id ||
                        slip.status !== "APPROVED" &&
                        slip.status !== "PAID"
                      }
                      onClick={() =>
                        handleDownload(slip.id, slip.month)
                      }
                    >
                      {downloadingId === slip.id
                        ? "Downloading..."
                        : "Download PDF"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}