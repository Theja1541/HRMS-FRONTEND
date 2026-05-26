import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getCompany } from "../../api/companies";
import "../../styles/pages.css";

const PLAN_LABELS = { BASIC: "Basic", PREMIUM: "Premium" };

export default function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCompany(id)
      .then((res) => setCompany(res.data))
      .catch(() => alert("Failed to load company"))
      .finally(() => setLoading(false));
  }, [id]);

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
            {company.company_code} · {company.pricing_plan_name ? `${company.pricing_plan_name} (₹${parseFloat(company.pricing_plan_price || 0).toLocaleString("en-IN")}/mo)` : (PLAN_LABELS[company.plan] ?? company.plan ?? "—")} ·{" "}
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
