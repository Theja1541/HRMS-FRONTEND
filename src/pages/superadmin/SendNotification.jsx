import { useEffect, useMemo, useState } from "react";
import { getCompanies } from "../../api/companies";
import { getAllUsers } from "../../api/users";
import { sendSystemNotification } from "../../api/superadmin";
import "../../styles/pages.css";

/* ─────────────────────────────────────────────────────────────
   INLINE CARD STYLE — same look as .card but NO overflow:hidden
   (pages.css .card has overflow:hidden which clips content)
───────────────────────────────────────────────────────────── */
const CARD = {
  background: "#fff",
  borderRadius: 14,
  padding: 20,
  boxShadow: "0 4px 16px rgba(15,23,42,0.08)",
  border: "1px solid #f0f4f8",
};

/* shared field style — box-sizing prevents width overflow */
const FIELD = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 13px",
  border: "1.5px solid #cbd5e1",
  borderRadius: 8,
  fontSize: 14,
  fontFamily: "inherit",
  background: "#fff",
  color: "#0f172a",
  outline: "none",
  margin: 0,         /* cancel pages.css margin-bottom:12px on .card input */
};

/* ─── Constants ─────────────────────────────────────────────── */
const TARGET_OPTIONS = [
  { value: "all",       icon: "🌐", label: "All Companies",    detail: "Every company user" },
  { value: "company",   icon: "🏢", label: "Specific Company", detail: "One tenant only" },
  { value: "hr_admins", icon: "👔", label: "Admins & HR",      detail: "All companies" },
  { value: "users",     icon: "👤", label: "Specific Users",   detail: "Manual selection" },
];

const TYPE_OPTIONS = [
  { value: "TEXT",    icon: "📝", label: "Text",    color: "#475569", bg: "#f8fafc", border: "#cbd5e1", desc: "Announcement" },
  { value: "INFO",    icon: "ℹ️",  label: "Info",    color: "#0369a1", bg: "#e0f2fe", border: "#7dd3fc", desc: "General update" },
  { value: "SUCCESS", icon: "✅", label: "Success", color: "#15803d", bg: "#dcfce7", border: "#86efac", desc: "Completed" },
  { value: "WARNING", icon: "⚠️", label: "Warning", color: "#b45309", bg: "#fef3c7", border: "#fcd34d", desc: "Action needed" },
  { value: "ERROR",   icon: "🚨", label: "Critical", color: "#b91c1c", bg: "#fee2e2", border: "#fca5a5", desc: "Urgent" },
];

const TEMPLATES = [
  { label: "🔧 Maintenance",  type: "WARNING", title: "Scheduled Maintenance",
    message: "The HRMS platform will undergo scheduled maintenance on [DATE] from [START] to [END]. Please save your work before the window begins." },
  { label: "💰 Payroll",      type: "INFO",    title: "Payroll Processing Update",
    message: "Payroll for the current month has been processed successfully. Please log in to view your payslip in the Payroll section." },
  { label: "🔐 Security",    type: "ERROR",   title: "Security Alert",
    message: "A security-sensitive action requires your attention. Please review your account and change your password immediately if you did not authorize this activity." },
  { label: "🚀 New Feature",  type: "SUCCESS", title: "New Feature Released",
    message: "A new HRMS feature has been released and is now available in your dashboard. Please log in to explore the latest improvements." },
  { label: "📣 Announcement", type: "TEXT",   title: "Company Announcement",
    message: "Dear Team,\n\nThis is an important announcement from management.\n\n[Write your message here]\n\nRegards,\nHR Department" },
  { label: "🎉 Holiday",      type: "SUCCESS", title: "Holiday Notice",
    message: "Please note that [DATE] is a public holiday. The office will remain closed. Wishing you a pleasant holiday!" },
];

/* ─── Helpers ─────────────────────────────────────────────────── */
function companyVal(u) {
  if (u?.company && typeof u.company === "object") return u.company.id;
  return u?.company ?? u?.company_id ?? "";
}
function companyLabel(u, companies) {
  if (u?.company_name) return u.company_name;
  const id = companyVal(u);
  return companies.find((c) => String(c.id) === String(id))?.name || "No company";
}
function matchesTarget(u, target, companyId, userIds) {
  const role = String(u.role || "").toUpperCase();
  const ucId = companyVal(u);
  if (target === "users")     return userIds.includes(u.id);
  if (role === "SUPER_ADMIN" || !ucId) return false;
  if (target === "company")   return String(ucId) === String(companyId);
  if (target === "hr_admins") return role === "ADMIN" || role === "HR";
  return true;
}
function typeOpt(val) {
  return TYPE_OPTIONS.find((t) => t.value === val) || TYPE_OPTIONS[1];
}

