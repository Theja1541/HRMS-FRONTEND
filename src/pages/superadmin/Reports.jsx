import { useEffect, useMemo, useState } from "react";
import { getReportsOverview } from "../../api/superadmin";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from "recharts";
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
        borderRadius: 12,
        padding: 20,
        boxShadow: "0 4px 16px rgba(15,23,42,0.06)",
        border: "1px solid #e2e8f0",
        minHeight: 132,
        transition: "all 0.25s ease",
        cursor: "default",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 24px rgba(15,23,42,0.12)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(15,23,42,0.06)"; }}
    >
      <div style={{ color: "#64748b", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
        {label}
      </div>
      <div style={{ marginTop: 12, fontSize: 32, fontWeight: 800, color: tone }}>
        {value}
      </div>
      {sub && <div style={{ marginTop: 6, color: "#64748b", fontSize: 13, fontWeight: 500 }}>{sub}</div>}
      {trend != null && (
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 4, color: trend >= 0 ? "#059669" : "#dc2626", fontSize: 13, fontWeight: 700 }}>
          {trend >= 0 ? "↑" : "↓"} {number(Math.abs(trend))} last 30 days
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
        borderRadius: 12,
        boxShadow: "0 4px 16px rgba(15,23,42,0.06)",
        border: "1px solid #e2e8f0",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <div
        style={{
          padding: "20px 24px",
          borderBottom: "1px solid #e2e8f0",
          background: "#f8fafc"
        }}
      >
        <h3 style={{ margin: 0, color: "#0f172a", fontSize: 18, fontWeight: 700 }}>{title}</h3>
        {subtitle && <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13, fontWeight: 500 }}>{subtitle}</p>}
      </div>
      <div style={{ padding: 24, flex: 1, display: "flex", flexDirection: "column" }}>{children}</div>
    </section>
  );
}

