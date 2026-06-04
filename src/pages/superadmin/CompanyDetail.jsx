import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getCompany } from "../../api/companies";
import { getAllUsers, resetUserAttempts } from "../../api/users";
import "../../styles/pages.css";

const PLAN_LABELS = { BASIC: "Basic", PREMIUM: "Premium" };

export default function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getCompany(id),
      getAllUsers()
    ])
      .then(([compRes, usersRes]) => {
        setCompany(compRes.data);
        const compUsers = usersRes.data.filter(u => Number(u.company) === Number(id));
        setUsers(compUsers);
      })
      .catch(() => alert("Failed to load company details"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleResetAttempts = async (userId) => {
    if (!window.confirm("Are you sure you want to reset this user's failed login attempts to 0?")) return;
    try {
      await resetUserAttempts(userId);
      setUsers(users.map(u => u.id === userId ? { ...u, failed_attempts: 0, is_locked: false } : u));
      alert("Attempts reset successfully.");
    } catch (err) {
      alert("Failed to reset attempts.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!company) return null;

  return (
    <div>
      <div className="page-header">
        <div>
          <button
            type="button"
            className="btn"
            style={{ marginBottom: 8 }}
            onClick={() => navigate("/super-admin/companies")}
          >
            ← Back to Companies
          </button>
          <h2 className="page-title">{company.name}</h2>
          <p className="page-subtitle">
            {company.company_code} • {company.pricing_plan_name ? `${company.pricing_plan_name} (₹${parseFloat(company.pricing_plan_price || company.pricing_plan_price_monthly || 0).toLocaleString("en-IN")}/mo)` : (PLAN_LABELS[company.plan] ?? company.plan ?? "-")} •{" "}
            <span
              style={{
                color: company.is_active ? "#166534" : "#991b1b",
                fontWeight: 500,
              }}
            >
              {company.is_active ? "Active" : "Suspended"}
            </span>
          </p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 12 }}>Company Details</h3>
        <dl style={{ display: "grid", gap: "8px 16px", gridTemplateColumns: "auto 1fr" }}>
          <dt style={{ color: "#64748b" }}>Email</dt>
          <dd>{company.email || "—"}</dd>
          <dt style={{ color: "#64748b" }}>Phone</dt>
          <dd>{company.phone || "—"}</dd>
          <dt style={{ color: "#64748b" }}>Address</dt>
          <dd>{company.address || "—"}</dd>
          <dt style={{ color: "#64748b" }}>Registered</dt>
          <dd>{company.created_at ? new Date(company.created_at).toLocaleDateString() : "—"}</dd>
        </dl>
      </div>

      <div className="card" style={{ marginBottom: 24, padding: 0 }}>
        <h3 style={{ padding: "20px 24px", margin: 0, borderBottom: "1px solid #f1f5f9" }}>Company Users (Login Attempts)</h3>
        <div className="table-wrapper" style={{ margin: 0, border: "none" }}>
          <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th style={{ padding: "16px 24px", color: "#475569", fontWeight: "600", fontSize: "12px", borderBottom: "1px solid #f1f5f9", textAlign: "left" }}>User</th>
                <th style={{ padding: "16px 24px", color: "#475569", fontWeight: "600", fontSize: "12px", borderBottom: "1px solid #f1f5f9", textAlign: "left" }}>Role</th>
                <th style={{ padding: "16px 24px", color: "#475569", fontWeight: "600", fontSize: "12px", borderBottom: "1px solid #f1f5f9", textAlign: "center" }}>Failed Attempts</th>
                <th style={{ padding: "16px 24px", color: "#475569", fontWeight: "600", fontSize: "12px", borderBottom: "1px solid #f1f5f9", textAlign: "center" }}>Status</th>
                <th style={{ padding: "16px 24px", color: "#475569", fontWeight: "600", fontSize: "12px", borderBottom: "1px solid #f1f5f9", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9" }}>
                    <div style={{ fontWeight: 500, color: "#1e293b" }}>{u.first_name} {u.last_name}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>{u.email}</div>
                  </td>
                  <td style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9" }}>
                    <span style={{ background: "#f1f5f9", padding: "4px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: 600, color: "#475569" }}>{u.role}</span>
                  </td>
                  <td style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9", textAlign: "center" }}>
                    <span style={{ color: u.failed_attempts >= (company.max_login_attempts || 5) && (company.max_login_attempts || 5) > 0 ? "#dc2626" : "#64748b", fontWeight: 600 }}>
                      {u.failed_attempts || 0} {company.max_login_attempts > 0 ? `/ ${company.max_login_attempts}` : ""}
                    </span>
                  </td>
                  <td style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9", textAlign: "center" }}>
                    {u.is_locked ? (
                      <span style={{ color: "#dc2626", background: "#fef2f2", padding: "4px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: 600 }}>Locked</span>
                    ) : (
                      <span style={{ color: "#166534", background: "#f0fdf4", padding: "4px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: 600 }}>Active</span>
                    )}
                  </td>
                  <td style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9", textAlign: "right" }}>
                    <button 
                      className="btn primary" 
                      style={{ padding: "4px 12px", fontSize: "12px" }}
                      onClick={() => handleResetAttempts(u.id)}
                    >
                      Reset Attempts
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: "24px", textAlign: "center", color: "#64748b" }}>No users found for this company.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3 style={{ marginBottom: 8 }}>Employees</h3>
          <p className="muted-text" style={{ marginBottom: 12 }}>
            View and manage employees for this company.
          </p>
          <Link to={`/super-admin/companies/${id}/employees`} className="btn primary">
            View Company Employees
          </Link>
        </div>
        <div className="dashboard-card">
          <h3 style={{ marginBottom: 8 }}>Payroll</h3>
          <p className="muted-text" style={{ marginBottom: 12 }}>
            View payroll summary and payslips for this company.
          </p>
          <Link to={`/super-admin/companies/${id}/payroll`} className="btn primary">
            View Company Payroll
          </Link>
        </div>
      </div>
    </div>
  );
}
