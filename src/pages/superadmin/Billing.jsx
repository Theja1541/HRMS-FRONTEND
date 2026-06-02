import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getPricingPlans,
  createPricingPlan,
  updatePricingPlan,
  deletePricingPlan,
  getPayments,
  getInvoices,
  getSubscriptionAlerts,
  assignPlanToCompany,
} from "../../api/billing";
import { getCompanies } from "../../api/companies";
import "../../styles/pages.css";
import "../../styles/modal.css";

const TABS = ["Plans", "Payments", "Invoices", "Subscription Alerts"];

const formatCurrency = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

const ORIGINAL_MODULES_SCHEMA = [
  {
    key: "attendance",
    label: "Attendance",
    icon: "📅",
    description: "Monitor check-in logs and monthly attendance statistics.",
    pages: [
      { key: "attendance", label: "Attendance Log", actions: ["view", "edit", "create"] },
      { key: "monthly", label: "Monthly Report", actions: ["view", "edit", "create"] }
    ]
  },
  {
    key: "leave",
    label: "Leaves",
    icon: "🍃",
    description: "Review and approve/reject employee leaves requests.",
    pages: [
      { key: "dashboard", label: "Dashboard", actions: ["view"] },
      { key: "approvals", label: "Approvals", actions: ["view", "approve"] },
      { key: "rejected", label: "Rejected", actions: ["view", "approve"] },
      { key: "leave-calendar", label: "Calendar", actions: ["view"] },
      { key: "leave-settings", label: "Settings", actions: ["view", "edit"] }
    ]
  },
  {
    key: "payroll",
    label: "Payroll",
    icon: "💰",
    description: "Structure salaries, generate payslips and log payments.",
    pages: [
      { key: "payroll", label: "Generate Payslip", actions: ["view", "create", "delete", "approve"] },
      { key: "payroll-summary", label: "Payroll Summary", actions: ["view", "edit"] },
      { key: "salary-payment-summary", label: "Payment Summary", actions: ["view", "export"] },
      { key: "email-dashboard", label: "Email Dashboard", actions: ["view", "create"] }
    ]
  },
  {
    key: "assets",
    label: "Assets",
    icon: "📦",
    description: "Assign company assets and track returns history.",
    pages: [
      { key: "dashboard", label: "Dashboard", actions: ["view"] },
      { key: "categories", label: "Categories", actions: ["view", "create", "edit", "delete"] },
      { key: "assets", label: "Manage Assets", actions: ["view", "create", "edit", "delete"] },
      { key: "assign", label: "Assign Assets", actions: ["view", "create", "edit", "delete"] },
      { key: "returns", label: "Returns", actions: ["view", "create", "edit"] },
      { key: "maintenance", label: "Maintenance", actions: ["view", "create", "edit", "delete"] },
      { key: "history", label: "History", actions: ["view"] }
    ]
  },
  {
    key: "daybook",
    label: "Day Book",
    icon: "📘",
    description: "Track financial transactions, categories, and categories reports.",
    pages: [
      { key: "dashboard", label: "Dashboard", actions: ["view"] },
      { key: "transactions", label: "Transactions", actions: ["view", "create", "edit", "delete"] },
      { key: "vendors", label: "Vendors", actions: ["view", "create", "edit", "delete"] },
      { key: "categories", label: "Categories", actions: ["view", "create", "edit", "delete"] },
      { key: "reports", label: "Reports", actions: ["view", "export"] }
    ]
  },
  {
    key: "holidays",
    label: "Holidays",
    icon: "🏖️",
    description: "Configure active calendar company holidays list.",
    pages: [
      { key: "view", label: "Holidays List", actions: ["view", "create", "edit", "delete"] }
    ]
  },
  {
    key: "notifications",
    label: "Notifications",
    icon: "📧",
    description: "Send company wide announcements and email reminders.",
    pages: [
      { key: "view", label: "Send Notifications", actions: ["view", "create", "delete"] }
    ]
  },
  {
    key: "support",
    label: "Support",
    icon: "🎫",
    description: "Reply to employee queries and support help tickets.",
    pages: [
      { key: "view", label: "Support Tickets", actions: ["view", "create", "edit", "delete"] }
    ]
  },
  {
    key: "billing",
    label: "Billing",
    icon: "💳",
    description: "Manage subscription plans and corporate billing invoices.",
    pages: [
      { key: "view", label: "Billing & Plans", actions: ["view", "create", "export"] }
    ]
  }
];

