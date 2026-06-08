import { useEffect, useState, useCallback } from "react";
import api from "../../api/axios";

export default function CompanySmtpSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [settings, setSettings] = useState({
    use_company_smtp: false,
    smtp_host: "",
    smtp_port: 587,
    smtp_username: "",
    smtp_password: "",
    smtp_use_tls: true,
    from_email: "",
    smtp_password_set: false,
  });

  const [testEmail, setTestEmail] = useState("");
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/accounts/company/smtp/");
      setSettings(prev => ({
        ...prev,
        ...res.data,
        smtp_password: "" // Do not populate password field
      }));
    } catch (err) {
      setError("Failed to load SMTP settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = { ...settings };
      if (!payload.smtp_password) {
        delete payload.smtp_password; // Don't send empty string if not changing
      }
      const res = await api.patch("/accounts/company/smtp/", payload);
      setSuccess("Settings updated successfully!");
      fetchSettings(); // Refresh
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async (e) => {
    e.preventDefault();
    if (!testEmail) return;
    setTestLoading(true);
    setTestResult(null);
    try {
      const res = await api.post("/accounts/company/smtp/test-email/", { to_email: testEmail });
      setTestResult({ ok: true, msg: res.data.message });
    } catch (err) {
      const detail = err.response?.data?.detail || err.response?.data?.error || "Failed to send test email.";
      setTestResult({ ok: false, msg: detail });
    } finally {
      setTestLoading(false);
    }
  };

  if (loading) return <p>Loading SMTP settings...</p>;

  return (
    <div className="settings-card">
      <h3>Company Email / SMTP</h3>
      <p className="card-subtitle">
        Configure your own email server to send company emails (payslips, notifications, etc.) from your own address instead of the system default.
      </p>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSave} style={{ marginBottom: "30px" }}>
        <div className="form-field" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <input 
            type="checkbox" 
            name="use_company_smtp" 
            id="use_company_smtp"
            checked={settings.use_company_smtp} 
            onChange={handleChange} 
            style={{ width: "20px", height: "20px" }}
          />
          <label htmlFor="use_company_smtp" style={{ margin: 0, fontWeight: "bold" }}>
            Enable Custom SMTP for this Company
          </label>
        </div>

        {settings.use_company_smtp && (
          <>
            <div className="form-field">
              <label>SMTP Host *</label>
              <input type="text" name="smtp_host" value={settings.smtp_host} onChange={handleChange} placeholder="e.g. smtp.gmail.com" required />
            </div>

            <div className="form-field">
              <label>SMTP Port *</label>
              <input type="number" name="smtp_port" value={settings.smtp_port} onChange={handleChange} required />
            </div>

            <div className="form-field">
              <label>SMTP Username *</label>
              <input type="text" name="smtp_username" value={settings.smtp_username} onChange={handleChange} placeholder="e.g. your-email@company.com" required />
            </div>

            <div className="form-field">
              <label>SMTP Password {settings.smtp_password_set ? "(Leave blank to keep existing)" : "*"}</label>
              <input type="password" name="smtp_password" value={settings.smtp_password} onChange={handleChange} placeholder={settings.smtp_password_set ? "••••••••••••" : "Enter password or App Password"} required={!settings.smtp_password_set} />
            </div>

            <div className="form-field">
              <label>From Email Address *</label>
              <input type="email" name="from_email" value={settings.from_email} onChange={handleChange} placeholder="e.g. no-reply@company.com" required />
            </div>

            <div className="form-field" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input type="checkbox" name="smtp_use_tls" id="smtp_use_tls" checked={settings.smtp_use_tls} onChange={handleChange} style={{ width: "20px", height: "20px" }} />
              <label htmlFor="smtp_use_tls" style={{ margin: 0 }}>Use TLS (Recommended)</label>
            </div>
          </>
        )}

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Save SMTP Settings"}
        </button>
      </form>

      {settings.use_company_smtp && (
        <div style={{ marginTop: 20, padding: "16px 20px", borderRadius: 10, background: "#f0f9ff", border: "1.5px solid #bae6fd" }}>
          <p style={{ margin: "0 0 10px", fontWeight: 700, fontSize: 13, color: "#0369a1" }}>🧪 Test SMTP Configuration</p>
          <p style={{ margin: "0 0 12px", fontSize: 12.5, color: "#0c4a6e" }}>Save your settings first, then send a test email to verify.</p>
          
          <form onSubmit={handleTestEmail} style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input type="email" value={testEmail} onChange={e => { setTestEmail(e.target.value); setTestResult(null); }} placeholder="recipient@example.com" style={{ flex: 1, padding: "9px 12px", border: "1.5px solid #7dd3fc", borderRadius: 8, fontSize: 13, outline: "none" }} required />
            <button type="submit" disabled={testLoading || !testEmail.trim()} style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: testLoading || !testEmail.trim() ? "#e2e8f0" : "#0891b2", color: testLoading || !testEmail.trim() ? "#94a3b8" : "#fff", fontWeight: 700, fontSize: 13, cursor: testLoading || !testEmail.trim() ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
              {testLoading ? "⏳ Sending…" : "📤 Send Test"}
            </button>
          </form>

          {testResult && (
            <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: testResult.ok ? "#ecfdf5" : "#fef2f2", color: testResult.ok ? "#047857" : "#b91c1c", border: `1px solid ${testResult.ok ? "#a7f3d0" : "#fecaca"}` }}>
              {testResult.ok ? "✅" : "❌"} {testResult.msg}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
