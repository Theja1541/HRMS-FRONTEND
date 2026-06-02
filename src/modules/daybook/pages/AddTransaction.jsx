import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createTransaction, updateTransaction, getTransactionById, getDashboardSummary } from "../../../api/daybook";
import { getVendors, getCategories } from "../../../api/daybook";
import "../../../styles/daybook.css";

export default function AddTransaction() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactionType, setTransactionType] = useState("DEBIT");
  const [currentBalance, setCurrentBalance] = useState(0);
  
  const [items, setItems] = useState([
    {
      product_name: "",
      quantity: 1,
      unit_price: "",
      amount: 0,
      gst_applicable: false,
      gst_rate: 0,
      gst_amount: 0,
      total_amount: 0,
      hsn_code: ""
    }
  ]);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    details: "",
    category: "",
    payment_mode: "CASH",
    vendor: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    account_holder_name: "",
    upi_id: "",
    cheque_number: ""
  });

  useEffect(() => {
    fetchVendors();
    fetchCategories();
    fetchBalance();
    if (isEdit) fetchTransaction();
  }, [id]);

  const fetchBalance = async () => {
    try {
      const res = await getDashboardSummary({});
      setCurrentBalance(res.data.balance || 0);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await getVendors();
      setVendors(res.data.results || res.data);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data.results || res.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchTransaction = async () => {
    try {
      const res = await getTransactionById(id);
      const isDebit = res.data.debit_amount > 0;
      setTransactionType(isDebit ? "DEBIT" : "CREDIT");
      setFormData({
        date: res.data.date,
        details: res.data.details,
        category: res.data.category,
        payment_mode: res.data.payment_mode,
        vendor: isDebit ? res.data.to_vendor : res.data.from_vendor,
        bank_name: res.data.bank_name || "",
        account_number: res.data.account_number || "",
        ifsc_code: res.data.ifsc_code || "",
        account_holder_name: res.data.account_holder_name || "",
        upi_id: res.data.upi_id || "",
        cheque_number: res.data.cheque_number || ""
      });
      if (res.data.items && res.data.items.length > 0) {
        setItems(res.data.items);
      }
    } catch (error) {
      console.error("Error fetching transaction:", error);
    }
  };

  const handleVendorChange = (vendorId) => {
    if (vendorId) {
      const selectedVendor = vendors.find(v => v.id === parseInt(vendorId));
      if (selectedVendor) {
        setFormData(prev => ({
          ...prev,
          vendor: vendorId,
          bank_name: selectedVendor.bank_name || "",
          account_number: selectedVendor.account_number || "",
          ifsc_code: selectedVendor.ifsc_code || "",
          account_holder_name: selectedVendor.account_holder_name || "",
          upi_id: selectedVendor.upi_id || ""
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        vendor: "",
        bank_name: "",
        account_number: "",
        ifsc_code: "",
        account_holder_name: "",
        upi_id: ""
      }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    
    if (field === 'gst_applicable') {
      newItems[index][field] = value;
      if (!value) {
        newItems[index].gst_rate = 0;
        newItems[index].gst_amount = 0;
      } else {
        newItems[index].gst_rate = 18; // Default GST rate when checked
      }
    } else {
      newItems[index][field] = value;
    }

    // Recalculate
    let qty = parseFloat(newItems[index].quantity) || 0;
    let price = parseFloat(newItems[index].unit_price) || 0;
    let amount = qty * price;
    newItems[index].amount = amount;

    if (newItems[index].gst_applicable) {
        let rate = parseFloat(newItems[index].gst_rate) || 0;
        newItems[index].gst_amount = (amount * rate) / 100;
    }
    
    newItems[index].total_amount = newItems[index].amount + newItems[index].gst_amount;
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, {
      product_name: "",
      quantity: 1,
      unit_price: "",
      amount: 0,
      gst_applicable: false,
      gst_rate: 0,
      gst_amount: 0,
      total_amount: 0,
      hsn_code: ""
    }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  const totalGst = items.reduce((sum, item) => sum + parseFloat(item.gst_amount || 0), 0);
  const grandTotal = items.reduce((sum, item) => sum + parseFloat(item.total_amount || 0), 0);
  const hasGst = items.some(item => item.gst_applicable);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (items.some(item => !item.product_name || !item.unit_price)) {
      alert("Please ensure all products have a name and unit price.");
      return;
    }

    try {
      const data = {
        date: formData.date,
        details: formData.details,
        category: formData.category,
        payment_mode: formData.payment_mode,
        debit_amount: transactionType === "DEBIT" ? grandTotal : 0,
        credit_amount: transactionType === "CREDIT" ? grandTotal : 0,
        bank_withdraw: 0,
        from_vendor: transactionType === "CREDIT" ? formData.vendor : null,
        to_vendor: transactionType === "DEBIT" ? formData.vendor : null,
        gst_applicable: hasGst,
        gst_amount: totalGst,
        items: items.map(item => ({
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          amount: item.amount,
          gst_applicable: item.gst_applicable,
          gst_rate: item.gst_rate,
          gst_amount: item.gst_amount,
          total_amount: item.total_amount,
          hsn_code: item.hsn_code
        })),
        bank_name: formData.payment_mode === "BANK" || formData.payment_mode === "CHEQUE" ? formData.bank_name : null,
        account_number: formData.payment_mode === "BANK" ? formData.account_number : null,
        ifsc_code: formData.payment_mode === "BANK" ? formData.ifsc_code : null,
        account_holder_name: formData.payment_mode === "BANK" ? formData.account_holder_name : null,
        upi_id: formData.payment_mode === "UPI" ? formData.upi_id : null,
        cheque_number: formData.payment_mode === "CHEQUE" ? formData.cheque_number : null
      };

      if (isEdit) {
        await updateTransaction(id, data);
      } else {
        await createTransaction(data);
      }
      navigate("/daybook/transactions");
    } catch (error) {
      console.error("Error saving transaction:", error);
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        const errors = error.response?.data;
        if (typeof errors === 'object') {
           alert("Validation Errors:\n" + Object.entries(errors).map(([k,v]) => `${k}: ${v}`).join('\n'));
        } else {
           alert("Failed to save transaction");
        }
      }
    }
  };

  return (
    <div className="add-transaction-page">
      <div className="page-header">
        <h1>{isEdit ? "Edit Transaction" : "Add Transaction"}</h1>
      </div>

      <form onSubmit={handleSubmit} className="transaction-form">
        <div className="form-group">
          <label>Date *</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Transaction Type *</label>
          <div className="radio-group">
            <label className="transaction-type-label">
              <input
                type="radio"
                value="DEBIT"
                checked={transactionType === "DEBIT"}
                onChange={(e) => setTransactionType(e.target.value)}
              />
              <span className="debit-label">💸 Debit (Money Out)</span>
            </label>
            <label className="transaction-type-label">
              <input
                type="radio"
                value="CREDIT"
                checked={transactionType === "CREDIT"}
                onChange={(e) => setTransactionType(e.target.value)}
              />
              <span className="credit-label">💰 Credit (Money In)</span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>Vendor</label>
          <select
            value={formData.vendor}
            onChange={(e) => handleVendorChange(e.target.value)}
          >
            <option value="">Select Vendor </option>
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
            ))}
          </select>
          <small className="form-hint">
            {transactionType === "DEBIT" ? "Who are you paying?" : "Who is paying you?"}
          </small>
        </div>

        <div className="form-group">
          <label>Category *</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
          >
            <option value="">Select Category</option>
            {categories
              .filter(cat => transactionType === "DEBIT" ? cat.category_type === "EXPENSE" : cat.category_type === "INCOME")
              .map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name} ({cat.category_type})</option>
            ))}
          </select>
        </div>

        {/* Dynamic Items Table */}
        <div className="items-table-container" style={{ margin: "25px 0", overflowX: "auto", background: "#ffffff", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)", border: "1px solid #e2e8f0" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a", fontWeight: "700" }}>Product Items</h3>
            <button
              type="button"
              onClick={addItem}
              style={{
                padding: "8px 16px",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "background 0.2s"
              }}
              onMouseOver={(e) => e.target.style.background = "#1d4ed8"}
              onMouseOut={(e) => e.target.style.background = "#2563eb"}
            >
              + Add Item
            </button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "1000px", fontSize: "14px" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0", color: "#475569" }}>
                <th style={{ padding: "14px 16px", fontWeight: "600" }}>Product Name *</th>
                <th style={{ padding: "14px 16px", width: "100px", fontWeight: "600", textAlign: "center" }}>Qty *</th>
                <th style={{ padding: "14px 16px", width: "140px", fontWeight: "600", textAlign: "right" }}>Unit Price *</th>
                <th style={{ padding: "14px 16px", width: "140px", fontWeight: "600", textAlign: "right" }}>Amount</th>
                <th style={{ padding: "14px 16px", width: "80px", fontWeight: "600", textAlign: "center" }}>GST?</th>
                <th style={{ padding: "14px 16px", width: "100px", fontWeight: "600", textAlign: "center" }}>GST %</th>
                <th style={{ padding: "14px 16px", width: "120px", fontWeight: "600", textAlign: "right" }}>GST Amt</th>
                <th style={{ padding: "14px 16px", width: "140px", fontWeight: "600", textAlign: "right" }}>Total</th>
                <th style={{ padding: "14px 16px", width: "70px", fontWeight: "600", textAlign: "center" }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #e2e8f0", transition: "background 0.2s" }} onMouseOver={(e) => e.currentTarget.style.background = "#f8fafc"} onMouseOut={(e) => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "12px 16px" }}>
                    <input
                      type="text"
                      value={item.product_name}
                      onChange={(e) => handleItemChange(index, "product_name", e.target.value)}
                      placeholder="Enter product or service name"
                      required
                      style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", outline: "none", fontSize: "14px", boxSizing: "border-box" }}
                      onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                      onBlur={(e) => e.target.style.borderColor = "#cbd5e1"}
                    />
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                      required
                      style={{ width: "100%", padding: "10px 8px", border: "1px solid #cbd5e1", borderRadius: "6px", outline: "none", fontSize: "14px", textAlign: "center", boxSizing: "border-box" }}
                      onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                      onBlur={(e) => e.target.style.borderColor = "#cbd5e1"}
                    />
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(index, "unit_price", e.target.value)}
                      required
                      style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", outline: "none", fontSize: "14px", textAlign: "right", boxSizing: "border-box" }}
                      onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                      onBlur={(e) => e.target.style.borderColor = "#cbd5e1"}
                    />
                  </td>
                  <td style={{ padding: "12px 16px", background: "#f1f5f9", fontWeight: "600", textAlign: "right", color: "#334155" }}>
                    ₹{parseFloat(item.amount || 0).toFixed(2)}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={item.gst_applicable}
                      onChange={(e) => handleItemChange(index, "gst_applicable", e.target.checked)}
                      style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#2563eb" }}
                    />
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={item.gst_rate}
                      onChange={(e) => handleItemChange(index, "gst_rate", e.target.value)}
                      disabled={!item.gst_applicable}
                      style={{ width: "100%", padding: "10px 8px", border: "1px solid #cbd5e1", borderRadius: "6px", outline: "none", fontSize: "14px", textAlign: "center", backgroundColor: !item.gst_applicable ? "#f1f5f9" : "#fff", boxSizing: "border-box" }}
                      onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                      onBlur={(e) => e.target.style.borderColor = "#cbd5e1"}
                    />
                  </td>
                  <td style={{ padding: "12px 16px", background: "#f1f5f9", fontWeight: "600", textAlign: "right", color: "#334155" }}>
                    ₹{parseFloat(item.gst_amount || 0).toFixed(2)}
                  </td>
                  <td style={{ padding: "12px 16px", background: "#f1f5f9", fontWeight: "700", textAlign: "right", color: "#0f172a" }}>
                    ₹{parseFloat(item.total_amount || 0).toFixed(2)}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                      style={{
                        background: "transparent",
                        color: items.length === 1 ? "#cbd5e1" : "#ef4444",
                        border: "none",
                        padding: "8px",
                        cursor: items.length === 1 ? "not-allowed" : "pointer",
                        fontSize: "18px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "4px",
                        transition: "background 0.2s, color 0.2s"
                      }}
                      onMouseOver={(e) => { if (items.length > 1) { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#b91c1c"; } }}
                      onMouseOut={(e) => { if (items.length > 1) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#ef4444"; } }}
                      title="Remove Item"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "25px",
          background: "#f8fafc",
          padding: "20px",
          borderRadius: "8px",
          border: "1px solid #e2e8f0"
        }}>
          <div style={{ width: "300px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ color: "#475569" }}>Subtotal:</span>
              <span style={{ fontWeight: "600" }}>₹{totalAmount.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ color: "#475569" }}>Total GST:</span>
              <span style={{ fontWeight: "600" }}>₹{totalGst.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "2px solid #e2e8f0" }}>
              <span style={{ fontWeight: "bold", fontSize: "16px", color: "#0f172a" }}>Grand Total:</span>
              <span style={{ fontWeight: "bold", fontSize: "16px", color: "#16a34a" }}>₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>


        <div className="form-group">
          <label>Payment Mode *</label>
          <div className="radio-group">
            {["CASH", "BANK", "UPI", "CHEQUE"].map((mode) => (
              <label key={mode}>
                <input
                  type="radio"
                  value={mode}
                  checked={formData.payment_mode === mode}
                  onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value })}
                />
                {mode}
              </label>
            ))}
          </div>
        </div>

        {formData.payment_mode === "BANK" && (
          <>
            <div className="form-group">
              <label>Bank Name *</label>
              <input
                type="text"
                value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                placeholder="Enter bank name"
                required
              />
            </div>
            <div className="form-group">
              <label>Account Number *</label>
              <input
                type="text"
                value={formData.account_number}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                placeholder="Enter account number"
                required
              />
            </div>
            <div className="form-group">
              <label>IFSC Code</label>
              <input
                type="text"
                value={formData.ifsc_code}
                onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value })}
                placeholder="Enter IFSC code"
              />
            </div>
            <div className="form-group">
              <label>Account Holder Name</label>
              <input
                type="text"
                value={formData.account_holder_name}
                onChange={(e) => setFormData({ ...formData, account_holder_name: e.target.value })}
                placeholder="Enter account holder name"
              />
            </div>
          </>
        )}

        {formData.payment_mode === "UPI" && (
          <div className="form-group">
            <label>UPI ID *</label>
            <input
              type="text"
              value={formData.upi_id}
              onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
              placeholder="Enter UPI ID (e.g., user@paytm)"
              required
            />
          </div>
        )}

        {formData.payment_mode === "CHEQUE" && (
          <>
            <div className="form-group">
              <label>Bank Name *</label>
              <input
                type="text"
                value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                placeholder="Enter bank name"
                required
              />
            </div>
            <div className="form-group">
              <label>Cheque Number *</label>
              <input
                type="text"
                value={formData.cheque_number}
                onChange={(e) => setFormData({ ...formData, cheque_number: e.target.value })}
                placeholder="Enter cheque number"
                required
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label>Details *</label>
          <textarea
            value={formData.details}
            onChange={(e) => setFormData({ ...formData, details: e.target.value })}
            required
            rows="3"
            placeholder="Enter transaction details"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {isEdit ? "Update" : "Save"} Transaction
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate("/daybook/transactions")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}