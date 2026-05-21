import { useEffect, useMemo, useState } from "react";
import { getReportsOverview } from "../../api/superadmin";
import "../../styles/pages.css";

const currency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const number = (value) => new Intl.NumberFormat("en-IN").format(Number(value || 0));

const monthLabel = (value) => {
  const [year, month] = String(value || "").split("-");
  if (!year || !month) return value || "";
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("en-IN", {
    month: "short",
  });
};

const roleColors = {
  SUPER_ADMIN: "#7c3aed",
  ADMIN: "#2563eb",
  HR: "#0891b2",
  EMPLOYEE: "#16a34a",
};

function KpiCard({ label, value, sub, trend, tone = "#2563eb" }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 8,
        padding: 18,
        boxShadow: "0 4px 16px rgba(15,23,42,0.08)",
        border: "1px solid #eef2f7",
        minHeight: 132,
      }}
    >
      <div style={{ color: "#64748b", fontSize: 12, fontWeight: 800, textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ marginTop: 10, fontSize: 28, fontWeight: 850, color: tone }}>
        {value}
      </div>
      {sub && <div style={{ marginTop: 8, color: "#475569", fontSize: 13 }}>{sub}</div>}
      {trend != null && (
        <div style={{ marginTop: 10, color: trend >= 0 ? "#15803d" : "#b91c1c", fontSize: 12, fontWeight: 800 }}>
          {trend >= 0 ? "Up" : "Down"} {number(Math.abs(trend))} last 30 days
        </div>
      )}
    </div>
  );
}

function SectionCard({ title, subtitle, children }) {
  return (
    <section
      style={{
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 4px 16px rgba(15,23,42,0.08)",
        border: "1px solid #eef2f7",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "18px 22px",
          background: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <h3 style={{ margin: 0, color: "#0f172a", fontSize: 17, fontWeight: 800 }}>{title}</h3>
        {subtitle && <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>{subtitle}</p>}
      </div>
      <div style={{ padding: 22 }}>{children}</div>
    </section>
  );
}

function BarChart({ data, valueKey, color, formatter = number }) {
  const values = data.map((item) => Number(item[valueKey] || 0));
  const max = Math.max(...values, 1);
  const hasData = values.some((value) => value > 0);

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${data.length}, minmax(28px, 1fr))`,
          alignItems: "end",
          gap: 10,
          minHeight: 210,
          padding: "8px 2px 0",
          borderBottom: "1px solid #cbd5e1",
        }}
      >
        {data.map((item) => {
          const rawValue = Number(item[valueKey] || 0);
          const height = hasData ? Math.max(rawValue === 0 ? 2 : 18, (rawValue / max) * 160) : 2;
          return (
            <div key={item.month} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ height: 22, color: "#334155", fontSize: 11, fontWeight: 800 }}>
                {rawValue > 0 ? formatter(rawValue) : ""}
              </div>
              <div
                title={`${item.month}: ${formatter(rawValue)}`}
                style={{
                  width: "100%",
                  maxWidth: 48,
                  height,
                  background: rawValue > 0 ? color : "#e2e8f0",
                  borderRadius: "6px 6px 0 0",
                  transition: "height 0.25s ease",
                }}
              />
            </div>
          );
        })}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${data.length}, minmax(28px, 1fr))`,
          gap: 10,
          paddingTop: 10,
        }}
      >
        {data.map((item) => (
          <div key={item.month} style={{ textAlign: "center", color: "#64748b", fontSize: 11, fontWeight: 700 }}>
            {monthLabel(item.month)}
          </div>
        ))}
      </div>
    </div>
  );
}

