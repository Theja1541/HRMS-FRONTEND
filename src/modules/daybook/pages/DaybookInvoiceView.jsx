import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTransaction, getVendor } from "../services/daybookApi";
import { getCompanyBranding } from "../../../api/companies";

function numberToWords(num) {
  const a = ["", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ", "Ten ", "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  if ((num = num.toString()).length > 9) return "overflow";
  let n = ("000000000" + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return; let str = "";
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + " " + a[n[1][1]]) + "Crore " : "";
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + " " + a[n[2][1]]) + "Lakh " : "";
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + " " + a[n[3][1]]) + "Thousand " : "";
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + " " + a[n[4][1]]) + "Hundred " : "";
  str += (n[5] != 0) ? ((str != "") ? "and " : "") + (a[Number(n[5])] || b[n[5][0]] + " " + a[n[5][1]]) + "only" : "only";
  return str;
}

export default function DaybookInvoiceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const txnRes = await getTransaction(id);
        const txn = txnRes.data;
        setTransaction(txn);
        
        // Income means we invoice the from_vendor, Expense means we might be generating a purchase order.
        // Usually, an invoice we issue is to from_vendor (the client giving us money)
        const vendorId = txn.from_vendor || txn.to_vendor; 
        if (vendorId) {
          const vendorRes = await getVendor(vendorId);
          setVendor(vendorRes.data);
        }

        const compRes = await getCompanyBranding();
        setCompany(compRes.data);

      } catch (err) {
        console.error("Failed to load invoice details", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) return <div style={{ padding: 24 }}>Loading Invoice...</div>;
  if (!transaction || !company) return <div style={{ padding: 24 }}>Invoice details not found.</div>;

  // Use credit amount for income, debit amount for expenses, or whichever is larger as the base amount.
  const baseAmount = parseFloat(transaction.credit_amount) || parseFloat(transaction.debit_amount) || 0;
  
  // Calculate GST and Grand Total.
  const gstAmount = parseFloat(transaction.gst_amount) || 0;
  const grandTotal = baseAmount + gstAmount;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const day = d.getDate();
    const suffix = ["th", "st", "nd", "rd"][(day % 10 > 3) ? 0 : (day - day % 10 !== 10) * day % 10] || "th";
    const month = d.toLocaleString('default', { month: 'long' });
    const year = d.getFullYear();
    return `${day}${suffix} ${month} ${year}`;
  };

  const pName = company.name || "COMPANY NAME NOT SET";
  const pAddress = company.address || "";
  // In daybook we don't have mobile for company directly in accounts yet, falling back to empty.
  const pMobile = company.phone || "";
  const pGstin = company.gstin || "";
  const pState = company.state || "";
  const pStateCode = company.state_code || "";

  const bankAccount = company.bank_account_no || "";
  const bankIfsc = company.bank_ifsc || "";
  const bankBranch = company.bank_branch || "";

  const renderAmount = (amt) => {
    return new Intl.NumberFormat('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amt);
  };

  return (
    <div style={{ backgroundColor: "#f1f5f9", minHeight: "100vh", padding: "40px 24px" }}>
      <div className="no-print" style={{ maxWidth: 1000, margin: "0 auto 20px auto", display: "flex", justifyContent: "space-between" }}>
        <button className="btn" onClick={() => navigate(-1)}>← Back</button>
        <button className="btn primary" onClick={() => window.print()}>🖨️ Print Invoice</button>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-invoice, #printable-invoice * { visibility: visible; }
          #printable-invoice { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; margin: 0 !important; padding: 20px !important; }
          .no-print { display: none !important; }
          @page { size: auto; margin: 0mm; }
        }
        .invoice-table { width: 100%; border-collapse: collapse; border: 2px solid #000; font-family: "Times New Roman", Times, serif; font-size: 14px; color: #000; }
        .invoice-table th, .invoice-table td { border: 1px solid #000; padding: 4px 8px; vertical-align: top; }
        .invoice-table th { font-weight: bold; }
        .bg-blue { background-color: #b9d7ea !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      `}</style>

      <div id="printable-invoice" style={{ maxWidth: 1000, margin: "0 auto", background: "#fff", padding: "40px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
        
        <table className="invoice-table">
          <tbody>
            {/* 1. Header Details (Bordered inside Table) */}
            <tr>
              <td colSpan="8" style={{ padding: "12px", borderBottom: "none" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ flex: "0 0 100px", textAlign: "left" }}>
                    {company.logo_url ? (
                      <img src={company.logo_url} alt="Logo" style={{ maxHeight: "60px", maxWidth: "100px", objectFit: "contain" }} />
                    ) : (
                      <div style={{ 
                        display: "inline-flex", alignItems: "center", justifyContent: "center", 
                        width: "60px", height: "60px", borderRadius: "8px", 
                        background: "#1e3a8a", color: "#fff", fontWeight: "bold", fontSize: "24px"
                      }}>
                        {pName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div style={{ flex: "1", textAlign: "center", paddingRight: "100px" }}>
                    <h1 style={{ margin: "0 0 5px 0", fontSize: "24px", fontWeight: "bold", textTransform: "uppercase" }}>{pName}</h1>
                    <p style={{ margin: "0 0 5px 0", fontSize: "14px", fontWeight: "bold" }}>{pAddress}</p>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan="8" style={{ borderTop: "none", borderBottom: "none", padding: "4px 8px" }}>
                <strong>Mobile # {pMobile}</strong>
              </td>
            </tr>
            <tr>
              <td colSpan="2" style={{ fontWeight: "bold" }}>GSTIN:</td>
              <td colSpan="6" style={{ fontWeight: "bold" }}>{pGstin}</td>
            </tr>

            {/* 2. TAX INVOICE Title Row */}
            <tr>
              <th colSpan="8" className="bg-blue" style={{ textAlign: "center", fontSize: "16px", padding: "6px" }}>
                TAX INVOICE
              </th>
            </tr>

            {/* 3. Invoice Metadata Rows */}
            <tr>
              <td colSpan="2" style={{ fontWeight: "bold" }}>INVOICE #</td>
              <td colSpan="2" style={{ fontWeight: "bold" }}>{transaction.transaction_number || `TXN-${transaction.id}`}</td>
              <td colSpan="2" style={{ fontWeight: "bold" }}>STATE</td>
              <td colSpan="2" style={{ fontWeight: "bold" }}>{pState}</td>
            </tr>
            <tr>
              <td colSpan="2" style={{ fontWeight: "bold" }}>DATE</td>
              <td colSpan="2" style={{ fontWeight: "bold" }}>{formatDate(transaction.date)}</td>
              <td colSpan="2" style={{ fontWeight: "bold" }}>STATE CO</td>
              <td colSpan="2" style={{ fontWeight: "bold" }}>{pStateCode}</td>
            </tr>
            
            {/* 4. Invoice To Section */}
            <tr>
              <th colSpan="8" className="bg-blue" style={{ textAlign: "left", fontSize: "15px" }}>
                INVOICE TO
              </th>
            </tr>
            <tr>
              <td colSpan="2" style={{ fontWeight: "bold" }}>Name:</td>
              <td colSpan="6" style={{ fontWeight: "bold" }}>{vendor ? vendor.name : "N/A"}</td>
            </tr>
            <tr>
              <td colSpan="2" style={{ fontWeight: "bold" }}>Address:</td>
              <td colSpan="6" style={{ fontWeight: "bold" }}>
                {vendor ? (vendor.address || "—") : "—"}
              </td>
            </tr>
            <tr>
              <td colSpan="2" style={{ fontWeight: "bold" }}>GST No:</td>
              <td colSpan="6" style={{ fontWeight: "bold", backgroundColor: vendor?.gstin ? "#ffff00" : "transparent", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
                {vendor ? (vendor.gstin || "—") : "—"}
              </td>
            </tr>

            {/* 5. Production Items Header */}
            <tr>
              <th style={{ width: "5%", textAlign: "center", backgroundColor: "#e2e8f0", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact", padding: "8px 4px" }}>Sr.No</th>
              <th style={{ width: "25%", textAlign: "left", backgroundColor: "#e2e8f0", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact", padding: "8px" }}>Product Name</th>
              <th style={{ width: "10%", textAlign: "center", backgroundColor: "#e2e8f0", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact", padding: "8px" }}>Qty</th>
              <th style={{ width: "12%", textAlign: "right", backgroundColor: "#e2e8f0", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact", padding: "8px" }}>Unit Price</th>
              <th style={{ width: "12%", textAlign: "right", backgroundColor: "#e2e8f0", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact", padding: "8px" }}>Amount</th>
              <th style={{ width: "8%", textAlign: "center", backgroundColor: "#e2e8f0", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact", padding: "8px" }}>GST %</th>
              <th style={{ width: "12%", textAlign: "right", backgroundColor: "#e2e8f0", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact", padding: "8px" }}>GST Amt</th>
              <th style={{ width: "16%", textAlign: "right", backgroundColor: "#e2e8f0", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact", padding: "8px" }}>Total Amount</th>
            </tr>
            
            {/* 6. Production Items Row */}
            {transaction.items && transaction.items.length > 0 ? (
              transaction.items.map((item, index) => (
                <tr key={index} style={index === transaction.items.length - 1 ? { height: "100px" } : {}}>
                  <td style={{ textAlign: "center", padding: "8px 4px" }}>{index + 1}</td>
                  <td style={{ padding: "8px" }}><strong>{item.product_name}</strong></td>
                  <td style={{ textAlign: "center", padding: "8px" }}>{item.quantity}</td>
                  <td style={{ textAlign: "right", padding: "8px" }}>{renderAmount(item.unit_price)}</td>
                  <td style={{ textAlign: "right", padding: "8px" }}>{renderAmount(item.amount)}</td>
                  <td style={{ textAlign: "center", padding: "8px" }}>{item.gst_applicable ? `${item.gst_rate}%` : "-"}</td>
                  <td style={{ textAlign: "right", padding: "8px" }}>{renderAmount(item.gst_amount)}</td>
                  <td style={{ textAlign: "right", padding: "8px" }}><strong>{renderAmount(item.total_amount)}</strong></td>
                </tr>
              ))
            ) : (
              <tr style={{ height: "100px" }}>
                <td style={{ textAlign: "center", padding: "8px 4px" }}>1</td>
                <td style={{ padding: "8px" }}>{transaction.details}</td>
                <td style={{ textAlign: "center", padding: "8px" }}>1</td>
                <td style={{ textAlign: "right", padding: "8px" }}>{renderAmount(baseAmount)}</td>
                <td style={{ textAlign: "right", padding: "8px" }}>{renderAmount(baseAmount)}</td>
                <td style={{ textAlign: "center", padding: "8px" }}>{transaction.gst_rate > 0 ? `${transaction.gst_rate}%` : "-"}</td>
                <td style={{ textAlign: "right", padding: "8px" }}>{renderAmount(gstAmount)}</td>
                <td style={{ textAlign: "right", padding: "8px" }}><strong>{renderAmount(grandTotal)}</strong></td>
              </tr>
            )}

            {/* 7. Totals Rows */}
            <tr>
              <td colSpan="7" style={{ textAlign: "right", fontWeight: "bold", padding: "8px" }}>Total Amount Before Tax</td>
              <td style={{ textAlign: "right", fontWeight: "bold", padding: "8px" }}>{renderAmount(baseAmount)}</td>
            </tr>
            <tr>
              <td colSpan="7" style={{ textAlign: "right", padding: "8px" }}>
                {transaction.gst_rate > 0 ? `Total GST` : "Total GST"}
              </td>
              <td style={{ textAlign: "right", padding: "8px" }}>{renderAmount(gstAmount)}</td>
            </tr>
            <tr>
              <td colSpan="7" style={{ textAlign: "right", fontWeight: "bold", padding: "8px" }}>GRAND TOTAL</td>
              <td style={{ textAlign: "right", fontWeight: "bold", padding: "8px", fontSize: "16px" }}>{renderAmount(grandTotal)}</td>
            </tr>

            {/* 8. Amount in Words Row */}
            <tr>
              <td colSpan="8" style={{ fontWeight: "bold", padding: "8px" }}>
                Total Invoice Amount (In words):- {numberToWords(Math.round(grandTotal))}
              </td>
            </tr>

            {/* 9. Bank & Signatory Row */}
            <tr>
              <td colSpan="4" style={{ width: "50%", padding: "8px", verticalAlign: "top" }}>
                <h4 style={{ margin: "0 0 5px 0", textDecoration: "underline", fontSize: "15px", fontWeight: "bold" }}>Bank Details</h4>
                <p style={{ margin: "2px 0", fontWeight: "bold", backgroundColor: "#ffff00", display: "inline-block", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>A/c # : {bankAccount}</p><br/>
                <p style={{ margin: "2px 0", fontWeight: "bold" }}>IFSC: {bankIfsc}</p>
                <p style={{ margin: "2px 0", fontWeight: "bold", backgroundColor: "#ffff00", display: "inline-block", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>BRANCH: {bankBranch}</p>
              </td>
              <td colSpan="4" style={{ width: "50%", padding: "8px", verticalAlign: "top" }}>
                <div style={{ height: "100px", display: "flex", flexDirection: "column", justifyContent: "space-between", textAlign: "right" }}>
                  <div style={{ fontSize: "11px", fontStyle: "italic" }}>Quatation that the particular given above are ture and correct</div>
                  <div style={{ fontWeight: "bold", fontSize: "13px" }}>For {pName}</div>
                  <div style={{ fontWeight: "bold", fontSize: "13px", marginTop: "auto" }}>Authorised Signatory</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

      </div>
    </div>
  );
}
