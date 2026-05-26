import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createTransaction, updateTransaction, getTransactionById, getDashboardSummary } from "../../api/daybook";
import { getVendors, getCategories } from "../../api/daybook";
import "../../styles/daybook.css";

export default function AddTransaction() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactionType, setTransactionType] = useState("DEBIT");
  const [currentBalance, setCurrentBalance] = useState(0);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    details: "",
    category: "",
    payment_mode: "CASH",
    amount: "",
    vendor: "",
    gst_applicable: false,
    gst_amount: "",
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        amount: isDebit ? res.data.debit_amount : res.data.credit_amount,
        vendor: isDebit ? res.data.to_vendor : res.data.from_vendor,
        gst_applicable: res.data.gst_applicable,
        gst_amount: res.data.gst_amount || "",
        bank_name: res.data.bank_name || "",
        account_number: res.data.account_number || "",
        ifsc_code: res.data.ifsc_code || "",
        account_holder_name: res.data.account_holder_name || "",
        upi_id: res.data.upi_id || "",
        cheque_number: res.data.cheque_number || ""
      });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount) {
      alert("Please enter amount");
      return;
    }

    // Check balance for debit transactions (including GST)
    if (transactionType === "DEBIT" && !isEdit) {
      const gstAmount = formData.gst_applicable ? parseFloat(formData.gst_amount || 0) : 0;
      const totalRequired = parseFloat(formData.amount) + gstAmount;
      
      if (currentBalance < totalRequired) {
        alert(`Insufficient balance!\n\nCurrent Balance: ₹${currentBalance.toLocaleString('en-IN')}\nBase Amount: ₹${parseFloat(formData.amount).toLocaleString('en-IN')}\nGST Amount: ₹${gstAmount.toLocaleString('en-IN')}\nTotal Required: ₹${totalRequired.toLocaleString('en-IN')}\n\nPlease add credit transaction first.`);
        return;
      }
    }

    try {
      const data = {
        date: formData.date,
        details: formData.details,
        category: formData.category,
        payment_mode: formData.payment_mode,
        debit_amount: transactionType === "DEBIT" ? formData.amount : 0,
        credit_amount: transactionType === "CREDIT" ? formData.amount : 0,
        bank_withdraw: 0,
        from_vendor: transactionType === "CREDIT" ? formData.vendor : null,
        to_vendor: transactionType === "DEBIT" ? formData.vendor : null,
        gst_applicable: formData.gst_applicable,
        gst_amount: formData.gst_amount || 0,
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
        alert("Failed to save transaction");
      }
    }
  };

  return (
    <div className="add-transaction-page">
      <div className="page-header">
        <h1>{isEdit ? "Edit Transaction" : "Add Transaction"}</h1>
        {transactionType === "DEBIT" && (
          <div className="balance-indicator" style={{
            padding: '10px 20px',
            backgroundColor: currentBalance > 0 ? '#d4edda' : '#f8d7da',
            color: currentBalance > 0 ? '#155724' : '#721c24',
            borderRadius: '5px',
            fontWeight: 'bold'
          }}>
            Available Balance: ₹{currentBalance.toLocaleString('en-IN')}
          </div>
        )}
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
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name} ({cat.category_type})</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Amount *</label>
          <input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="Enter amount"
            required
          />
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

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={formData.gst_applicable}
              onChange={(e) => setFormData({ ...formData, gst_applicable: e.target.checked })}
            />
            GST Applicable
          </label>
        </div>

        {formData.gst_applicable && (
          <div className="form-group">
            <label>GST Amount</label>
            <input
              type="number"
              step="0.01"
              value={formData.gst_amount}
              onChange={(e) => setFormData({ ...formData, gst_amount: e.target.value })}
            />
          </div>
        )}

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