const getInitialModulesState = () => {
  const state = {};
  ORIGINAL_MODULES_SCHEMA.forEach(mod => {
    state[mod.key] = {
      enabled: true,
      pages: {},
      actions: {
        view: true,
        create: true,
        edit: true,
        delete: true,
        export: true,
        approve: true
      },
      page_actions: {}
    };
    mod.pages.forEach(p => {
      state[mod.key].pages[p.key] = true;
      state[mod.key].page_actions[p.key] = {};
      const allowedActions = p.actions || ["view", "create", "edit", "delete", "export", "approve"];
      allowedActions.forEach(act => {
        state[mod.key].page_actions[p.key][act] = true;
      });
    });
  });
  return state;
};

const normalizeCompanyModules = (modules) => {
  const normalized = {};
  ORIGINAL_MODULES_SCHEMA.forEach(mod => {
    const existing = modules?.[mod.key];
    
    normalized[mod.key] = {
      enabled: true,
      pages: {},
      actions: {
        view: true,
        create: true,
        edit: true,
        delete: true,
        export: true,
        approve: true
      },
      page_actions: {}
    };

    mod.pages.forEach(p => {
      normalized[mod.key].pages[p.key] = true;
      normalized[mod.key].page_actions[p.key] = {};
      const allowedActions = p.actions || ["view", "create", "edit", "delete", "export", "approve"];
      allowedActions.forEach(act => {
        normalized[mod.key].page_actions[p.key][act] = true;
      });
    });

    if (existing !== undefined) {
      if (typeof existing === "boolean") {
        normalized[mod.key].enabled = existing;
        mod.pages.forEach(p => {
          normalized[mod.key].pages[p.key] = existing;
          const allowedActions = p.actions || ["view", "create", "edit", "delete", "export", "approve"];
          allowedActions.forEach(act => {
            normalized[mod.key].page_actions[p.key][act] = existing;
          });
        });
        Object.keys(normalized[mod.key].actions).forEach(act => {
          normalized[mod.key].actions[act] = existing;
        });
      } else if (typeof existing === "object" && existing !== null) {
        if (existing.enabled !== undefined) {
          normalized[mod.key].enabled = (existing.enabled === true);
          mod.pages.forEach(p => {
            normalized[mod.key].pages[p.key] = (existing.pages?.[p.key] !== false);
            normalized[mod.key].page_actions[p.key] = {};
            const allowedActions = p.actions || ["view", "create", "edit", "delete", "export", "approve"];
            allowedActions.forEach(act => {
              if (existing.page_actions?.[p.key]?.[act] !== undefined) {
                normalized[mod.key].page_actions[p.key][act] = (existing.page_actions[p.key][act] === true);
              } else if (existing.actions?.[act] !== undefined) {
                normalized[mod.key].page_actions[p.key][act] = (existing.actions[act] === true);
              } else {
                normalized[mod.key].page_actions[p.key][act] = true;
              }
            });
          });
          Object.keys(normalized[mod.key].actions).forEach(act => {
            normalized[mod.key].actions[act] = (existing.actions?.[act] !== false);
          });
        } else {
          const hasAny = Object.values(existing).some(val => val === true);
          normalized[mod.key].enabled = hasAny;
          mod.pages.forEach(p => {
            normalized[mod.key].pages[p.key] = (existing[p.key] === true || existing[p.key] === undefined);
            normalized[mod.key].page_actions[p.key] = {};
            const allowedActions = p.actions || ["view", "create", "edit", "delete", "export", "approve"];
            allowedActions.forEach(act => {
              normalized[mod.key].page_actions[p.key][act] = hasAny;
            });
          });
          Object.keys(normalized[mod.key].actions).forEach(act => {
            if (existing[act] !== undefined) {
              normalized[mod.key].actions[act] = (existing[act] === true);
            } else {
              normalized[mod.key].actions[act] = hasAny;
            }
          });
        }
      }
    }
  });
  return normalized;
};

