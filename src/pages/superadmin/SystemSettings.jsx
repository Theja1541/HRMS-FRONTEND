import { useEffect, useState, useCallback } from "react";
import { getSystemSettings, updateSystemSettings, testSmtpEmail } from "../../api/superadmin";

/* ─── Category metadata ─────────────────────────────────────────────── */
const CATEGORY_META = {
  general:  { label: "General",    icon: "⚙️",  color: "#2563eb",
    desc: "Core platform configuration — name, timezone, support contact" },
  email:    { label: "Email / SMTP", icon: "📧", color: "#0891b2",
    desc: "Outgoing mail server (SMTP) — required for MFA codes, notifications & payslips" },
  security: { label: "Security",   icon: "🔐", color: "#7c3aed",
    desc: "Authentication, session management and password policies" },
};

const TABS = ["general", "email", "security"];

/* ─── Inline card style (avoids pages.css overflow:hidden on .card) ─── */
const CARD = {
  background: "#fff",
  borderRadius: 14,
  boxShadow: "0 4px 16px rgba(15,23,42,0.08)",
  border: "1px solid #f0f4f8",
};

/* ─── Toggle switch ─────────────────────────────────────────────────── */
function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      aria-pressed={checked}
      style={{
        display: "inline-flex", alignItems: "center",
        width: 52, height: 28, borderRadius: 14, border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        background: checked ? "#2563eb" : "#cbd5e1",
        padding: 3, transition: "background 0.2s", flexShrink: 0,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <span style={{
        width: 22, height: 22, borderRadius: "50%", background: "white",
        transform: checked ? "translateX(24px)" : "translateX(0)",
        transition: "transform 0.2s",
        boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
      }} />
    </button>
  );
}

/* ─── Individual setting row ────────────────────────────────────────── */
function SettingRow({ setting, value, onChange, saving }) {
  const isBool = setting.value_type === "boolean";
  const isInt  = setting.value_type === "integer";

  return (
    <div className="ss-row" style={{
      display: "flex", justifyContent: "space-between", alignItems: "flex-start",
      padding: "18px 0", borderBottom: "1px solid #f1f5f9", gap: 20,
    }}>
      {/* Label + description */}
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 650, fontSize: 14, color: "#0f172a", marginBottom: 3, display: "flex", alignItems: "center", gap: 8 }}>
          {setting.label}
          {setting.is_sensitive && (
            <span style={{
              fontSize: 10, padding: "2px 7px", borderRadius: 4,
              background: "#fef3c7", color: "#a16207", fontWeight: 700, letterSpacing: "0.03em",
            }}>SENSITIVE</span>
          )}
        </div>
        {setting.description && (
          <div style={{ fontSize: 12.5, color: "#64748b", lineHeight: 1.5 }}>{setting.description}</div>
        )}
      </div>

      {/* Control */}
      <div className="ss-input-wrap" style={{ flexShrink: 0 }}>
        {isBool ? (
          <Toggle
            checked={value === "true"}
            onChange={(v) => onChange(setting.key, v ? "true" : "false")}
            disabled={saving}
          />
        ) : (
          <input
            type={isInt ? "number" : setting.is_sensitive ? "password" : "text"}
            value={value}
            onChange={(e) => onChange(setting.key, e.target.value)}
            disabled={saving}
            placeholder={setting.is_sensitive && !value ? "••••••  (saved, click to change)" : ""}
            className="ss-input"
            style={{
              width: 280, padding: "9px 12px",
              border: "1.5px solid #cbd5e1", borderRadius: 8,
              fontSize: 14, fontFamily: "inherit",
              background: saving ? "#f8fafc" : "#fff",
              color: "#0f172a", outline: "none",
              transition: "border-color 0.2s",
              boxSizing: "border-box",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
            onBlur={(e)  => (e.target.style.borderColor = "#cbd5e1")}
          />
        )}
      </div>
    </div>
  );
}

