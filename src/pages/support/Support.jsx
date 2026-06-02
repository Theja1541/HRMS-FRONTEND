import { useEffect, useState } from "react";
import { createSupportTicket, getSupportTickets } from "../../api/support";
import "../../styles/pages.css";
import { useCompanyPermissions } from "../../hooks/useCompanyPermissions";

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];
const STATUS_LABELS = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export default function Support() {
  const { hasPermission } = useCompanyPermissions();
  const canCreate = hasPermission("support", "create", "view");

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [activeTab, setActiveTab] = useState("list"); // 'new' or 'list'
  const [form, setForm] = useState({ title: "", description: "", priority: "MEDIUM" });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchTickets = async () => {
    setLoading(true);
    setFetchError("");
    try {
      const res = await getSupportTickets();
      setTickets(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setTickets([]);
      const msg = err.response?.data?.detail || err.response?.data?.message || "Failed to load tickets.";
      setFetchError(typeof msg === "string" ? msg : "Failed to load tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!form.title.trim()) {
      setFormError("Title is required.");
      return;
    }
    setSubmitting(true);
    try {
      await createSupportTicket({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        priority: form.priority,
      });
      setForm({ title: "", description: "", priority: "MEDIUM" });
      setActiveTab('list');
      setFetchError("");
      fetchTickets();
    } catch (err) {
      const detail = err.response?.data?.detail;
      const titleMsg = err.response?.data?.title?.[0];
      setFormError(typeof detail === "string" ? detail : titleMsg || "Failed to create ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 className="page-title">Support</h2>
          <p className="page-subtitle">
            Create a support ticket or view your company&apos;s tickets.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {canCreate && (
            <button
              type="button"
              className={`btn ${activeTab === 'new' ? 'primary' : 'secondary'}`}
              onClick={() => setActiveTab('new')}
            >
              New Ticket
            </button>
          )}
          <button
            type="button"
            className={`btn ${activeTab === 'list' ? 'primary' : 'secondary'}`}
            onClick={() => setActiveTab('list')}
          >
            Your Tickets
          </button>
        </div>
      </div>

      {activeTab === 'new' && (
        <div className="card support-new-ticket-card" style={{ marginTop: 16, marginBottom: 24 }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <h3 style={{ margin: 0 }}>New ticket</h3>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button
                type="button"
                onClick={() => { setActiveTab('list'); setFormError(""); }}
                style={{
                  padding: "10px 18px",
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                  color: "#475569",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="support-new-ticket-form"
                disabled={submitting}
                style={{
                  padding: "10px 20px",
                  minHeight: 42,
                  backgroundColor: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.8 : 1,
                }}
              >
                {submitting ? "Submitting..." : "Submit ticket"}
              </button>
            </div>
          </div>
          <form id="support-new-ticket-form" onSubmit={handleSubmit}>
            {formError && <p style={{ color: "#b91c1c", marginBottom: 12 }}>{formError}</p>}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4 }}>Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Payroll Issue"
                style={{ width: "100%", maxWidth: 400, padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb" }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4 }}>Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                style={{
                  display: "block",
                  width: "100%",
                  maxWidth: 200,
                  minHeight: 40,
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  backgroundColor: "#fff",
                  color: "#0f172a",
                  fontSize: 14,
                  cursor: "pointer",
                }}
                aria-label="Ticket priority"
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 0 }}>
              <label style={{ display: "block", marginBottom: 4 }}>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the issue..."
                rows={2}
                style={{ width: "100%", maxWidth: 500, padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb", resize: "vertical" }}
              />
            </div>
          </form>
        </div>
      )}

      {activeTab === 'list' && (
        <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginBottom: 16 }}>Your tickets</h3>
        {fetchError && (
          <p className="muted-text" style={{ color: "#b91c1c", padding: "12px 0", marginBottom: 8 }}>{fetchError}</p>
        )}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className="responsive-table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td>{ticket.title}</td>
                      <td>{PRIORITY_OPTIONS.find((o) => o.value === ticket.priority)?.label ?? ticket.priority}</td>
                      <td>{STATUS_LABELS[ticket.status] ?? ticket.status}</td>
                      <td>{ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {tickets.length === 0 && !fetchError && (
              <p className="muted-text" style={{ padding: 24 }}>No support tickets yet. Create one above.</p>
            )}
          </>
        )}
        </div>
      )}
    </div>
  );
}
