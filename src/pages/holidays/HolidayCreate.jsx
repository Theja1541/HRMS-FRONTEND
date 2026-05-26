import { useState, useEffect } from "react";
import { createHoliday, updateHoliday, getHolidayById } from "../../api/holidays";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/dashboard.css";

export default function HolidayCreate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    holiday_name: "",
    from_date: "",
    to_date: "",
    holiday_type: "PUBLIC",
    payment_type: "PAID",
    state: "ALL",
    description: "",
    is_active: true
  });

  useEffect(() => {
    if (isEdit) {
      fetchHoliday();
    }
  }, [id]);

  const fetchHoliday = async () => {
    try {
      const res = await getHolidayById(id);
      setFormData(res.data);
    } catch (err) {
      alert("Failed to load holiday");
      navigate("/holidays");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await updateHoliday(id, formData);
        alert("Holiday updated successfully");
      } else {
        await createHoliday(formData);
        alert("Holiday created successfully");
      }
      navigate("/holidays");
    } catch (err) {
      alert("Failed to save holiday");
    }
  };

  return (
    <div className="dashboard-page" style={{ padding: "30px", maxWidth: "800px", margin: "0 auto" }}>
      <div className="header" style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#1e293b", margin: 0 }}>
          {isEdit ? "✨ Edit Holiday" : "✨ Create Holiday"}
        </h2>
        <p style={{ color: "#64748b", margin: "8px 0 0 0", fontSize: "14px" }}>
          Configure a new holiday for your company calendar
        </p>
      </div>

      <div className="dashboard-card" style={{ padding: '32px', borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)', background: '#ffffff' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>Holiday Name</label>
            <input 
              type="text" 
              name="holiday_name" 
              value={formData.holiday_name} 
              onChange={handleChange} 
              placeholder="e.g. Diwali, Christmas"
              required 
              style={{ padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: "14px", outline: "none", transition: "border 0.2s" }} 
              onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
              onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>From Date</label>
              <input 
                type="date" 
                name="from_date" 
                value={formData.from_date} 
                onChange={handleChange} 
                required 
                style={{ padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: "14px", outline: "none", transition: "border 0.2s" }} 
                onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>To Date (Optional)</label>
              <input 
                type="date" 
                name="to_date" 
                value={formData.to_date} 
                onChange={handleChange} 
                style={{ padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: "14px", outline: "none", transition: "border 0.2s" }} 
                onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>Holiday Type</label>
              <select 
                name="holiday_type" 
                value={formData.holiday_type} 
                onChange={handleChange} 
                style={{ padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: "14px", outline: "none", background: "white" }}
              >
                <option value="PUBLIC">🌍 Public Holiday</option>
                <option value="OPTIONAL">✨ Optional Holiday</option>
                <option value="COMPANY">🏢 Company Holiday</option>
                <option value="FESTIVAL">🎊 Festival</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>Payment Type</label>
              <select 
                name="payment_type" 
                value={formData.payment_type} 
                onChange={handleChange} 
                style={{ padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: "14px", outline: "none", background: "white" }}
              >
                <option value="PAID">🟢 Paid</option>
                <option value="UNPAID">🟠 Unpaid</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>Applicable State</label>
            <select 
              name="state" 
              value={formData.state} 
              onChange={handleChange} 
              style={{ padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: "14px", outline: "none", background: "white" }}
            >
              <option value="ALL">All States</option>
              <option value="AP">Andhra Pradesh</option>
              <option value="TS">Telangana</option>
              <option value="KA">Karnataka</option>
              <option value="TN">Tamil Nadu</option>
              <option value="MH">Maharashtra</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>Description</label>
            <textarea 
              name="description" 
              value={formData.description || ""} 
              onChange={handleChange} 
              placeholder="Add any extra details about the holiday..."
              style={{ padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', minHeight: '100px', fontSize: "14px", outline: "none", resize: "vertical", transition: "border 0.2s" }}
              onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
              onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
            ></textarea>
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '16px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
            <button 
              type="button" 
              onClick={() => navigate("/holidays")}
              style={{ padding: "12px 24px", borderRadius: "8px", background: "white", color: "#475569", border: "1px solid #cbd5e1", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }}
              onMouseOver={(e) => e.target.style.background = "#f1f5f9"} 
              onMouseOut={(e) => e.target.style.background = "white"}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              style={{ padding: "12px 24px", borderRadius: "8px", background: "#3b82f6", color: "white", border: "none", fontWeight: "600", cursor: "pointer", boxShadow: "0 4px 14px 0 rgba(59, 130, 246, 0.39)", transition: "all 0.2s" }}
              onMouseOver={(e) => e.target.style.transform = "translateY(-1px)"} 
              onMouseOut={(e) => e.target.style.transform = "none"}
            >
              {isEdit ? "Update Holiday" : "Create Holiday"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