/* ─── Test Email modal (only shown on email tab) ────────────────────── */
function TestEmailPanel({ onTest }) {
  const [to, setTo]           = useState("");
  const [testing, setTesting] = useState(false);
  const [result, setResult]   = useState(null);   // { ok: bool, msg: string }

  const run = async () => {
    if (!to.trim()) return;
    setTesting(true); setResult(null);
    try {
      const res = await onTest(to.trim());
      setResult({ ok: true, msg: res.data?.message || "Test email sent!" });
    } catch (err) {
      const detail = err.response?.data?.detail || err.response?.data?.error || "Failed to send test email.";
      setResult({ ok: false, msg: detail });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div style={{
      marginTop: 20, padding: "16px 20px", borderRadius: 10,
      background: "#f0f9ff", border: "1.5px solid #bae6fd",
    }}>
      <p style={{ margin: "0 0 10px", fontWeight: 700, fontSize: 13, color: "#0369a1" }}>
        🧪 Test SMTP Configuration
      </p>
      <p style={{ margin: "0 0 12px", fontSize: 12.5, color: "#0c4a6e" }}>
        Send a test email to verify your SMTP settings work before going live. Settings are saved first, then the email is sent.
      </p>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <input
          type="email"
          value={to}
          onChange={(e) => { setTo(e.target.value); setResult(null); }}
          placeholder="recipient@example.com"
          style={{
            flex: 1, padding: "9px 12px", border: "1.5px solid #7dd3fc",
            borderRadius: 8, fontSize: 13, fontFamily: "inherit",
            background: "#fff", outline: "none", boxSizing: "border-box",
          }}
          onKeyDown={(e) => e.key === "Enter" && run()}
        />
        <button
          type="button"
          onClick={run}
          disabled={testing || !to.trim()}
          style={{
            padding: "9px 18px", borderRadius: 8, border: "none",
            background: testing || !to.trim() ? "#e2e8f0" : "#0891b2",
            color: testing || !to.trim() ? "#94a3b8" : "#fff",
            fontWeight: 700, fontSize: 13, cursor: testing || !to.trim() ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {testing ? "⏳ Sending…" : "📤 Send Test"}
        </button>
      </div>
      {result && (
        <div style={{
          marginTop: 10, padding: "10px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600,
          background: result.ok ? "#ecfdf5" : "#fef2f2",
          color:      result.ok ? "#047857" : "#b91c1c",
          border: `1px solid ${result.ok ? "#a7f3d0" : "#fecaca"}`,
        }}>
          {result.ok ? "✅" : "❌"} {result.msg}
        </div>
      )}
    </div>
  );
}

/* ─── Main ──────────────────────────────────────────────────────────── */
export default function SystemSettings() {
  const [grouped,     setGrouped]     = useState({});
  const [localValues, setLocalValues] = useState({});
  const [activeTab,   setActiveTab]   = useState("general");
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [error,       setError]       = useState("");

  const load = useCallback(() => {
    setLoading(true); setError("");
    getSystemSettings()
      .then((r) => {
        setGrouped(r.data);
        const flat = {};
        Object.values(r.data).forEach((arr) =>
          arr.forEach((s) => { flat[s.key] = s.value; })
        );
        setLocalValues(flat);
      })
      .catch(() => setError("Failed to load settings. Is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleChange = useCallback((key, val) => {
    setLocalValues((prev) => ({ ...prev, [key]: val }));
    setSaved(false);
  }, []);

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      await updateSystemSettings(localValues);
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch {
      setError("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = (to) => testSmtpEmail(to);

  const currentSettings = grouped[activeTab] || [];
  const meta            = CATEGORY_META[activeTab] || {};
  const hasChanges      = !saving && !loading;

  return (
    <div>
      <style>{`
        @media (max-width: 767px) {
          .ss-hero { flex-direction: column !important; align-items: flex-start !important; gap: 16px; }
          .ss-layout { flex-direction: column !important; }
          .ss-sidebar { width: 100% !important; position: static !important; }
          .ss-row { flex-direction: column !important; gap: 8px !important; }
          .ss-input-wrap { width: 100%; }
          .ss-input { width: 100% !important; max-width: 100% !important; }
        }
      `}</style>
      {/* ── Hero ── */}
      <div className="ss-hero" style={{
        background: "linear-gradient(135deg, #020617, #2563eb)",
        borderRadius: 18, padding: "26px 32px", marginBottom: 28, color: "white",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>⚙️ System Settings</h2>
          <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.8)", fontSize: 13 }}>
            Configure platform-wide settings, integrations, and feature flags
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {saved && (
            <span style={{
              background: "rgba(255,255,255,0.15)", color: "white",
              border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8,
              padding: "10px 16px", fontSize: 13, fontWeight: 600,
            }}>
              ✅ Settings saved!
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            style={{
              padding: "10px 22px", borderRadius: 10, border: "none",
              background: "white", color: "#2563eb",
              fontWeight: 700, fontSize: 14, cursor: saving || loading ? "not-allowed" : "pointer",
              opacity: saving || loading ? 0.7 : 1,
            }}
          >
            {saving ? "⏳ Saving…" : "💾 Save Changes"}
          </button>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div style={{
          marginBottom: 16, padding: "12px 16px", borderRadius: 8,
          border: "1.5px solid #fecaca", background: "#fef2f2", color: "#b91c1c", fontSize: 14,
        }}>
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "#64748b" }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>⏳</div>
          <p style={{ margin: 0, fontSize: 15 }}>Loading settings…</p>
        </div>
      ) : (
        <div className="ss-layout" style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>

          {/* ── Sidebar ── */}
          <div className="ss-sidebar" style={{ width: 220, flexShrink: 0, position: "sticky", top: 20 }}>
            <div style={{ ...CARD, padding: 8 }}>
              {TABS.map((tab) => {
                const m      = CATEGORY_META[tab];
                const isAct  = tab === activeTab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    style={{
                      width: "100%", textAlign: "left", padding: "11px 14px",
                      borderRadius: 8, border: "none", cursor: "pointer",
                      background: isAct ? "#eff6ff" : "transparent",
                      color: isAct ? "#2563eb" : "#334155",
                      fontWeight: isAct ? 700 : 500, fontSize: 13.5,
                      marginBottom: 2, display: "flex", alignItems: "center", gap: 9,
                      transition: "all 0.15s",
                      borderLeft: `3px solid ${isAct ? "#2563eb" : "transparent"}`,
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{m?.icon}</span>
                    <span>{m?.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Info card */}
            <div style={{ ...CARD, padding: 14, marginTop: 12, fontSize: 12.5, color: "#64748b", lineHeight: 1.6 }}>
              <p style={{ margin: "0 0 6px", fontWeight: 700, color: "#374151", fontSize: 13 }}>
                {meta.icon} {meta.label}
              </p>
              {meta.desc}
            </div>
          </div>

          {/* ── Settings panel ── */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={CARD}>
              {/* Panel header */}
              <div style={{
                background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
                padding: "18px 26px", borderRadius: "14px 14px 0 0",
              }}>
                <h3 style={{ margin: 0, color: "white", fontSize: 16, fontWeight: 700 }}>
                  {meta.icon} {meta.label}
                </h3>
                <p style={{ margin: "3px 0 0", color: "rgba(255,255,255,0.78)", fontSize: 13 }}>
                  {meta.desc}
                </p>
              </div>

              {/* Settings rows */}
              <div style={{ padding: "4px 26px 24px" }}>
                {currentSettings.length === 0 ? (
                  <p style={{ color: "#94a3b8", padding: "28px 0", textAlign: "center" }}>
                    No settings in this category.
                  </p>
                ) : (
                  currentSettings.map((s) => (
                    <SettingRow
                      key={s.key}
                      setting={s}
                      value={localValues[s.key] ?? s.value}
                      onChange={handleChange}
                      saving={saving}
                    />
                  ))
                )}

                {/* Test email panel — only on email tab */}
                {activeTab === "email" && (
                  <TestEmailPanel onTest={handleTestEmail} />
                )}

                {/* Security context hints */}
                {activeTab === "security" && (
                  <div style={{
                    marginTop: 20, padding: "14px 18px", borderRadius: 10,
                    background: "#faf5ff", border: "1.5px solid #d8b4fe",
                  }}>
                    <p style={{ margin: "0 0 8px", fontWeight: 700, fontSize: 13, color: "#7c3aed" }}>
                      🛡️ Security Policy Notes
                    </p>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: "#6b21a8", lineHeight: 1.8 }}>
                      <li><strong>Require MFA</strong> — Enforces email OTP on every login for Admins, HR, and Employees (Super Admins are exempt)</li>
                      <li><strong>Session Timeout</strong> — Minimum 5 minutes recommended. JWT access tokens are issued with this lifetime</li>
                      <li><strong>Password Expiry = 0</strong> — Disables forced password rotation</li>
                      <li><strong>Max Login Attempts</strong> — Set to 0 to disable account locking</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom action bar */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16, gap: 12 }}>
              <button
                type="button"
                onClick={load}
                disabled={saving || loading}
                style={{
                  padding: "10px 20px", borderRadius: 10, border: "1.5px solid #e2e8f0",
                  background: "#f8fafc", color: "#334155", fontWeight: 600,
                  fontSize: 14, cursor: "pointer",
                }}
              >
                ↺ Reset
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || loading}
                style={{
                  padding: "10px 28px", borderRadius: 10, border: "none",
                  background: hasChanges ? "linear-gradient(135deg,#2563eb,#1d4ed8)" : "#e2e8f0",
                  color: hasChanges ? "white" : "#94a3b8",
                  fontWeight: 700, fontSize: 14, cursor: saving || loading ? "not-allowed" : "pointer",
                  boxShadow: hasChanges ? "0 4px 12px rgba(37,99,235,0.3)" : "none",
                }}
              >
                {saving ? "⏳ Saving…" : "💾 Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
