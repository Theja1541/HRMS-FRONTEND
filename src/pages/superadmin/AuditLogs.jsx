import { useEffect, useState } from "react";
import { getSuperAdminAuditLogs } from "../../api/audit";
import { getCompanies } from "../../api/companies";
import "../../styles/pages.css";

const ACTION_LABELS = {
  CREATE: "Create",
  UPDATE: "Update",
  DELETE: "Delete",
  LOGIN: "User login",
  LOGOUT: "Logout",
  GENERATE: "Generate",
  PASSWORD_RESET: "Password reset",
};

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    company_id: "",
    action: "",
  });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = { page, page_size: 50 };
      if (filters.company_id) params.company_id = filters.company_id;
      if (filters.action) params.action = filters.action;
      const res = await getSuperAdminAuditLogs(params);
      setLogs(res.data.results || []);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await getCompanies();
      setCompanies(Array.isArray(res.data) ? res.data : []);
    } catch {
      setCompanies([]);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [page, filters.company_id, filters.action]);

  const applyFilters = () => {
    setPage(1);
    fetchLogs();
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Audit Logs & Activity Monitoring</h2>
      </div>
      <p className="page-subtitle">
        Security feature: track every important action across the platform (admin created employee, payroll generated, user login, password reset, etc.).
      </p>

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
        <label style={{ marginLeft: 16, marginRight: 8 }}>Action:</label>
        <select
          value={filters.action}
          onChange={(e) => setFilters({ ...filters, action: e.target.value })}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb" }}
        >
          <option value="">All actions</option>
          {Object.entries(ACTION_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <button type="button" className="btn primary" onClick={applyFilters}>
          Apply
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="card" style={{ marginTop: 16 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Action</th>
                  <th>Date</th>
                  <th>IP address</th>
                  <th>Company</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.username || "—"}</td>
                    <td>{ACTION_LABELS[log.action] ?? log.action}</td>
                    <td>{log.timestamp ? new Date(log.timestamp).toLocaleString() : "—"}</td>
                    <td>{log.ip_address || "—"}</td>
                    <td>{log.company_name ?? "—"}</td>
                    <td style={{ maxWidth: 320 }}>
                      {log.description || (log.model_name ? `[${log.model_name}]` : "—")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {logs.length === 0 && (
              <p className="muted-text" style={{ padding: 24 }}>No audit logs match the filters.</p>
            )}
          </div>
          <div className="pagination">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <span>Page {page}</span>
            <button
              type="button"
              disabled={logs.length < 50}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