/* ─── Section header ──────────────────────────────────────────── */
function SHeader({ children }) {
  return (
    <p style={{ margin: "0 0 14px", fontSize: 12, fontWeight: 700, color: "#64748b",
      letterSpacing: "0.06em", textTransform: "uppercase" }}>
      {children}
    </p>
  );
}

/* ─── Main ────────────────────────────────────────────────────── */
export default function SendNotification() {
  const [companies, setCompanies] = useState([]);
  const [users,     setUsers]     = useState([]);
  const [target,    setTarget]    = useState("all");
  const [companyId, setCompanyId] = useState("");
  const [userIds,   setUserIds]   = useState([]);
  const [query,     setQuery]     = useState("");
  const [title,     setTitle]     = useState("");
  const [message,   setMessage]   = useState("");
  const [type,      setType]      = useState("INFO");
  const [loading,   setLoading]   = useState(true);
  const [sending,   setSending]   = useState(false);
  const [notice,    setNotice]    = useState(null);
  const [history,   setHistory]   = useState([]);
  const [alsoEmail, setAlsoEmail] = useState(false);

  useEffect(() => {
    let dead = false;
    setLoading(true);
    Promise.allSettled([getCompanies({ is_active: true }), getAllUsers()])
      .then(([cR, uR]) => {
        if (dead) return;
        setCompanies(Array.isArray(cR.value?.data) ? cR.value.data : []);
        setUsers(Array.isArray(uR.value?.data) ? uR.value.data : []);
      })
      .finally(() => { if (!dead) setLoading(false); });
    return () => { dead = true; };
  }, []);

  const selectableUsers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return users.filter((u) => {
      if (companyId && String(companyVal(u)) !== String(companyId)) return false;
      if (!needle) return true;
      return [u.email, u.username, u.first_name, u.last_name, u.role, companyLabel(u, companies)]
        .filter(Boolean).some((v) => String(v).toLowerCase().includes(needle));
    }).slice(0, 100);
  }, [companies, companyId, query, users]);

  const recipients = useMemo(
    () => users.filter((u) => matchesTarget(u, target, companyId, userIds)),
    [companyId, target, userIds, users]
  );

  const resetTarget = (next) => {
    setTarget(next); setUserIds([]);
    if (next !== "company" && next !== "users") setCompanyId("");
    setNotice(null);
  };
  const toggleUser = (id) =>
    setUserIds((p) => p.includes(id) ? p.filter((v) => v !== id) : [...p, id]);
  const applyTpl   = (t) => { setTitle(t.title); setMessage(t.message); setType(t.type); setNotice(null); };

  const handleSend = async () => {
    setNotice(null);
    if (!title.trim())                              return setNotice({ k: "err", t: "Please enter a notification title." });
    if (!message.trim())                            return setNotice({ k: "err", t: "Please enter a message body." });
    if (target === "company" && !companyId)         return setNotice({ k: "err", t: "Please select a company." });
    if (target === "users" && userIds.length === 0) return setNotice({ k: "err", t: "Please select at least one user." });
    if (recipients.length === 0)                    return setNotice({ k: "err", t: "No active recipients match this target." });

    const effectiveType = type === "TEXT" ? "INFO" : type;
    const payload = { title: title.trim(), message: message.trim(), type: effectiveType, also_send_email: alsoEmail };
    if (target === "company")   payload.company_id   = Number(companyId);
    if (target === "hr_admins") payload.target_roles = ["ADMIN", "HR"];
    if (target === "users")     payload.user_ids     = userIds.map(Number);

    setSending(true);
    try {
      const res   = await sendSystemNotification(payload);
      const count = res.data?.created_count ?? recipients.length;
      const eMsg  = res.data?.email_message ? ` · ${res.data.email_message}` : "";
      setNotice({ k: "ok", t: `✅ Sent to ${count} recipient${count !== 1 ? "s" : ""}!${eMsg}` });
      const now = new Date();
      setHistory((p) => [{ id: Date.now(), title: title.trim(), type, recipients: count,
        sentAt: now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) }, ...p.slice(0, 7)]);
      setTitle(""); setMessage(""); setUserIds([]); setQuery("");
    } catch (err) {
      setNotice({ k: "err", t: err.response?.data?.error || "Failed to send notification." });
    } finally {
      setSending(false);
    }
  };

  const tOpt    = typeOpt(type);
  const canSend = !sending && !loading && recipients.length > 0 && title.trim() && message.trim();

  return (
    <div>
      {/* ── Hero ── */}
      <div className="page-hero">
        <h2 style={{ margin: 0, color: "white", fontSize: 22 }}>📢 Send Notifications</h2>
        <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.8)", fontSize: 13 }}>
          Broadcast Info, Warning, Success, Critical or plain Text announcements to any user group
        </p>
      </div>

      {/* ── 2-column layout ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 310px", gap: 20, alignItems: "start" }}>

        {/* ══ LEFT: Steps ══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>

          {/* STEP 1 — Target */}
          <div style={CARD}>
            <SHeader>📍 Step 1 — Choose Target Audience</SHeader>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              {TARGET_OPTIONS.map((opt) => {
                const sel = target === opt.value;
                return (
                  <button key={opt.value} type="button" onClick={() => resetTarget(opt.value)}
                    style={{
                      borderRadius: 10, cursor: "pointer", textAlign: "left", padding: "12px 14px",
                      display: "flex", alignItems: "center", gap: 10,
                      border: sel ? "2px solid #2563eb" : "1.5px solid #e2e8f0",
                      background: sel ? "#eff6ff" : "#fff",
                      boxShadow: sel ? "0 0 0 3px rgba(37,99,235,0.1)" : "none",
                    }}>
                    <span style={{ fontSize: 20 }}>{opt.icon}</span>
                    <span style={{ flex: 1 }}>
                      <span style={{ display: "block", fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{opt.label}</span>
                      <span style={{ display: "block", fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{opt.detail}</span>
                    </span>
                    <span style={{
                      width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                      border: sel ? "5px solid #2563eb" : "2px solid #94a3b8",
                    }} />
                  </button>
                );
              })}
            </div>

            {/* Company filter */}
            {(target === "company" || target === "users") && (
              <div style={{ marginBottom: 14 }}>
                <p style={{ margin: "0 0 6px", fontWeight: 600, fontSize: 13, color: "#374151" }}>
                  {target === "company" ? "Select Company *" : "Filter by Company (optional)"}
                </p>
                <select value={companyId}
                  onChange={(e) => { setCompanyId(e.target.value); setUserIds([]); }}
                  style={{ ...FIELD }}>
                  <option value="">{target === "users" ? "All companies" : "— Select a company —"}</option>
                  {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}

            {/* ── User picker ── FIXED: explicit height so list is always visible ── */}
            {target === "users" && (
              <div style={{ marginTop: 4 }}>
                {/* Label row */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: "#374151" }}>
                    Select Users *
                  </p>
                  {userIds.length > 0 && (
                    <span style={{ background: "#2563eb", color: "#fff", fontSize: 11,
                      padding: "2px 8px", borderRadius: 12, fontWeight: 700 }}>
                      {userIds.length} selected
                    </span>
                  )}
                </div>

                {/* Search input — uses FIELD style, NOT inside .card so no CSS override */}
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, email or role…"
                  style={{ ...FIELD, marginBottom: 8 }}
                />

                {/* User checklist — fixed height 220px so it NEVER collapses */}
                <div style={{
                  height: 220,
                  overflowY: "auto",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 8,
                  background: "#fafafa",
                }}>
                  {loading ? (
                    <div style={{ padding: 20, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                      ⏳ Loading users…
                    </div>
                  ) : selectableUsers.length === 0 ? (
                    <div style={{ padding: 20, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                      No users found. Try a different search or company filter.
                    </div>
                  ) : selectableUsers.map((u) => (
                    <label key={u.id} style={{
                      display: "flex", gap: 10, alignItems: "center",
                      padding: "10px 14px", borderBottom: "1px solid #f1f5f9",
                      cursor: "pointer", margin: 0,  /* cancel .card label margin */
                      background: userIds.includes(u.id) ? "#eff6ff" : "transparent",
                    }}>
                      <input type="checkbox"
                        checked={userIds.includes(u.id)}
                        onChange={() => toggleUser(u.id)}
                        style={{ width: 16, height: 16, accentColor: "#2563eb", flexShrink: 0, margin: 0 }}
                      />
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: "block", fontWeight: 600, fontSize: 13, color: "#0f172a",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {[u.first_name, u.last_name].filter(Boolean).join(" ") || u.username}
                        </span>
                        <span style={{ display: "block", fontSize: 12, color: "#64748b",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {u.email}
                        </span>
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px",
                        borderRadius: 10, background: "#f1f5f9", color: "#475569", flexShrink: 0 }}>
                        {u.role}
                      </span>
                    </label>
                  ))}
                </div>

                <p style={{ margin: "6px 0 0", fontSize: 12, color: "#94a3b8" }}>
                  {selectableUsers.length} user{selectableUsers.length !== 1 ? "s" : ""} shown
                </p>
              </div>
            )}
          </div>

          {/* STEP 2 — Type */}
          <div style={CARD}>
            <SHeader>🎨 Step 2 — Notification Type</SHeader>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
              {TYPE_OPTIONS.map((opt) => {
                const sel = type === opt.value;
                return (
                  <button key={opt.value} type="button" onClick={() => setType(opt.value)}
                    style={{
                      borderRadius: 10, cursor: "pointer", padding: "11px 6px", textAlign: "center",
                      border: sel ? `2px solid ${opt.color}` : "1.5px solid #e2e8f0",
                      background: sel ? opt.bg : "#fff",
                      boxShadow: sel ? `0 0 0 3px ${opt.border}50` : "none",
                    }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{opt.icon}</div>
                    <div style={{ fontWeight: 800, fontSize: 12, color: sel ? opt.color : "#0f172a" }}>{opt.label}</div>
                    <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{opt.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Templates */}
          <div style={CARD}>
            <SHeader>⚡ Quick Templates</SHeader>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {TEMPLATES.map((t) => {
                const to = typeOpt(t.type);
                return (
                  <button key={t.label} type="button" onClick={() => applyTpl(t)}
                    style={{ border: `1.5px solid ${to.border}`, borderRadius: 8,
                      background: to.bg, color: to.color, cursor: "pointer",
                      padding: "8px 14px", fontWeight: 700, fontSize: 13 }}>
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 3 — Compose — FIXED: inline style (no .card class → no overflow:hidden) */}
          <div style={CARD}>
            <SHeader>✍️ Step 3 — Compose Message</SHeader>

            {/* Title */}
            <div style={{ marginBottom: 16 }}>
              <p style={{ margin: "0 0 6px", fontWeight: 600, fontSize: 13, color: "#374151" }}>Title *</p>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter notification title…"
                maxLength={255}
                style={{ ...FIELD }}
              />
              <p style={{ margin: "4px 0 0", fontSize: 11, color: "#94a3b8", textAlign: "right" }}>
                {title.length}/255
              </p>
            </div>

            {/* Message Body — FIXED: explicit height, overflowY auto, NO min-height tricks */}
            <div style={{ marginBottom: notice ? 16 : 0 }}>
              <p style={{ margin: "0 0 6px", fontWeight: 600, fontSize: 13, color: "#374151" }}>
                Message Body *
              </p>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={type === "TEXT"
                  ? "Dear Team,\n\nWrite your announcement here…\n\nRegards,\nHR Department"
                  : "Write the notification message here…"}
                style={{
                  ...FIELD,
                  resize: "vertical",
                  lineHeight: 1.7,
                  height: type === "TEXT" ? 220 : 160,
                  overflowY: "auto",
                }}
              />
              <p style={{ margin: "4px 0 0", fontSize: 11, color: "#94a3b8" }}>
                {message.length} characters
              </p>
            </div>

            {/* Notice */}
            {notice && (
              <div style={{
                padding: "12px 16px", borderRadius: 8, fontWeight: 600, fontSize: 14,
                background: notice.k === "ok" ? "#ecfdf5" : "#fef2f2",
                color:      notice.k === "ok" ? "#047857" : "#b91c1c",
                border: `1.5px solid ${notice.k === "ok" ? "#a7f3d0" : "#fecaca"}`,
              }}>
                {notice.t}
              </div>
            )}
          </div>
        </div>

        {/* ══ RIGHT: Sticky Sidebar ══ */}
        <div style={{ position: "sticky", top: 20, display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Send card */}
          <div style={CARD}>
            <p style={{ margin: "0 0 12px", fontWeight: 700, fontSize: 13, color: "#374151" }}>
              🚀 Ready to Send?
            </p>

            {/* Recipients */}
            <div style={{
              textAlign: "center", padding: "12px 10px", borderRadius: 10, marginBottom: 14,
              background: recipients.length > 0 ? "#eff6ff" : "#f8fafc",
              border: `1.5px solid ${recipients.length > 0 ? "#93c5fd" : "#e2e8f0"}`,
            }}>
              <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                Recipients
              </p>
              <div style={{ fontSize: 44, fontWeight: 900, lineHeight: 1,
                color: recipients.length > 0 ? "#1d4ed8" : "#94a3b8" }}>
                {loading ? "—" : recipients.length}
              </div>
            </div>

            {/* Send button */}
            <button type="button" onClick={handleSend} disabled={!canSend}
              style={{
                width: "100%", padding: "14px 16px", borderRadius: 10, border: "none",
                fontWeight: 800, fontSize: 15, cursor: canSend ? "pointer" : "not-allowed",
                background: canSend ? `linear-gradient(135deg,${tOpt.color},${tOpt.color}bb)` : "#e2e8f0",
                color: canSend ? "#fff" : "#94a3b8",
                boxShadow: canSend ? `0 4px 14px ${tOpt.color}50` : "none",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.2s",
              }}>
              {sending
                ? "⏳ Sending…"
                : !title.trim() || !message.trim()
                  ? "✏️ Fill title & message"
                  : recipients.length === 0
                    ? "📭 No Recipients"
                    : <>{tOpt.icon} Send {tOpt.label} to {recipients.length}</>}
            </button>

            {/* Also send email */}
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 10, marginTop: 12,
              padding: "10px 12px", borderRadius: 8,
              border: `1.5px solid ${alsoEmail ? "#93c5fd" : "#e2e8f0"}`,
              background: alsoEmail ? "#eff6ff" : "#f8fafc",
              cursor: "pointer",
            }}
              onClick={() => setAlsoEmail((v) => !v)}
            >
              <input type="checkbox" checked={alsoEmail} readOnly
                style={{ width: 16, height: 16, accentColor: "#2563eb", flexShrink: 0, marginTop: 2, cursor: "pointer", margin: 0 }}
              />
              <div style={{ marginLeft: 8 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: alsoEmail ? "#1d4ed8" : "#374151" }}>
                  📧 Also send Email
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: "#64748b" }}>
                  Styled HTML email to each recipient's inbox
                </p>
              </div>
            </div>

            {/* Clear draft */}
            {(title || message) && !sending && (
              <button type="button"
                onClick={() => { setTitle(""); setMessage(""); setNotice(null); }}
                style={{
                  width: "100%", marginTop: 8, padding: "9px 16px", borderRadius: 8,
                  border: "1.5px solid #e2e8f0", background: "#f8fafc",
                  color: "#64748b", fontWeight: 600, fontSize: 13, cursor: "pointer",
                }}>
                🗑️ Clear Draft
              </button>
            )}
          </div>

          {/* Delivery summary */}
          <div style={{ ...CARD, padding: 0, overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(135deg,#1e3a8a,#2563eb)", padding: "14px 18px" }}>
              <p style={{ margin: 0, color: "white", fontWeight: 700, fontSize: 14 }}>📬 Delivery Summary</p>
            </div>
            <div style={{ padding: 16, display: "grid", gap: 8, fontSize: 13 }}>
              {[
                ["Target",      TARGET_OPTIONS.find((o) => o.value === target)?.label],
                ["Company",     companyId ? companies.find((c) => String(c.id) === String(companyId))?.name ?? "—" : "Any"],
                ["Type",        `${tOpt.icon} ${tOpt.label}`],
                ["Delivers to", "In-app notification bell"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                  <span style={{ color: "#64748b", fontWeight: 600 }}>{k}:</span>
                  <span style={{ color: "#0f172a", textAlign: "right" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live preview */}
          {(title || message) && (
            <div style={CARD}>
              <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                👁️ Preview
              </p>
              <div style={{
                border: `1.5px solid ${tOpt.border}`, borderLeft: `4px solid ${tOpt.color}`,
                borderRadius: 8, background: tOpt.bg, padding: "12px 14px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <span>{tOpt.icon}</span>
                  <span style={{ fontWeight: 800, fontSize: 13, color: tOpt.color,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {title.trim() || "Notification title"}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: "#374151", lineHeight: 1.55,
                  whiteSpace: "pre-wrap", maxHeight: 120, overflow: "hidden" }}>
                  {message.trim() || "Message will appear here."}
                </p>
              </div>
            </div>
          )}

          {/* Sent history */}
          {history.length > 0 && (
            <div style={{ ...CARD, padding: 0, overflow: "hidden" }}>
              <p style={{ margin: 0, padding: "12px 16px", background: "#f8fafc",
                borderBottom: "1px solid #f1f5f9", fontWeight: 700, fontSize: 12,
                color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                📜 Recently Sent
              </p>
              {history.map((h) => {
                const ho = typeOpt(h.type);
                return (
                  <div key={h.id} style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9",
                    display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{ho.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 12, color: "#0f172a",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {h.title}
                      </p>
                      <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>
                        {h.recipients} recipient{h.recipients !== 1 ? "s" : ""} · {h.sentAt}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
