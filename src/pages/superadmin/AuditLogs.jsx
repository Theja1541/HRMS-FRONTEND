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
  const [totalCount, setTotalCount] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    company_id: "",
    action: "",
  });

  useEffect(() => {
    setPage(1);
  }, [filters.company_id, filters.action, itemsPerPage]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = { page, page_size: itemsPerPage };
      if (filters.company_id) params.company_id = filters.company_id;
      if (filters.action) params.action = filters.action;
      const res = await getSuperAdminAuditLogs(params);
      setLogs(res.data.results || []);
      setTotalCount(res.data.count || 0);
    } catch {
      setLogs([]);
      setTotalCount(0);
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
  }, [page, filters.company_id, filters.action, itemsPerPage]);

  const applyFilters = () => {
    setPage(1);
    fetchLogs();
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;
  const pageNumbers = Array.from({ length: Math.min(totalPages, 5) }, (_, idx) => {
    const start = Math.max(1, page - 2);
    return start + idx <= totalPages ? start + idx : null;
  }).filter(Boolean);

  return (
    <div className="audit-logs-page">
      <div className="page-header">
        <h2 className="page-title">Audit Logs & Activity Monitoring</h2>
      </div>
      <p className="page-subtitle">
        Security feature: track every important action across the platform (admin created employee, payroll generated, user login, password reset, etc.).
      </p>

      <div className="filters-row" style={{ marginTop: 16, marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 200px' }}>
          <label style={{ margin: 0 }}>Company:</label>
          <select
            value={filters.company_id}
            onChange={(e) => setFilters({ ...filters, company_id: e.target.value })}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb", flex: 1, minWidth: 0 }}
          >
            <option value="">All companies</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 200px' }}>
          <label style={{ margin: 0 }}>Action:</label>
          <select
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb", flex: 1, minWidth: 0 }}
          >
            <option value="">All actions</option>
            {Object.entries(ACTION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        
        <button type="button" className="btn primary" onClick={applyFilters} style={{ flex: '0 0 auto' }}>
          Apply
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="card" style={{ marginTop: 24, display: 'flex', flexDirection: 'column', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', background: '#fff', border: '1px solid #f1f5f9', padding: 0 }}>
            <div className="responsive-table-container" style={{ width: '100%', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
              <table style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'left' }}>
                <thead style={{ background: 'linear-gradient(90deg, #f8fafc, #f1f5f9)', borderBottom: '2px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ width: "20%", padding: "16px 24px", color: "#475569", fontWeight: "600", fontSize: "14px", textTransform: 'uppercase', letterSpacing: '0.05em' }}>User</th>
                    <th style={{ width: "15%", padding: "16px", color: "#475569", fontWeight: "600", fontSize: "14px", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</th>
                    <th style={{ width: "15%", padding: "16px", color: "#475569", fontWeight: "600", fontSize: "14px", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                    <th style={{ width: "10%", padding: "16px", color: "#475569", fontWeight: "600", fontSize: "14px", textTransform: 'uppercase', letterSpacing: '0.05em' }}>IP Address</th>
                    <th style={{ width: "15%", padding: "16px", color: "#475569", fontWeight: "600", fontSize: "14px", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company</th>
                    <th style={{ width: "25%", padding: "16px 24px", color: "#475569", fontWeight: "600", fontSize: "14px", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, index) => (
                    <tr 
                      key={log.id}
                      style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s ease' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: "16px 24px", color: '#1e293b', fontWeight: '500' }}>{log.username || "—"}</td>
                      <td style={{ padding: "16px" }}>
                        <span style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '500', color: '#475569' }}>
                          {ACTION_LABELS[log.action] ?? log.action}
                        </span>
                      </td>
                      <td style={{ padding: "16px", color: '#64748b', fontSize: '14px' }}>{log.timestamp ? new Date(log.timestamp).toLocaleString() : "—"}</td>
                      <td style={{ padding: "16px" }}>
                        <code style={{ fontSize: '12px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', color: '#475569' }}>{log.ip_address || "—"}</code>
                      </td>
                      <td style={{ padding: "16px", color: '#475569', fontWeight: '500' }}>{log.company_name ?? "—"}</td>
                      <td style={{ padding: "16px 24px", color: '#475569', fontSize: '14px', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                        {log.description || (log.model_name ? `[${log.model_name}]` : "—")}
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: "48px 24px" }}>
                        <div style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '8px' }}>No audit logs found.</div>
                        <div style={{ color: '#cbd5e1', fontSize: '14px' }}>Try adjusting your filters.</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {logs.length > 0 && (
              <div className="attendance-pagination-container" style={{ margin: 0, borderTop: '1px solid #e2e8f0', borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
                <div className="pagination-left">
                  <span>Show</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="items-per-page-select"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span>entries per page</span>
                </div>

                <div className="pagination-right">
                  <button
                    className="page-btn"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  >
                    Previous
                  </button>
                  <div className="page-number-group" style={{ display: 'flex', gap: '4px' }}>
                    {pageNumbers.map((pg) => (
                      <button
                        key={pg}
                        className={`page-btn ${pg === page ? "active" : ""}`}
                        onClick={() => setPage(pg)}
                      >
                        {pg}
                      </button>
                    ))}
                  </div>
                  <span className="page-summary">Page {page} of {totalPages}</span>
                  <button
                    className="page-btn"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
