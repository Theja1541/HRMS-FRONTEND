import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { transactionSchema } from "../validations/transactionSchema";
import { createTransaction, getTransaction, updateTransaction, getVendors, getCategories } from "../services/daybookApi";
import { useNavigate, useParams } from "react-router-dom";
import "../../../styles/daybook.css";

export default function TransactionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);

  const { control, handleSubmit, watch, reset, formState: { errors } } = useForm({
    resolver: yupResolver(transactionSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      details: "",
      category: "",
      payment_mode: "CASH",
      debit_amount: 0,
      credit_amount: 0,
      from_vendor: null,
      to_vendor: null,
      gst_applicable: false,
      gst_amount: 0,
      bank_name: "",
      account_number: "",
      upi_id: "",
      cheque_number: ""
    }
  });

  const paymentMode = watch("payment_mode");
  const gstApplicable = watch("gst_applicable");

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [vRes, cRes] = await Promise.all([getVendors(), getCategories()]);
        
        const vData = vRes.data;
        const cData = cRes.data;
        
        setVendors(Array.isArray(vData) ? vData : (vData?.results || []));
        setCategories(Array.isArray(cData) ? cData : (cData?.results || []));
      } catch (err) {
        console.error("Error fetching dropdowns", err);
      }
    };
    fetchDropdowns();

    if (isEdit) {
      getTransaction(id).then(res => {
        reset({ ...res.data, from_vendor: res.data.from_vendor || "", to_vendor: res.data.to_vendor || "" });
      });
    }
  }, [id, isEdit, reset]);

  const onSubmit = async (data) => {
    if (!data.from_vendor) data.from_vendor = null;
    if (!data.to_vendor) data.to_vendor = null;
    
    // Ensure date is formatted as YYYY-MM-DD
    if (data.date instanceof Date) {
      data.date = data.date.toISOString().split('T')[0];
    } else if (typeof data.date === 'string' && data.date.includes('T')) {
      data.date = data.date.split('T')[0];
    }

    try {
      if (isEdit) {
        await updateTransaction(id, data);
      } else {
        await createTransaction(data);
      }
      navigate("/daybook/transactions");
    } catch (err) {
      console.error("Submit error", err.response?.data || err.message);
      alert(JSON.stringify(err.response?.data || err.message));
    }
  };

  return (
    <div className="daybook-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">{isEdit ? "Edit Transaction" : "Add Transaction"}</h2>
          <p className="page-subtitle">Record a new daybook entry</p>
        </div>
        <div className="header-actions">
          <button className="btn" style={{ background: 'white', color: '#1e293b' }} onClick={() => navigate("/daybook/transactions")}>
            Cancel
          </button>
        </div>
      </div>

      <div className="dashboard-card" style={{ maxWidth: "900px", margin: "0 auto", padding: "32px", border: "none", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)" }}>
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          
          {/* Section 1 */}
          <div style={{ background: "#f8fafc", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ margin: "0 0 20px 0", fontSize: "16px", color: "#334155", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#3b82f6", color: "white", width: "24px", height: "24px", borderRadius: "50%", fontSize: "12px", fontWeight: "bold" }}>1</span>
              Basic Information
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "14px", fontWeight: "500", color: "#475569" }}>Date</label>
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => <input type="date" style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${errors.date ? '#ef4444' : '#cbd5e1'}`, outline: "none", transition: "border 0.2s" }} {...field} />}
                />
                {errors.date && <span style={{ color: "#ef4444", fontSize: "12px" }}>{errors.date.message}</span>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "14px", fontWeight: "500", color: "#475569" }}>Category</label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <select style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${errors.category ? '#ef4444' : '#cbd5e1'}`, outline: "none", background: "white" }} {...field}>
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  )}
                />
                {errors.category && <span style={{ color: "#ef4444", fontSize: "12px" }}>{errors.category.message}</span>}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "14px", fontWeight: "500", color: "#475569" }}>Details</label>
              <Controller
                name="details"
                control={control}
                render={({ field }) => <textarea rows="3" style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${errors.details ? '#ef4444' : '#cbd5e1'}`, outline: "none", resize: "vertical" }} placeholder="Enter transaction details..." {...field} />}
              />
              {errors.details && <span style={{ color: "#ef4444", fontSize: "12px" }}>{errors.details.message}</span>}
            </div>
          </div>

          {/* Section 2 */}
          <div style={{ background: "#f8fafc", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ margin: "0 0 20px 0", fontSize: "16px", color: "#334155", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#3b82f6", color: "white", width: "24px", height: "24px", borderRadius: "50%", fontSize: "12px", fontWeight: "bold" }}>2</span>
              Transaction Amounts
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "14px", fontWeight: "500", color: "#475569" }}>Debit Amount (Expense)</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "12px", top: "10px", color: "#94a3b8" }}>₹</span>
                  <Controller
                    name="debit_amount"
                    control={control}
                    render={({ field }) => <input type="number" step="0.01" style={{ width: "100%", padding: "10px 12px 10px 30px", boxSizing: "border-box", borderRadius: "8px", border: `1px solid ${errors.debit_amount ? '#ef4444' : '#cbd5e1'}`, outline: "none" }} {...field} />}
                  />
                </div>
                {errors.debit_amount && <span style={{ color: "#ef4444", fontSize: "12px" }}>{errors.debit_amount.message}</span>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "14px", fontWeight: "500", color: "#475569" }}>Credit Amount (Income)</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "12px", top: "10px", color: "#94a3b8" }}>₹</span>
                  <Controller
                    name="credit_amount"
                    control={control}
                    render={({ field }) => <input type="number" step="0.01" style={{ width: "100%", padding: "10px 12px 10px 30px", boxSizing: "border-box", borderRadius: "8px", border: `1px solid ${errors.credit_amount ? '#ef4444' : '#cbd5e1'}`, outline: "none" }} {...field} />}
                  />
                </div>
                {errors.credit_amount && <span style={{ color: "#ef4444", fontSize: "12px" }}>{errors.credit_amount.message}</span>}
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div style={{ background: "#f8fafc", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ margin: "0 0 20px 0", fontSize: "16px", color: "#334155", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#3b82f6", color: "white", width: "24px", height: "24px", borderRadius: "50%", fontSize: "12px", fontWeight: "bold" }}>3</span>
              Vendor Details
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "14px", fontWeight: "500", color: "#475569" }}>From Vendor</label>
                <Controller
                  name="from_vendor"
                  control={control}
                  render={({ field }) => (
                    <select style={{ padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", background: "white" }} {...field}>
                      <option value="">None</option>
                      {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                  )}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "14px", fontWeight: "500", color: "#475569" }}>To Vendor</label>
                <Controller
                  name="to_vendor"
                  control={control}
                  render={({ field }) => (
                    <select style={{ padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", background: "white" }} {...field}>
                      <option value="">None</option>
                      {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Section 4 */}
          <div style={{ background: "#f8fafc", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ margin: "0 0 20px 0", fontSize: "16px", color: "#334155", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#3b82f6", color: "white", width: "24px", height: "24px", borderRadius: "50%", fontSize: "12px", fontWeight: "bold" }}>4</span>
              GST & Payment Details
            </h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '100%', padding: '10px 0' }}>
                  <Controller
                    name="gst_applicable"
                    control={control}
                    render={({ field }) => (
                      <div className="custom-checkbox" style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => field.onChange(!field.value)}>
                        <div style={{ width: "20px", height: "20px", borderRadius: "4px", border: `2px solid ${field.value ? '#3b82f6' : '#cbd5e1'}`, background: field.value ? '#3b82f6' : 'white', display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                          {field.value && <span style={{ color: "white", fontSize: "12px" }}>✓</span>}
                        </div>
                        <span style={{ fontSize: "14px", fontWeight: "500", color: "#475569", userSelect: "none" }}>GST Applicable</span>
                      </div>
                    )}
                  />
                </div>
              </div>
              
              {gstApplicable && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "14px", fontWeight: "500", color: "#475569" }}>GST Amount</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "12px", top: "10px", color: "#94a3b8" }}>₹</span>
                    <Controller
                      name="gst_amount"
                      control={control}
                      render={({ field }) => <input type="number" step="0.01" style={{ width: "100%", padding: "10px 12px 10px 30px", boxSizing: "border-box", borderRadius: "8px", border: `1px solid ${errors.gst_amount ? '#ef4444' : '#cbd5e1'}`, outline: "none" }} {...field} />}
                    />
                  </div>
                  {errors.gst_amount && <span style={{ color: "#ef4444", fontSize: "12px" }}>{errors.gst_amount.message}</span>}
                </div>
              )}
            </div>

            <div style={{ borderTop: "1px solid #e2e8f0", margin: "20px 0" }}></div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "14px", fontWeight: "500", color: "#475569" }}>Payment Mode</label>
                <Controller
                  name="payment_mode"
                  control={control}
                  render={({ field }) => (
                    <select style={{ padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", background: "white" }} {...field}>
                      <option value="CASH">💵 Cash</option>
                      <option value="BANK">🏦 Bank Transfer</option>
                      <option value="UPI">📱 UPI</option>
                      <option value="CHEQUE">📝 Cheque</option>
                    </select>
                  )}
                />
              </div>

              {paymentMode === "BANK" && (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "14px", fontWeight: "500", color: "#475569" }}>Bank Name</label>
                    <Controller
                      name="bank_name"
                      control={control}
                      render={({ field }) => <input type="text" style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${errors.bank_name ? '#ef4444' : '#cbd5e1'}`, outline: "none" }} placeholder="e.g. HDFC Bank" {...field} />}
                    />
                    {errors.bank_name && <span style={{ color: "#ef4444", fontSize: "12px" }}>{errors.bank_name.message}</span>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", gridColumn: "span 2" }}>
                    <label style={{ fontSize: "14px", fontWeight: "500", color: "#475569" }}>Account Number</label>
                    <Controller
                      name="account_number"
                      control={control}
                      render={({ field }) => <input type="text" style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${errors.account_number ? '#ef4444' : '#cbd5e1'}`, outline: "none" }} placeholder="Account ending in..." {...field} />}
                    />
                    {errors.account_number && <span style={{ color: "#ef4444", fontSize: "12px" }}>{errors.account_number.message}</span>}
                  </div>
                </>
              )}

              {paymentMode === "UPI" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "14px", fontWeight: "500", color: "#475569" }}>UPI ID</label>
                  <Controller
                    name="upi_id"
                    control={control}
                    render={({ field }) => <input type="text" style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${errors.upi_id ? '#ef4444' : '#cbd5e1'}`, outline: "none" }} placeholder="example@upi" {...field} />}
                  />
                  {errors.upi_id && <span style={{ color: "#ef4444", fontSize: "12px" }}>{errors.upi_id.message}</span>}
                </div>
              )}

              {paymentMode === "CHEQUE" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "14px", fontWeight: "500", color: "#475569" }}>Cheque Number</label>
                  <Controller
                    name="cheque_number"
                    control={control}
                    render={({ field }) => <input type="text" style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${errors.cheque_number ? '#ef4444' : '#cbd5e1'}`, outline: "none" }} placeholder="6-digit cheque number" {...field} />}
                  />
                  {errors.cheque_number && <span style={{ color: "#ef4444", fontSize: "12px" }}>{errors.cheque_number.message}</span>}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: "16px", justifyContent: "flex-end", marginTop: "10px" }}>
            <button type="button" onClick={() => navigate("/daybook/transactions")} style={{ padding: "12px 24px", borderRadius: "8px", background: "white", color: "#475569", border: "1px solid #cbd5e1", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }} onMouseOver={(e) => e.target.style.background = "#f1f5f9"} onMouseOut={(e) => e.target.style.background = "white"}>
              Cancel
            </button>
            <button type="submit" style={{ padding: "12px 24px", borderRadius: "8px", background: "#3b82f6", color: "white", border: "none", fontWeight: "600", cursor: "pointer", boxShadow: "0 4px 14px 0 rgba(59, 130, 246, 0.39)", transition: "all 0.2s" }} onMouseOver={(e) => e.target.style.transform = "translateY(-1px)"} onMouseOut={(e) => e.target.style.transform = "none"}>
              {isEdit ? "Save Changes" : "Create Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
