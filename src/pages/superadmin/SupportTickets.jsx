import { useEffect, useState } from "react";
import { getSupportTickets, updateSupportTicket, getSupportTicket } from "../../api/support";
import { getCompanies } from "../../api/companies";
import "../../styles/pages.css";

const PRIORITY_LABELS = { LOW: "Low", MEDIUM: "Medium", HIGH: "High" };
const STATUS_LABELS = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export default function SupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [filters, setFilters] = useState({
    company_id: "",
    status: "",
    priority: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [saveError, setSaveError] = useState("");
  const [viewTicket, setViewTicket] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    setFetchError("");
    try {
      const params = {};
      if (filters.company_id) params.company_id = filters.company_id;
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      const res = await getSupportTickets(params);
      setTickets(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setTickets([]);
      const msg = err.response?.data?.detail || err.response?.data?.message;
      setFetchError(typeof msg === "string" ? msg : "Failed to load tickets.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await getCompanies();
      const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setCompanies(list);
    } catch {
      setCompanies([]);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [filters.company_id, filters.status, filters.priority]);

  const applyFilters = () => {
    fetchTickets();
  };

  const startEdit = (ticket) => {
    setEditingId(ticket.id);
    setEditStatus(ticket.status);
    setEditPriority(ticket.priority);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditStatus("");
    setEditPriority("");
    setSaveError("");
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaveError("");
    try {
      await updateSupportTicket(editingId, {
        status: editStatus,
        priority: editPriority,
      });
      setTickets((prev) =>
        prev.map((t) =>
          t.id === editingId
            ? { ...t, status: editStatus, priority: editPriority }
            : t
        )
      );
      cancelEdit();
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message;
      setSaveError(typeof msg === "string" ? msg : "Failed to update ticket.");
    }
  };

  const openView = async (ticketId) => {
    setViewLoading(true);
    setViewTicket(null);
    try {
      const res = await getSupportTicket(ticketId);
      setViewTicket(res.data);
    } catch (e) {
      setViewTicket({ error: 'Failed to load ticket.' });
    } finally {
      setViewLoading(false);
    }
  };

  const closeView = () => setViewTicket(null);

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Support Tickets</h2>
      </div>
      <p className="page-subtitle">
        View and manage support tickets from all companies. You can filter and update status or priority.
      </p>

      {fetchError && (
        <p className="muted-text" style={{ color: "#b91c1c", marginTop: 8 }}>{fetchError}</p>
      )}

      <div className="filters-row" style={{ marginTop: 16, marginBottom: 16 }}>
        <label style={{ marginRight: 8 }}>Company:</label>
        <select
          value={filters.company_id}
          onChange={(e) => setFilters({ ...filters, company_id: e.target.value })}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb" }}
        >
          <option value="">All companies</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <label style={{ marginLeft: 16, marginRight: 8 }}>Status:</label>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb" }}
        >
          <option value="">All</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <label style={{ marginLeft: 16, marginRight: 8 }}>Priority:</label>
        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb" }}
        >
          <option value="">All</option>
          {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <button type="button" className="btn primary" onClick={applyFilters} style={{ marginLeft: 16 }}>
          Apply
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="card" style={{ marginTop: 16 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Company</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>{ticket.title}</td>
                  <td>{ticket.company_name || "—"}</td>
                  <td>
                    {editingId === ticket.id ? (
                      <select
                        value={editPriority}
                        onChange={(e) => setEditPriority(e.target.value)}
                        style={{ padding: "4px 8px", borderRadius: 6 }}
                      >
                        {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    ) : (
                      PRIORITY_LABELS[ticket.priority] ?? ticket.priority
                    )}
                  </td>
                  <td>
                    {editingId === ticket.id ? (
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        style={{ padding: "4px 8px", borderRadius: 6 }}
                      >
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    ) : (
                      STATUS_LABELS[ticket.status] ?? ticket.status
                    )}
                  </td>
                  <td>{ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : "—"}</td>
                  <td>
                    {editingId === ticket.id ? (
                      <>
                        {saveError && <span style={{ color: "#b91c1c", marginRight: 8, fontSize: 13 }}>{saveError}</span>}
                        <button type="button" className="btn primary" onClick={saveEdit} style={{ marginRight: 8 }}>
                          Save
                        </button>
                        <button type="button" className="btn secondary" onClick={cancelEdit}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button type="button" className="btn" onClick={() => openView(ticket.id)}>
                          View
                        </button>
                        <button type="button" className="btn secondary" onClick={() => startEdit(ticket)}>
                          Edit
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tickets.length === 0 && !fetchError && (
            <p className="muted-text" style={{ padding: 24 }}>No support tickets found.</p>
          )}
        </div>
      )}
      {viewTicket && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ background: '#fff', borderRadius: 8, maxWidth: 800, width: '90%', padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>{viewTicket.title || 'Ticket'}</h3>
              <button type="button" className="btn" onClick={closeView}>Close</button>
            </div>
            <div style={{ marginTop: 12 }}>
              {viewLoading ? (
                <p>Loading...</p>
              ) : viewTicket.error ? (
                <p style={{ color: '#b91c1c' }}>{viewTicket.error}</p>
              ) : (
                <div>
                  <p><strong>Company:</strong> {viewTicket.company_name || '—'}</p>
                  <p><strong>Priority:</strong> {PRIORITY_LABELS[viewTicket.priority] || viewTicket.priority}</p>
                  <p><strong>Status:</strong> {STATUS_LABELS[viewTicket.status] || viewTicket.status}</p>
                  <p><strong>Created:</strong> {viewTicket.created_at ? new Date(viewTicket.created_at).toLocaleString() : '—'}</p>
                  <p><strong>Created by:</strong> {viewTicket.created_by?.email || viewTicket.created_by?.name || '—'}</p>
                  <hr />
                  <p style={{ whiteSpace: 'pre-wrap' }}>{viewTicket.description || 'No description provided.'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
