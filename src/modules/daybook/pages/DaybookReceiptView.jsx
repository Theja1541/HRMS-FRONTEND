import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTransaction, getVendor } from "../services/daybookApi";
import { getCompanyBranding } from "../../../api/companies";

function numberToWords(num) {
  const a = ["", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ", "Ten ", "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  if ((num = num.toString()).length > 9) return "overflow";
  let n = ("000000000" + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return ""; 
  let str = "";
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + " " + a[n[1][1]]) + "Crore " : "";
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + " " + a[n[2][1]]) + "Lakh " : "";
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + " " + a[n[3][1]]) + "Thousand " : "";
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + " " + a[n[4][1]]) + "Hundred " : "";
  str += (n[5] != 0) ? ((str !== "") ? "and " : "") + (a[Number(n[5])] || b[n[5][0]] + " " + a[n[5][1]]) + "Only" : "Only";
  return str;
}

export default function DaybookReceiptView() {
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

        const vendorId = txn.from_vendor || txn.to_vendor;
        if (vendorId) {
          const vendorRes = await getVendor(vendorId);
          setVendor(vendorRes.data);
        }

        const compRes = await getCompanyBranding();
        setCompany(compRes.data);
      } catch (err) {
        console.error("Failed to load receipt details", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) return <div style={{ padding: 24 }}>Loading Receipt...</div>;
  if (!transaction || !company) return <div style={{ padding: 24 }}>Receipt details not found.</div>;

  const amount = parseFloat(transaction.credit_amount) || parseFloat(transaction.debit_amount) || 0;
  const gstAmount = parseFloat(transaction.gst_amount) || 0;
  const totalAmount = amount + gstAmount;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const day = d.getDate();
    const suffix = ["th", "st", "nd", "rd"][(day % 10 > 3) ? 0 : (day - day % 10 !== 10) * day % 10] || "th";
    const month = d.toLocaleString("default", { month: "long" });
    const year = d.getFullYear();
    return `${day}${suffix} ${month} ${year}`;
  };

  const getFriendlyPaymentMode = (mode) => {
    if (mode === "BANK") return "Bank Transfer / Online";
    if (mode === "UPI") return "UPI / Online Payment";
    if (mode === "CHEQUE") return "Cheque Payment";
    return "Cash Payment";
  };

  const pName = company.name || "COMPANY NAME NOT SET";
  const pAddress = company.address || "";
  const pGstin = company.gstin || "";
  const pEmail = company.admin_email || company.email || "support@geniusmindstech.com";
  const pPhone = company.phone || "";
  
  // Custom GMMC branding defaults if GMMC company
  const isGMMC = pName.toLowerCase().includes("genius minds");
  const pWeb = isGMMC ? "www.geniusmindstech.com" : (company.domain || "www.geniusmindstech.com");

  return (
    <div style={{ backgroundColor: "#f1f5f9", minHeight: "100vh", padding: "40px 24px" }}>
      <div className="no-print" style={{ maxWidth: 800, margin: "0 auto 20px auto", display: "flex", justifyContent: "space-between" }}>
        <button className="btn" style={{ padding: "8px 16px", border: "1px solid #cbd5e1", borderRadius: "6px", background: "#fff", cursor: "pointer" }} onClick={() => navigate(-1)}>← Back</button>
        <button className="btn primary" style={{ padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }} onClick={() => window.print()}>🖨️ Print Receipt</button>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-receipt, #printable-receipt * { visibility: visible; }
          #printable-receipt { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; margin: 0 !important; padding: 0 !important; }
          .no-print { display: none !important; }
          @page { size: auto; margin: 15mm; }
        }
        .receipt-container {
          font-family: 'Outfit', 'Inter', sans-serif;
          max-width: 800px;
          margin: 0 auto;
          background: #ffffff;
          padding: 50px;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.06);
          color: #1e293b;
          border: 1px solid #e2e8f0;
        }
      `}</style>

      <div id="printable-receipt" className="receipt-container">
        {/* Tenant Logo */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          {company.logo_url ? (
            <img src={company.logo_url} alt="Logo" style={{ maxHeight: "75px", maxWidth: "250px", objectFit: "contain" }} />
          ) : (
            <div style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              justifyContent: "center", 
              width: "64px", 
              height: "64px", 
              borderRadius: "50%", 
              background: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
              color: "#fff",
              fontWeight: "bold",
              fontSize: "24px"
            }}>
              {pName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Title */}
        <h2 style={{ 
          textAlign: "center", 
          textDecoration: "underline", 
          fontSize: "22px", 
          fontWeight: "700", 
          color: "#0f172a",
          margin: "0 0 35px 0"
        }}>
          Payment Receipt
        </h2>

        {/* Tenant Address Info */}
        <div style={{ marginBottom: "25px", fontSize: "14px", lineHeight: "1.6" }}>
          <strong style={{ fontSize: "16px", color: "#0f172a" }}>{pName}</strong>
          <div>{pAddress}</div>
        </div>

        {/* Receipt Meta (No, Date) */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "25px", fontSize: "14px", borderBottom: "1px solid #f1f5f9", paddingBottom: "15px" }}>
          <div>
            <strong>Receipt No:</strong> {transaction.transaction_number || `REC-${transaction.id}`}
          </div>
          <div>
            <strong>Date:</strong> {formatDate(transaction.date)}
          </div>
        </div>

        {/* Client / Vendor Info */}
        <div style={{ marginBottom: "30px", fontSize: "14px", lineHeight: "1.6" }}>
          <div style={{ fontWeight: "700", color: "#64748b", textTransform: "uppercase", fontSize: "12px", letterSpacing: "0.05em", marginBottom: "6px" }}>
            {transaction.debit_amount > 0 ? "Paying To:" : "Received From:"}
          </div>
          <strong style={{ fontSize: "15px", color: "#0f172a" }}>{vendor ? vendor.name : "N/A"}</strong>
          <div>{vendor && vendor.address ? vendor.address : ""}</div>
        </div>

        {/* Product Items Table */}
        <div style={{ marginBottom: "30px", fontSize: "14px", lineHeight: "1.6" }}>
          {transaction.items && transaction.items.length > 0 && (
            <div style={{ marginTop: "15px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #e2e8f0", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                    <th style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "left" }}>Product Name</th>
                    <th style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center", width: "60px" }}>Qty</th>
                    <th style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "right", width: "90px" }}>Unit Price</th>
                    <th style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "right", width: "90px" }}>Amount</th>
                    <th style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center", width: "60px" }}>GST %</th>
                    <th style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "right", width: "90px" }}>GST Amt</th>
                    <th style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "right", width: "100px" }}>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transaction.items.map((item, index) => (
                    <tr key={index}>
                      <td style={{ padding: "8px", border: "1px solid #e2e8f0", color: "#1e293b", fontWeight: "500" }}>{item.product_name}</td>
                      <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>{item.quantity}</td>
                      <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "right" }}>₹{parseFloat(item.unit_price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "right" }}>₹{parseFloat(item.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>{item.gst_applicable ? `${item.gst_rate}%` : "-"}</td>
                      <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "right" }}>₹{parseFloat(item.gst_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "right", fontWeight: "600" }}>₹{parseFloat(item.total_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Total Amount & Words */}
        <div style={{ marginBottom: "30px", background: "#f8fafc", padding: "20px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
          <div style={{ fontWeight: "700", color: "#64748b", textTransform: "uppercase", fontSize: "12px", letterSpacing: "0.05em", marginBottom: "8px" }}>
            {transaction.debit_amount > 0 ? "Total Amount Paid:" : "Total Amount Received:"}
          </div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a" }}>
            ₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: "13px", fontStyle: "italic", color: "#475569", marginTop: "4px" }}>
            (Equivalent: Rupees {numberToWords(Math.round(totalAmount))})
          </div>
        </div>

        {/* Payment Metadata */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "40px", fontSize: "14px", borderTop: "1px solid #f1f5f9", paddingTop: "20px" }}>
          <div>
            <strong>Payment Mode:</strong> {getFriendlyPaymentMode(transaction.payment_mode)}
          </div>
          <div>
            <strong>Purpose:</strong> Payment {transaction.debit_amount > 0 ? "paid" : "received"} against Transaction {transaction.transaction_number || `TXN-${transaction.id}`} dated {formatDate(transaction.date)}
          </div>
        </div>

        {/* Authorized Signatory */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "50px", fontSize: "14px" }}>
          <div style={{ lineHeight: "2" }}>
            <strong>Authorized Signatory</strong>
            <div>Signature: _______________________</div>
            <div>Seal:</div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          borderTop: "1px solid #cbd5e1", 
          paddingTop: "20px", 
          textAlign: "center", 
          fontSize: "11px", 
          color: "#64748b",
          lineHeight: "1.6"
        }}>
          <strong style={{ color: "#475569", textTransform: "uppercase" }}>{pName}</strong>
          <div>(GST NO: {pGstin || "N/A"})</div>
          <div>Corporate Office: {pAddress} {pPhone && `| Phone: ${pPhone}`}</div>
          <div>Email: {pEmail} | Website: <a href={`https://${pWeb}`} target="_blank" rel="noreferrer" style={{ color: "#2563eb", textDecoration: "none" }}>{pWeb}</a></div>
        </div>
      </div>
    </div>
    
  );
}