export default function Billing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState("Plans");
  const [plans, setPlans] = useState([]);
  const [plansPage, setPlansPage] = useState(1);
  const itemsPerPage = 5;
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [planModal, setPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planForm, setPlanForm] = useState({
    name: "",
    slug: "",
    description: "",
    monthly_price: "",
    yearly_price: "",
    gst_percentage: "18.00",
    employee_limit: "",
    features_json: getInitialModulesState(),
    is_active: true,
  });
  const [assignModal, setAssignModal] = useState(false);
  const [assignCompanyId, setAssignCompanyId] = useState(null);
  const [assignForm, setAssignForm] = useState({
    pricing_plan_id: "",
    billing_cycle: "monthly",
    subscription_period_start: new Date().toISOString().slice(0, 10),
    subscription_period_end: ""
  });

  const loadPlans = () => getPricingPlans().then((r) => setPlans(r.data || []));
  const loadPayments = () => getPayments().then((r) => setPayments(r.data || []));
  const loadInvoices = () => getInvoices().then((r) => setInvoices(r.data || []));
  const loadAlerts = () => getSubscriptionAlerts().then((r) => setAlerts(r.data?.alerts || []));
  const loadCompanies = () => getCompanies().then((r) => setCompanies(r.data || []));

  useEffect(() => {
    setLoading(true);
    Promise.all([loadPlans(), loadPayments(), loadInvoices(), loadAlerts(), loadCompanies()])
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab === "Plans") loadPlans();
    if (tab === "Payments") loadPayments();
    if (tab === "Invoices") loadInvoices();
    if (tab === "Subscription Alerts") loadAlerts();
  }, [tab]);

  const assignId = searchParams.get("assign");
  useEffect(() => {
    if (assignId && companies.length > 0) {
      setTab("Subscription Alerts");
      setAssignCompanyId(parseInt(assignId, 10));
      setAssignModal(true);
      setSearchParams({}); // clear query
    }
  }, [assignId, companies.length]);

  const openPlanModal = (plan = null) => {
    setEditingPlan(plan);
    setPlanForm(
      plan
        ? {
          name: plan.name,
          slug: plan.slug,
          description: plan.description || "",
          monthly_price: String(plan.monthly_price),
          yearly_price: String(plan.yearly_price),
          gst_percentage: String(plan.gst_percentage || "18.00"),
          employee_limit: plan.employee_limit != null ? String(plan.employee_limit) : "",
          features_json: normalizeCompanyModules(plan.features_json),
          is_active: plan.is_active !== false,
        }
        : {
          name: "",
          slug: "",
          description: "",
          monthly_price: "",
          yearly_price: "",
          gst_percentage: "18.00",
          employee_limit: "",
          features_json: getInitialModulesState(),
          is_active: true,
        }
    );
    setPlanModal(true);
  };

  const savePlan = async (e) => {
    e.preventDefault();
    const payload = {
      name: planForm.name,
      slug: planForm.slug || planForm.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      description: planForm.description,
      monthly_price: parseFloat(planForm.monthly_price) || 0,
      yearly_price: parseFloat(planForm.yearly_price) || 0,
      gst_percentage: parseFloat(planForm.gst_percentage) || 18.00,
      employee_limit: planForm.employee_limit ? parseInt(planForm.employee_limit, 10) : null,
      features_json: planForm.features_json,
      is_active: planForm.is_active,
    };
    try {
      if (editingPlan) await updatePricingPlan(editingPlan.id, payload);
      else await createPricingPlan(payload);
      setPlanModal(false);
      loadPlans();
    } catch (err) {
      alert(err.response?.data?.detail || err.response?.data?.name?.[0] || "Failed to save plan");
    }
  };

  const deletePlan = async (id) => {
    if (!window.confirm("Delete this plan?")) return;
    try {
      await deletePricingPlan(id);
      loadPlans();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete plan");
    }
  };

  const openAssignModal = (companyId) => {
    setAssignCompanyId(companyId);
    setAssignForm({
      pricing_plan_id: "",
      billing_cycle: "monthly",
      subscription_period_start: new Date().toISOString().slice(0, 10),
      subscription_period_end: ""
    });
    setAssignModal(true);
  };

  const submitAssign = async (e) => {
    e.preventDefault();
    if (!assignCompanyId || !assignForm.pricing_plan_id) return;
    try {
      await assignPlanToCompany(assignCompanyId, {
        pricing_plan_id: parseInt(assignForm.pricing_plan_id, 10),
        billing_cycle: assignForm.billing_cycle,
        subscription_period_start: assignForm.subscription_period_start || null,
        subscription_period_end: assignForm.subscription_period_end || null,
      });
      setAssignModal(false);
      loadAlerts();
      loadCompanies();
    } catch {
      alert("Failed to assign subscription plan");
    }
  };

  const toggleFeature = (modKey, pageKey = null) => {
    setPlanForm((prev) => {
      const normalized = normalizeCompanyModules(prev.features_json);
      if (!pageKey) {
        const nextState = !normalized[modKey].enabled;
        normalized[modKey].enabled = nextState;
        Object.keys(normalized[modKey].pages).forEach(pk => {
          normalized[modKey].pages[pk] = nextState;
        });
      } else {
        normalized[modKey].pages[pageKey] = !normalized[modKey].pages[pageKey];
        const hasAnyPage = Object.values(normalized[modKey].pages).some(v => v === true);
        normalized[modKey].enabled = hasAnyPage;
      }
      return {
        ...prev,
        features_json: normalized
      };
    });
  };

  if (loading && !plans.length) return <p>Loading billing...</p>;

  return (
    <div>
      <div className="page-hero" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 0 }}>
        <h2 style={{ margin: 0, color: "white" }}>💳 Subscription &amp; Billing</h2>
      </div>

      <div style={{ 
        display: "flex", 
        gap: 8, 
        flexWrap: "wrap",
        marginBottom: 32, 
        marginTop: 24, 
        background: "#f1f5f9", 
        padding: "6px", 
        borderRadius: "32px", 
        width: "fit-content",
        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.04)"
      }}>
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            style={{
              padding: "10px 24px",
              borderRadius: "24px",
              border: "none",
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              background: tab === t ? "#ffffff" : "transparent",
              color: tab === t ? "#0f172a" : "#64748b",
              boxShadow: tab === t ? "0 4px 12px rgba(0,0,0,0.08)" : "none",
            }}
            onClick={() => { setTab(t); setPlansPage(1); }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Plans" && (() => {
        const totalPages = Math.ceil(plans.length / itemsPerPage);
        const startIndex = (plansPage - 1) * itemsPerPage;
        const paginatedPlans = plans.slice(startIndex, startIndex + itemsPerPage);

        return (
        <div style={{ 
          background: "#fff", 
          borderRadius: "20px", 
          boxShadow: "0 10px 40px -10px rgba(0,0,0,0.05)", 
          border: "1px solid #e2e8f0",
          overflow: "hidden" 
        }}>
          <div style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            padding: "24px 32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}>
            <div>
              <h3 style={{ margin: 0, color: "white", fontSize: 20, fontWeight: 800, letterSpacing: "-0.01em" }}>💰 Subscription Plans</h3>
              <p style={{ margin: "6px 0 0 0", color: "#94a3b8", fontSize: 14 }}>Manage platform active plans, cyclic prices, and permissions</p>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button type="button" className="btn" onClick={() => loadPlans()} style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "10px", padding: "8px 16px" }}>
                🔄 Refresh
              </button>
              <button type="button" className="btn" onClick={() => openPlanModal()} style={{ background: "white", color: "#2563eb", border: "none", fontWeight: 700, borderRadius: "10px", padding: "8px 16px" }}>
                ➕ Create Plan
              </button>
            </div>
          </div>
          {plans.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <p className="muted-text" style={{ marginBottom: 16 }}>No subscription plans yet. Create one to get started.</p>
              <button type="button" className="btn primary" onClick={() => openPlanModal()} style={{ borderRadius: "10px", padding: "10px 24px", fontWeight: 700 }}>Create First Plan</button>
            </div>
          ) : (
            <div className="responsive-table-container" style={{ margin: 0, padding: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: "30%" }}>Plan details</th>
                    <th style={{ width: "25%" }}>Pricing (INR)</th>
                    <th style={{ width: "15%", textAlign: "center" }}>Max Employees</th>
                    <th style={{ width: "12%" }}>Status</th>
                    <th style={{ width: "18%", textAlign: "center" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPlans.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <strong style={{ fontSize: "14px", color: "#0f172a" }}>{p.name}</strong>
                        <span className="muted-text" style={{ display: "block", fontSize: 11, fontStyle: "italic", marginTop: 2 }}>Slug: {p.slug}</span>
                        {p.description && (
                          <span className="muted-text" style={{ display: "block", fontSize: 12, marginTop: 4 }}>
                            {p.description}
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: "700", fontSize: "14px", color: "#0f172a" }}>{formatCurrency(p.monthly_price)} /mo</div>
                        <div style={{ fontWeight: "600", fontSize: "13px", color: "#64748b", marginTop: 2 }}>{formatCurrency(p.yearly_price)} /yr</div>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span style={{ fontSize: "14px", fontWeight: "600" }}>
                          {p.employee_limit == null ? "Unlimited" : p.employee_limit}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            padding: "6px 12px",
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 600,
                            background: p.is_active ? "#dcfce7" : "#fee2e2",
                            color: p.is_active ? "#166534" : "#991b1b",
                            display: "inline-block",
                          }}
                        >
                          {p.is_active ? "✓ Active" : "⊘ Inactive"}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button type="button" className="btn" onClick={() => openPlanModal(p)} style={{ marginRight: 8 }}>
                          Edit
                        </button>
                        <button type="button" className="btn danger" onClick={() => deletePlan(p.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {plans.length > 0 && (
                <div className="pagination" style={{ 
                  marginTop: 0, 
                  padding: '16px 24px', 
                  background: '#f8fafc', 
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span className="page-summary" style={{ color: '#64748b', fontSize: '14px', fontWeight: '500', margin: 0 }}>
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, plans.length)} of {plans.length} plans
                  </span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: plansPage === 1 ? '#f1f5f9' : '#fff', color: plansPage === 1 ? '#94a3b8' : '#334155', cursor: plansPage === 1 ? 'not-allowed' : 'pointer', fontWeight: '500', fontSize: '14px', transition: 'all 0.2s' }}
                      disabled={plansPage === 1}
                      onClick={() => setPlansPage(plansPage - 1)}
                    >
                      Previous
                    </button>
                    
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, idx) => {
                        const start = Math.max(1, plansPage - 2);
                        return start + idx <= totalPages ? start + idx : null;
                      }).filter(Boolean).map((pg) => (
                        <button
                          key={pg}
                          style={{ width: '36px', height: '36px', borderRadius: '8px', border: pg === plansPage ? 'none' : '1px solid #e2e8f0', background: pg === plansPage ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : '#fff', color: pg === plansPage ? '#fff' : '#334155', cursor: 'pointer', fontWeight: pg === plansPage ? '600' : '500', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: pg === plansPage ? '0 2px 4px rgba(37,99,235,0.2)' : 'none', transition: 'all 0.2s' }}
                          onClick={() => setPlansPage(pg)}
                        >
                          {pg}
                        </button>
                      ))}
                    </div>

                    <button
                      style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: plansPage >= totalPages ? '#f1f5f9' : '#fff', color: plansPage >= totalPages ? '#94a3b8' : '#334155', cursor: plansPage >= totalPages ? 'not-allowed' : 'pointer', fontWeight: '500', fontSize: '14px', transition: 'all 0.2s' }}
                      disabled={plansPage >= totalPages}
                      onClick={() => setPlansPage(plansPage + 1)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      );})()}

      {tab === "Payments" && (
        <div style={{ 
          background: "#fff", 
          borderRadius: "20px", 
          boxShadow: "0 10px 40px -10px rgba(0,0,0,0.05)", 
          border: "1px solid #e2e8f0",
          overflow: "hidden" 
        }}>
          <div style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            padding: "24px 32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(255,255,255,0.1)"
          }}>
            <div>
              <h3 style={{ margin: 0, color: "white", fontSize: 20, fontWeight: 800, letterSpacing: "-0.01em" }}>💳 Payments</h3>
              <p style={{ margin: "6px 0 0 0", color: "#94a3b8", fontSize: 14 }}>Track all payment transactions</p>
            </div>
          </div>
          {payments.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <p className="muted-text">No payments recorded yet.</p>
            </div>
          ) : (
            <div className="responsive-table-container" style={{ margin: 0, padding: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: "22%" }}>Company</th>
                    <th style={{ width: "18%" }}>Plan</th>
                    <th style={{ width: "15%" }}>Amount</th>
                    <th style={{ width: "15%" }}>Status</th>
                    <th style={{ width: "15%" }}>Date</th>
                    <th style={{ width: "15%" }}>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td><strong>{p.company_name}</strong></td>
                      <td>{p.plan_name || "—"}</td>
                      <td style={{ fontWeight: "600" }}>{formatCurrency(p.amount)}</td>
                      <td>
                        <span style={{
                          padding: "4px 8px",
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          background: p.status === "COMPLETED" ? "#dcfce7" : p.status === "PENDING" ? "#fef3c7" : "#fee2e2",
                          color: p.status === "COMPLETED" ? "#166534" : p.status === "PENDING" ? "#a16207" : "#991b1b",
                          display: "inline-block"
                        }}>
                          {p.status}
                        </span>
                      </td>
                      <td>{p.payment_date || "—"}</td>
                      <td><code style={{ fontSize: 12, backgroundColor: "#f1f5f9", padding: "2px 6px", borderRadius: 4 }}>{p.reference || "—"}</code></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "Invoices" && (
        <div style={{ 
          background: "#fff", 
          borderRadius: "20px", 
          boxShadow: "0 10px 40px -10px rgba(0,0,0,0.05)", 
          border: "1px solid #e2e8f0",
          overflow: "hidden" 
        }}>
          <div style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            padding: "24px 32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(255,255,255,0.1)"
          }}>
            <div>
              <h3 style={{ margin: 0, color: "white", fontSize: 20, fontWeight: 800, letterSpacing: "-0.01em" }}>🧾 Invoice History</h3>
              <p style={{ margin: "6px 0 0 0", color: "#94a3b8", fontSize: 14 }}>View and manage all invoices</p>
            </div>
          </div>
          {invoices.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <p className="muted-text">No invoices created yet.</p>
            </div>
          ) : (
            <div className="responsive-table-container" style={{ margin: 0, padding: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: "15%" }}>Invoice #</th>
                    <th style={{ width: "25%" }}>Company</th>
                    <th style={{ width: "15%" }}>Amount</th>
                    <th style={{ width: "15%" }}>Issued</th>
                    <th style={{ width: "15%" }}>Due</th>
                    <th style={{ width: "15%" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td><strong style={{ fontSize: 14 }}>{inv.invoice_number}</strong></td>
                      <td><strong>{inv.company_name}</strong></td>
                      <td style={{ fontWeight: "600" }}>{formatCurrency(inv.amount)}</td>
                      <td>{inv.issued_at}</td>
                      <td>{inv.due_date}</td>
                      <td>
                        <span style={{
                          padding: "4px 8px",
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          background: inv.status === "PAID" ? "#dcfce7" : inv.status === "SENT" ? "#eff6ff" : "#f3f4f6",
                          color: inv.status === "PAID" ? "#166534" : inv.status === "SENT" ? "#1e3a8a" : "#374151",
                          display: "inline-block"
                        }}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "Subscription Alerts" && (
        <div style={{ 
          background: "#fff", 
          borderRadius: "20px", 
          boxShadow: "0 10px 40px -10px rgba(0,0,0,0.05)", 
          border: "1px solid #e2e8f0",
          overflow: "hidden" 
        }}>
          <div style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            padding: "24px 32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(255,255,255,0.1)"
          }}>
            <div>
              <h3 style={{ margin: 0, color: "white", fontSize: 20, fontWeight: 800, letterSpacing: "-0.01em" }}>⚠️ Subscription Expiry Alerts</h3>
              <p style={{ margin: "6px 0 0 0", color: "#94a3b8", fontSize: 14 }}>
                Companies with subscription ending in the next 30 days or already expired.
              </p>
            </div>
          </div>
          {alerts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <p className="muted-text">No expiring or expired subscriptions.</p>
            </div>
          ) : (
            <div className="responsive-table-container" style={{ margin: 0, padding: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Plan</th>
                    <th>Expiry Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((a) => (
                    <tr key={a.company_id}>
                      <td><strong>{a.company_name}</strong><span className="muted-text" style={{ display: "block", fontSize: 12, marginTop: 2 }}>({a.company_code})</span></td>
                      <td>{a.plan_name || "—"}</td>
                      <td>{a.subscription_period_end}</td>
                      <td>
                        <span style={{
                          padding: "4px 8px",
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          background: a.expired ? "#fee2e2" : "#fef3c7",
                          color: a.expired ? "#b91c1c" : "#b45309",
                          display: "inline-block"
                        }}>
                          {a.expired ? "Expired" : `Expires in ${a.days_until_expiry}d`}
                        </span>
                      </td>
                      <td>
                        <button type="button" className="btn primary" onClick={() => openAssignModal(a.company_id)}>
                          Extend / Assign
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Plan create/edit modal */}
      {planModal && (
        <div className="modal-overlay" onClick={() => setPlanModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <h3 style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginBottom: "16px" }}>
              {editingPlan ? "📝 Edit Subscription Plan" : "➕ Create Subscription Plan"}
            </h3>
            <form onSubmit={savePlan}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "12px" }}>
                <div>
                  <label style={{ fontWeight: "700", display: "block", marginBottom: "4px" }}>Name *</label>
                  <input value={planForm.name} onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} required style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                </div>
                <div>
                  <label style={{ fontWeight: "700", display: "block", marginBottom: "4px" }}>Slug (Optional)</label>
                  <input value={planForm.slug} onChange={(e) => setPlanForm({ ...planForm, slug: e.target.value })} placeholder="e.g. professional" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                </div>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontWeight: "700", display: "block", marginBottom: "4px" }}>Description</label>
                <textarea value={planForm.description} onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })} placeholder="Write a short plan overview..." style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", minHeight: "60px", resize: "vertical" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <label style={{ fontWeight: "700", display: "block", marginBottom: "4px" }}>Monthly Price (INR) *</label>
                  <input type="number" min="0" step="0.01" value={planForm.monthly_price} onChange={(e) => setPlanForm({ ...planForm, monthly_price: e.target.value })} required style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                </div>
                <div>
                  <label style={{ fontWeight: "700", display: "block", marginBottom: "4px" }}>Yearly Price (INR) *</label>
                  <input type="number" min="0" step="0.01" value={planForm.yearly_price} onChange={(e) => setPlanForm({ ...planForm, yearly_price: e.target.value })} required style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                </div>
                <div>
                  <label style={{ fontWeight: "700", display: "block", marginBottom: "4px" }}>GST Rate (%) *</label>
                  <input type="number" min="0" max="100" step="0.01" value={planForm.gst_percentage} onChange={(e) => setPlanForm({ ...planForm, gst_percentage: e.target.value })} required style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ fontWeight: "700", display: "block", marginBottom: "4px" }}>Max Staff Limit (Optional)</label>
                  <input type="number" min="0" value={planForm.employee_limit} onChange={(e) => setPlanForm({ ...planForm, employee_limit: e.target.value })} placeholder="Unlimited" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", paddingTop: "24px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "700", cursor: "pointer" }}>
                    <input type="checkbox" checked={planForm.is_active} onChange={(e) => setPlanForm({ ...planForm, is_active: e.target.checked })} style={{ width: "18px", height: "18px" }} />
                    Active Status
                  </label>
                </div>
              </div>

              {/* Module Feature Flags Selection Grid */}
              <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
                <h4 style={{ margin: "0 0 16px 0", fontSize: "15px", fontWeight: "800", color: "#1e293b", borderBottom: "1px solid #cbd5e1", paddingBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>🔐</span> Plan Modules &amp; Subpages Configuration
                </h4>
                
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
                  gap: "16px",
                  maxHeight: "350px",
                  overflowY: "auto",
                  paddingRight: "6px"
                }}>
                  {ORIGINAL_MODULES_SCHEMA.map((m) => {
                    const normalized = normalizeCompanyModules(planForm.features_json);
                    const isModEnabled = normalized[m.key]?.enabled === true;
                    
                    return (
                      <div
                        key={m.key}
                        style={{
                          background: "#ffffff",
                          borderRadius: "12px",
                          border: `1px solid ${isModEnabled ? "#3b82f6" : "#e2e8f0"}`,
                          padding: "16px",
                          boxShadow: isModEnabled ? "0 4px 12px rgba(37,99,235,0.06)" : "none",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", borderBottom: "1px dashed #e2e8f0", paddingBottom: "8px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "18px" }}>{m.icon}</span>
                            <span style={{ fontWeight: "700", color: "#1e293b", fontSize: "14px" }}>{m.label}</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={isModEnabled}
                            onChange={() => toggleFeature(m.key)}
                            style={{ width: "18px", height: "18px", cursor: "pointer" }}
                          />
                        </div>
                        
                        <p style={{ margin: "0 0 12px 0", fontSize: "11px", color: "#64748b", lineHeight: "1.4", height: "32px", overflow: "hidden" }}>
                          {m.description}
                        </p>
                        
                        {isModEnabled && m.pages && m.pages.length > 0 && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px", background: "#f8fafc", padding: "10px", borderRadius: "8px" }}>
                            <span style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pages:</span>
                            {m.pages.map((p) => {
                              const isPageEnabled = normalized[m.key]?.pages?.[p.key] === true;
                              return (
                                <label
                                  key={p.key}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    color: isPageEnabled ? "#334155" : "#94a3b8",
                                    cursor: "pointer",
                                    userSelect: "none"
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isPageEnabled}
                                    onChange={() => toggleFeature(m.key, p.key)}
                                    style={{ width: "14px", height: "14px", cursor: "pointer" }}
                                  />
                                  {p.label}
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="modal-actions" style={{ borderTop: "1px solid #e2e8f0", paddingTop: "14px", marginTop: "10px" }}>
                <button type="submit" className="btn primary" style={{ padding: "10px 24px", borderRadius: "8px", fontWeight: "750" }}>Save</button>
                <button type="button" className="btn-cancel" onClick={() => setPlanModal(false)} style={{ padding: "10px 24px", borderRadius: "8px", background: "#f1f5f9", color: "#334155" }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign plan modal */}
      {assignModal && assignCompanyId && (
        <div className="modal-overlay" onClick={() => setAssignModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <h3>Assign Subscription to Company</h3>
            <form onSubmit={submitAssign}>
              <label>Subscription Plan *</label>
              <select value={assignForm.pricing_plan_id} onChange={(e) => setAssignForm({ ...assignForm, pricing_plan_id: e.target.value })} required>
                <option value="">Select plan</option>
                {plans.filter((p) => p.is_active).map((p) => (
                  <option key={p.id} value={p.id}>{p.name} – {formatCurrency(p.monthly_price)}/mo</option>
                ))}
              </select>
              
              <label style={{ marginTop: "12px", display: "block" }}>Billing Cycle *</label>
              <select value={assignForm.billing_cycle} onChange={(e) => setAssignForm({ ...assignForm, billing_cycle: e.target.value })} required>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>

              <label style={{ marginTop: "12px", display: "block" }}>Subscription period start</label>
              <input type="date" value={assignForm.subscription_period_start} onChange={(e) => setAssignForm({ ...assignForm, subscription_period_start: e.target.value })} />
              
              <label style={{ marginTop: "12px", display: "block" }}>Subscription period end (optional)</label>
              <input type="date" value={assignForm.subscription_period_end} onChange={(e) => setAssignForm({ ...assignForm, subscription_period_end: e.target.value })} />
              
              <div className="modal-actions">
                <button type="submit" className="btn primary">Assign</button>
                <button type="button" className="btn-cancel" onClick={() => setAssignModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