function DistributionList({ rows, labelKey, totalKey = "count", colorFor }) {
  const total = rows.reduce((sum, row) => sum + Number(row[totalKey] || 0), 0) || 1;
  if (!rows.length) return <p style={{ color: "#64748b", margin: 0 }}>No data yet.</p>;

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {rows.map((row, index) => {
        const label = labelKey(row);
        const value = Number(row[totalKey] || 0);
        const percent = Math.round((value / total) * 100);
        const color = colorFor?.(row, index) || "#2563eb";
        return (
          <div key={`${label}-${index}`}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 7 }}>
              <span style={{ color: "#0f172a", fontWeight: 800 }}>{label}</span>
              <span style={{ color: "#475569", fontWeight: 700 }}>{number(value)} ({percent}%)</span>
            </div>
            <div style={{ height: 10, background: "#eaf0f7", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ width: `${percent}%`, height: "100%", background: color, borderRadius: 999 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ReportsTable({ columns, rows, empty }) {
  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} style={column.style}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: "center", color: "#64748b", padding: 24 }}>
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr key={row.id || rowIndex}>
                {columns.map((column) => (
                  <td key={column.key} style={column.cellStyle}>
                    {column.render(row, rowIndex)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReports = () => {
    setLoading(true);
    setError("");
    getReportsOverview()
      .then((response) => setData(response.data))
      .catch(() => setError("Failed to load reports. Please try again."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReports();
  }, []);

  const kpis = data?.kpis || {};
  const monthlyCompanies = data?.monthly_companies || [];
  const monthlyUsers = data?.monthly_users || [];
  const monthlyRevenue = data?.monthly_revenue || [];
  const usersByRole = data?.users_by_role || [];
  const planDistribution = data?.plan_distribution || [];
  const topCompanies = data?.top_companies || [];
  const recentPayments = data?.recent_payments || [];

  const chartSummary = useMemo(() => {
    const companyTotal = monthlyCompanies.reduce((sum, item) => sum + Number(item.count || 0), 0);
    const userTotal = monthlyUsers.reduce((sum, item) => sum + Number(item.count || 0), 0);
    const revenueTotal = monthlyRevenue.reduce((sum, item) => sum + Number(item.total || 0), 0);
    return { companyTotal, userTotal, revenueTotal };
  }, [monthlyCompanies, monthlyRevenue, monthlyUsers]);

  if (loading) {
    return (
      <div>
        <div className="page-hero">
          <h2 style={{ margin: 0, color: "white" }}>System Reports</h2>
        </div>
        <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b" }}>
          Loading platform analytics...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="page-hero">
          <h2 style={{ margin: 0, color: "white" }}>System Reports</h2>
        </div>
        <div style={{ textAlign: "center", padding: "60px 0", color: "#b91c1c" }}>
          <p>{error}</p>
          <button className="btn primary" onClick={loadReports}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-hero" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <div>
          <h2 style={{ margin: 0, color: "white" }}>System Reports</h2>
          <p style={{ margin: "5px 0 0", color: "rgba(255,255,255,0.8)", fontSize: 13 }}>
            Platform-wide analytics from live tenant, user, payroll, invoice, and payment records
          </p>
        </div>
        <button
          className="btn"
          onClick={loadReports}
          style={{ background: "rgba(255,255,255,0.16)", color: "white", border: "1px solid rgba(255,255,255,0.35)" }}
        >
          Refresh
        </button>
      </div>

      <div style={{ marginTop: 22, display: "grid", gap: 22 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
          <KpiCard label="Total Companies" value={number(kpis.total_companies)} sub={`${number(kpis.active_companies)} active`} trend={kpis.new_companies_30d} />
          <KpiCard label="Total Users" value={number(kpis.total_users)} sub="All roles" trend={kpis.new_users_30d} tone="#7c3aed" />
          <KpiCard label="Employees" value={number(kpis.total_employees)} sub="Across all companies" tone="#0891b2" />
          <KpiCard label="Revenue" value={currency(kpis.total_revenue)} sub={`${currency(kpis.revenue_30d)} last 30 days`} tone="#16a34a" />
          <KpiCard label="Invoices" value={number(kpis.paid_invoices)} sub={`${number(kpis.pending_invoices)} pending, ${number(kpis.overdue_invoices)} overdue`} tone="#ea580c" />
          <KpiCard label="Expiring Soon" value={number(kpis.expiring_soon)} sub="Subscriptions in next 30 days" tone="#dc2626" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 20 }}>
          <SectionCard title="Company Growth" subtitle={`${number(chartSummary.companyTotal)} companies created in the last 12 months`}>
            <BarChart data={monthlyCompanies} valueKey="count" color="#2563eb" />
          </SectionCard>
          <SectionCard title="User Growth" subtitle={`${number(chartSummary.userTotal)} users created in the last 12 months`}>
            <BarChart data={monthlyUsers} valueKey="count" color="#7c3aed" />
          </SectionCard>
          <SectionCard title="Monthly Revenue" subtitle={`${currency(chartSummary.revenueTotal)} completed payments in the last 12 months`}>
            <BarChart data={monthlyRevenue} valueKey="total" color="#16a34a" formatter={currency} />
          </SectionCard>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 20 }}>
          <SectionCard title="Users by Role" subtitle="Role distribution across the platform">
            <DistributionList
              rows={usersByRole}
              labelKey={(row) => String(row.role || "Unknown").replace("_", " ")}
              colorFor={(row) => roleColors[row.role] || "#64748b"}
            />
          </SectionCard>
          <SectionCard title="Plan Distribution" subtitle="Companies per pricing plan">
            <DistributionList
              rows={planDistribution}
              labelKey={(row) => row.pricing_plan__name || "No Plan"}
              colorFor={(_row, index) => ["#2563eb", "#7c3aed", "#0891b2", "#16a34a"][index % 4]}
            />
          </SectionCard>
        </div>

        <SectionCard title="Top Companies" subtitle="Ranked by employee headcount">
          <ReportsTable
            empty="No companies yet."
            rows={topCompanies}
            columns={[
              { key: "rank", label: "#", render: (_row, index) => index + 1, style: { width: "5%" } },
              {
                key: "company",
                label: "Company",
                render: (row) => (
                  <>
                    <strong style={{ color: "#0f172a" }}>{row.name}</strong>
                    <span style={{ display: "block", color: "#64748b", fontSize: 12 }}>{row.company_code}</span>
                  </>
                ),
              },
              { key: "employees", label: "Employees", render: (row) => number(row.employee_count), cellStyle: { fontWeight: 800, color: "#2563eb" } },
              { key: "plan", label: "Plan", render: (row) => row.plan || "-" },
              {
                key: "end",
                label: "Subscription End",
                render: (row) => row.subscription_period_end || "-",
              },
              {
                key: "status",
                label: "Status",
                render: (row) => {
                  const expired = row.subscription_period_end && new Date(row.subscription_period_end) < new Date();
                  return (
                    <span
                      style={{
                        display: "inline-block",
                        padding: "5px 11px",
                        borderRadius: 999,
                        background: expired ? "#fee2e2" : "#dcfce7",
                        color: expired ? "#991b1b" : "#166534",
                        fontSize: 12,
                        fontWeight: 800,
                      }}
                    >
                      {expired ? "Expired" : "Active"}
                    </span>
                  );
                },
              },
            ]}
          />
        </SectionCard>

        <SectionCard title="Recent Payments" subtitle="Latest completed transactions">
          <ReportsTable
            empty="No payments yet."
            rows={recentPayments}
            columns={[
              {
                key: "company",
                label: "Company",
                render: (row) => (
                  <>
                    <strong>{row.company__name}</strong>
                    <span style={{ display: "block", color: "#64748b", fontSize: 12 }}>{row.company__company_code}</span>
                  </>
                ),
              },
              { key: "plan", label: "Plan", render: (row) => row.pricing_plan__name || "-" },
              { key: "amount", label: "Amount", render: (row) => currency(row.amount), cellStyle: { color: "#16a34a", fontWeight: 800 } },
              { key: "date", label: "Date", render: (row) => row.payment_date || "-" },
              {
                key: "status",
                label: "Status",
                render: (row) => (
                  <span style={{ display: "inline-block", padding: "5px 11px", borderRadius: 999, background: "#dcfce7", color: "#166534", fontSize: 12, fontWeight: 800 }}>
                    {row.status}
                  </span>
                ),
              },
            ]}
          />
        </SectionCard>
      </div>
    </div>
  );
}