const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "#fff", padding: "12px 16px", border: "1px solid #e2e8f0", borderRadius: 8, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
        <p style={{ margin: "0 0 8px", color: "#64748b", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>{monthLabel(label)}</p>
        <p style={{ margin: 0, color: payload[0].fill || payload[0].color || "#0f172a", fontSize: 16, fontWeight: 800 }}>
          {formatter ? formatter(payload[0].value) : number(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

const PieCustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "#fff", padding: "12px 16px", border: "1px solid #e2e8f0", borderRadius: 8, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
        <p style={{ margin: "0 0 4px", color: "#64748b", fontSize: 12, fontWeight: 700 }}>{payload[0].name}</p>
        <p style={{ margin: 0, color: payload[0].payload.fill, fontSize: 16, fontWeight: 800 }}>
          {number(payload[0].value)} units
        </p>
      </div>
    );
  }
  return null;
};

function ReportsTable({ columns, rows, empty, itemsPerPage = 5, searchable = false, searchPlaceholder = "Search..." }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    const lowerSearch = searchTerm.toLowerCase();
    return rows.filter((row) => {
      // Match against string/number values in the row object
      return Object.values(row).some((val) =>
        val != null && String(val).toLowerCase().includes(lowerSearch)
      );
    });
  }, [rows, searchTerm]);

  const totalPages = Math.ceil(filteredRows.length / itemsPerPage);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const currentRows = filteredRows.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="table-wrapper">
      {searchable && (
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end" }}>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 14, minWidth: 250, outline: "none" }}
          />
        </div>
      )}
      <table className="table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} style={column.style}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentRows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: "center", color: "#64748b", padding: 24 }}>
                {empty}
              </td>
            </tr>
          ) : (
            currentRows.map((row, rowIndex) => (
              <tr key={row.id || rowIndex}>
                {columns.map((column) => (
                  <td key={column.key} style={column.cellStyle}>
                    {column.render(row, (currentPage - 1) * itemsPerPage + rowIndex)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "12px 16px", borderTop: "1px solid #e2e8f0" }}>
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            style={{ padding: "4px 10px", borderRadius: 4, border: "1px solid #cbd5e1", background: currentPage === 1 ? "#f8fafc" : "#fff", color: currentPage === 1 ? "#94a3b8" : "#334155", cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
          >
            Prev
          </button>
          <span style={{ display: "flex", alignItems: "center", fontSize: 13, color: "#64748b" }}>
            Page {currentPage} of {totalPages}
          </span>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            style={{ padding: "4px 10px", borderRadius: 4, border: "1px solid #cbd5e1", background: currentPage === totalPages ? "#f8fafc" : "#fff", color: currentPage === totalPages ? "#94a3b8" : "#334155", cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const loadReports = () => {
    setLoading(true);
    setError("");
    const params = {};
    if (fromDate) params.from_date = fromDate;
    if (toDate) params.to_date = toDate;

    getReportsOverview(params)
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
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <input 
            type="date" 
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.1)", color: "white", outline: "none", fontSize: 14 }}
          />
          <span style={{ color: "white" }}>to</span>
          <input 
            type="date" 
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.1)", color: "white", outline: "none", fontSize: 14 }}
          />
          <button
            className="btn"
            onClick={loadReports}
            style={{ background: "rgba(255,255,255,0.16)", color: "white", border: "1px solid rgba(255,255,255,0.35)", cursor: "pointer" }}
          >
            Refresh
          </button>
        </div>
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
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <AreaChart data={monthlyCompanies} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" tickFormatter={monthLabel} tick={{fill: "#64748b", fontSize: 12}} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{fill: "#64748b", fontSize: 12}} axisLine={false} tickLine={false} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorComp)" activeDot={{r: 6, strokeWidth: 0}} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
          <SectionCard title="User Growth" subtitle={`${number(chartSummary.userTotal)} users created in the last 12 months`}>
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={monthlyUsers} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" tickFormatter={monthLabel} tick={{fill: "#64748b", fontSize: 12}} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{fill: "#64748b", fontSize: 12}} axisLine={false} tickLine={false} />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{fill: "#f1f5f9"}} />
                  <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
          <SectionCard title="Monthly Revenue" subtitle={`${currency(chartSummary.revenueTotal)} completed payments in the last 12 months`}>
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <AreaChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" tickFormatter={monthLabel} tick={{fill: "#64748b", fontSize: 12}} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tickFormatter={(val) => `₹${val/1000}k`} tick={{fill: "#64748b", fontSize: 12}} axisLine={false} tickLine={false} />
                  <RechartsTooltip content={<CustomTooltip formatter={currency} />} />
                  <Area type="monotone" dataKey="total" stroke="#16a34a" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" activeDot={{r: 6, strokeWidth: 0}} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 20 }}>
          <SectionCard title="Users by Role" subtitle="Role distribution across the platform">
            <div style={{ width: "100%", height: 260 }}>
              {usersByRole.length === 0 ? (
                <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>No data yet.</div>
              ) : (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={usersByRole}
                      dataKey="count"
                      nameKey="role"
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {usersByRole.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={roleColors[entry.role] || "#64748b"} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<PieCustomTooltip />} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle" 
                      formatter={(value) => <span style={{ color: "#475569", fontWeight: 600, fontSize: 12 }}>{String(value).replace("_", " ")}</span>} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </SectionCard>
          <SectionCard title="Plan Distribution" subtitle="Companies per pricing plan">
            <div style={{ width: "100%", height: 260 }}>
              {planDistribution.length === 0 ? (
                <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>No data yet.</div>
              ) : (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={planDistribution}
                      dataKey="count"
                      nameKey="pricing_plan__name"
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {planDistribution.map((entry, index) => {
                        const colors = ["#2563eb", "#7c3aed", "#0891b2", "#16a34a"];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                      })}
                    </Pie>
                    <RechartsTooltip content={<PieCustomTooltip />} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle" 
                      formatter={(value) => <span style={{ color: "#475569", fontWeight: 600, fontSize: 12 }}>{value || "No Plan"}</span>} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Top Companies" subtitle="Ranked by employee headcount">
          <ReportsTable
            searchable
            searchPlaceholder="Search companies..."
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
              { key: "plan", label: "Plan", render: (row) => row.pricing_plan__name || row.plan || "-" },
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
            searchable
            searchPlaceholder="Search payments..."
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
