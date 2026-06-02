import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  activateCompany,
  hardDeleteCompany,
  stopCompanyActions,
  markCompanyPaid,
} from "../../api/companies";
import { getPricingPlans } from "../../api/billing";
import "../../styles/pages.css";
import "../../styles/modal.css";

const PLAN_LABELS = { BASIC: "Basic", PREMIUM: "Premium" };

const ACTIONS = [
  { key: "view", label: "View" },
  { key: "create", label: "Create" },
  { key: "edit", label: "Edit" },
  { key: "delete", label: "Delete" },
  { key: "export", label: "Export" },
  { key: "approve", label: "Approve" }
];

const MODULE_ACTIONS = {
  attendance: ["view", "create", "edit", "export"],
  leave: ["view", "create", "edit", "delete", "approve"],
  payroll: ["view", "create", "edit", "delete", "export", "approve"],
  assets: ["view", "create", "edit", "delete", "approve"],
  daybook: ["view", "create", "edit", "delete", "export"],
  holidays: ["view", "create", "edit", "delete"],
  notifications: ["view", "create", "delete"],
  support: ["view", "create", "edit", "delete"],
  billing: ["view", "create", "export"],
};

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
    
    // Initialize standard structure
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

    // Initialize pages & page_actions defaults
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
          // Legacy format
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

export default function Companies() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [pricingPlans, setPricingPlans] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);
  const [form, setForm] = useState({
    name: "",
    company_code: "",
    domain: "",
    email: "",
    phone: "",
    address: "",
    gstin: "",
    state: "",
    state_code: "",
    bank_account_no: "",
    bank_ifsc: "",
    bank_branch: "",
    plan: "BASIC",
    is_active: true,
    pricing_plan: "",
    subscription_period_start: new Date().toISOString().slice(0,10),
    subscription_period_end: "",
    admin_first_name: "",
    admin_last_name: "",
    admin_email: "",
    enabled_modules: getInitialModulesState(),
  });


  const [currentStep, setCurrentStep] = useState(1);

  const [markPaidOpen, setMarkPaidOpen] = useState(false);
  const [markPaidCompany, setMarkPaidCompany] = useState(null);
  const [markPaidDate, setMarkPaidDate] = useState("");

  const handleStopActions = async (id) => {
    setOpenMenuId(null);
    if (!window.confirm("Are you sure you want to STOP all actions for this company? Users will be locked out from performing actions except Billing and Support.")) return;
    try {
      await stopCompanyActions(id);
      alert("Company actions stopped successfully.");
      fetchCompanies();
    } catch (err) {
      alert("Failed to stop company actions");
    }
  };
  const openMarkPaidModal = (c) => {
    setOpenMenuId(null);
    setMarkPaidCompany(c);
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    const defaultDateStr = defaultDate.toISOString().slice(0, 10);
    setMarkPaidDate(defaultDateStr);
    setMarkPaidOpen(true);
  };

  const handleMarkPaidSubmit = async (e) => {
    e.preventDefault();
    if (!markPaidCompany) return;
    try {
      await markCompanyPaid(markPaidCompany.id, {
        subscription_period_end: markPaidDate,
      });
      alert("Company marked as paid. Actions restored successfully.");
      setMarkPaidOpen(false);
      setMarkPaidCompany(null);
      fetchCompanies();
    } catch (err) {
      alert("Failed to mark company as paid.");
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await getCompanies();
      let list = Array.isArray(res.data) ? res.data : [];
      // Ensure pricingPlans are available so we can enrich companies with plan names/prices
      let plans = pricingPlans && pricingPlans.length ? pricingPlans : [];
      if (!plans || plans.length === 0) {
        try {
          const plansRes = await getPricingPlans();
          plans = plansRes.data || [];
          setPricingPlans(plans);
        } catch (e) {
          plans = [];
        }
      }
      // Enrich companies using pricingPlans (match by pricing_plan, pricing_plan_id, or pricing_plan?.id)
      const enriched = list.map((c) => {
        const planId = c.pricing_plan ?? c.pricing_plan_id ?? (c.pricing_plan && c.pricing_plan.id) ?? null;
        if (planId && plans.length > 0) {
          const p = plans.find((x) => Number(x.id) === Number(planId));
          if (p) {
            return {
              ...c,
              pricing_plan_name: p.name,
              pricing_plan_price: p.monthly_price,
            };
          }
        }
        return c;
      });
      setCompanies(enriched);
    } catch (err) {
      console.error('fetchCompanies error', err);
      alert("Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    getPricingPlans().then((r) => setPricingPlans(r.data || [])).catch(() => {});
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      company_code: "",
      domain: "",
      email: "",
      phone: "",
      address: "",
      gstin: "",
      state: "",
      state_code: "",
      bank_account_no: "",
      bank_ifsc: "",
      bank_branch: "",
      plan: "BASIC",
      is_active: true,
      pricing_plan: "",
      subscription_period_start: new Date().toISOString().slice(0,10),
      subscription_period_end: "",
      admin_first_name: "",
      admin_last_name: "",
      admin_email: "",
      enabled_modules: getInitialModulesState(),
    });
    setCurrentStep(1);
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setOpenMenuId(null);
    setEditing(c);
    setForm({
      name: c.name || "",
      company_code: c.company_code || "",
      domain: c.domain || "",
      email: c.email || "",
      phone: c.phone || "",
      address: c.address || "",
      gstin: c.gstin || "",
      state: c.state || "",
      state_code: c.state_code || "",
      bank_account_no: c.bank_account_no || "",
      bank_ifsc: c.bank_ifsc || "",
      bank_branch: c.bank_branch || "",
      plan: c.plan || "BASIC",
      is_active: c.is_active !== false,
      pricing_plan: c.pricing_plan_id ?? c.pricing_plan ?? "",
      subscription_period_start: c.subscription_period_start ? c.subscription_period_start.slice(0,10) : new Date().toISOString().slice(0,10),
      subscription_period_end: c.subscription_period_end ? c.subscription_period_end.slice(0, 10) : "",
      admin_first_name: c.admin_first_name || "",
      admin_last_name: c.admin_last_name || "",
      admin_email: c.admin_email || "",
      enabled_modules: normalizeCompanyModules(c.enabled_modules),
    });
    setCurrentStep(1);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editing && !form.admin_email.trim()) {
      alert("Admin email is required when creating a company.");
      return;
    }
    try {
      const payload = { ...form };
      
      // Sanitize billing plan
      if (payload.pricing_plan === "") payload.pricing_plan = null;
      else payload.pricing_plan = parseInt(payload.pricing_plan, 10);
      
      // Sanitize subscription end date
      if (!payload.subscription_period_end) payload.subscription_period_end = null;
      if (!payload.subscription_period_start) payload.subscription_period_start = null;

      if (editing) {
        const res = await updateCompany(editing.id, payload);
        alert("Company updated");
        // Optimistically update local companies list with the pricing plan selected (if any)
        if (payload.pricing_plan) {
          const planId = payload.pricing_plan;
          const planObj = pricingPlans.find((p) => Number(p.id) === Number(planId));
          setCompanies((prev) => prev.map((c) => {
            if (c.id !== editing.id) return c;
            return {
              ...c,
              ...res.data,
              pricing_plan: planId,
              pricing_plan_name: planObj ? planObj.name : c.pricing_plan_name,
              pricing_plan_price: planObj ? planObj.monthly_price : c.pricing_plan_price,
            };
          }));
        }
      } else {
        const res = await createCompany(payload);
        alert(res.data?.message || "Company created");
      }
      setModalOpen(false);
      // Refresh list to pick up other changes; fetchCompanies will enrich plans as well
      fetchCompanies();
    } catch (err) {
      const msg =
        err.response?.data?.admin_email?.[0] ||
        err.response?.data?.company_code?.[0] ||
        err.response?.data?.domain?.[0] ||
        err.response?.data?.name?.[0] ||
        JSON.stringify(err.response?.data || err.message);
      alert(msg);
    }
  };

  const handleSuspend = async (id) => {
    setOpenMenuId(null);
    if (!window.confirm("Suspend this company? Users and data will remain but the company will be inactive.")) return;
    try {
      await deleteCompany(id);
      fetchCompanies();
    } catch {
      alert("Failed to suspend company");
    }
  };

  const handleActivate = async (id) => {
    setOpenMenuId(null);
    try {
      await activateCompany(id);
      fetchCompanies();
    } catch {
      alert("Failed to activate company");
    }
  };

  const handleHardDelete = async (id, name) => {
    setOpenMenuId(null);
    if (!window.confirm(`Permanently delete "${name}"? This cannot be undone. All related data (users, employees, payroll) will be removed.`)) return;
    try {
      await hardDeleteCompany(id);
      fetchCompanies();
    } catch {
      alert("Failed to delete company");
    }
  };

  const goToDetails = (id) => {
    setOpenMenuId(null);
    navigate(`/super-admin/companies/${id}`);
  };

  const toggleMenu = (companyId, buttonEl) => {
    if (openMenuId === companyId) {
      setOpenMenuId(null);
      return;
    }

    const rect = buttonEl.getBoundingClientRect();
    const menuWidth = 220;
    const menuHeight = 250; // Approximate height of the menu
    const viewportPadding = 12;
    
    // Horizontal bounds
    const maxLeft = window.innerWidth - menuWidth - viewportPadding;
    const nextLeft = Math.max(viewportPadding, Math.min(rect.left, maxLeft));

    // Vertical bounds (flip up if not enough space)
    const spaceBelow = window.innerHeight - rect.bottom;
    let nextTop = rect.bottom + 6;
    if (spaceBelow < menuHeight && rect.top > menuHeight) {
      nextTop = rect.top - menuHeight - 6;
    }

    setMenuPosition({
      top: nextTop,
      left: nextLeft
    });
    setOpenMenuId(companyId);
  };

  const activeCompany = companies.find((c) => c.id === openMenuId) || null;

  // Pagination calculations
  const totalPages = Math.ceil(companies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCompanies = companies.slice(startIndex, startIndex + itemsPerPage);

  if (loading) return <p>Loading companies...</p>;

  return (
    <div className="companies-page">
      <style>{`
        .sac-permissions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 16px;
          margin-top: 12px;
          margin-bottom: 24px;
        }
        .sac-module-card {
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 16px;
          transition: all 0.2s ease;
        }
        .sac-module-card.active {
          border-color: #3b82f6;
          background: #faf5ff;
        }
        .sac-module-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
          padding-bottom: 8px;
          border-bottom: 1px dashed #cbd5e1;
        }
        .sac-module-title-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .sac-module-icon {
          font-size: 18px;
        }
        .sac-module-title {
          font-weight: 600;
          color: #1e293b;
          font-size: 14px;
        }
        .sac-module-desc {
          font-size: 11px;
          color: #64748b;
          line-height: 1.4;
          margin-bottom: 12px;
          height: 32px;
          overflow: hidden;
        }
        .sac-subpages-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .sac-subpage-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #334155;
          cursor: pointer;
          padding: 4px 6px;
          border-radius: 4px;
          transition: background 0.15s ease;
        }
        .sac-subpage-item:hover {
          background: rgba(59, 130, 246, 0.05);
        }
        .sac-checkbox {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          border: 2px solid #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
          background: #ffffff;
        }
        .sac-checkbox.checked {
          border-color: #3b82f6;
          background: #3b82f6;
        }
        .sac-checkbox.checked::after {
          content: "✓";
          color: #ffffff;
          font-size: 10px;
          font-weight: bold;
        }
      `}</style>
      <div className="page-header">
        <h2 className="page-title">Company Management</h2>
        <button type="button" className="btn primary" onClick={openCreate}>
          ➕ Create Company
        </button>
      </div>

      <div className="card" style={{ marginTop: 24, display: 'flex', flexDirection: 'column', overflow: 'visible', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', background: '#fff', border: '1px solid #f1f5f9', padding: 0 }}>
        <div className="table-wrapper" style={{ width: '100%', borderTopLeftRadius: '16px', borderTopRightRadius: '16px', overflow: 'visible' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'left' }}>
            <thead style={{ background: 'linear-gradient(90deg, #f8fafc, #f1f5f9)', borderBottom: '2px solid #e2e8f0' }}>
              <tr>
                <th style={{ width: "35%", padding: "16px 24px", color: "#475569", fontWeight: "600", fontSize: "14px", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company</th>
                <th style={{ width: "15%", padding: "16px", color: "#475569", fontWeight: "600", fontSize: "14px", textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: "center" }}>Employees</th>
                <th style={{ width: "15%", padding: "16px", color: "#475569", fontWeight: "600", fontSize: "14px", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plan</th>
                <th style={{ width: "15%", padding: "16px", color: "#475569", fontWeight: "600", fontSize: "14px", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ width: "20%", padding: "16px 24px", textAlign: "center", color: "#475569", fontWeight: "600", fontSize: "14px", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCompanies.map((c, index) => (
                <tr 
                  key={`${c.id}-${index}`}
                  style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 2px 4px rgba(37,99,235,0.2)' }}>
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <strong style={{ color: '#1e293b', fontSize: '15px' }}>{c.name}</strong>
                          {c.subscription_period_end && new Date(c.subscription_period_end) < new Date() && (
                            <span style={{ padding: "2px 6px", borderRadius: 4, fontSize: 10, fontWeight: 700, background: "#fee2e2", color: "#ef4444", border: "1px solid #fecaca", textTransform: "uppercase" }}>Expired</span>
                          )}
                          {c.billing_action_stopped && (
                            <span style={{ padding: "2px 6px", borderRadius: 4, fontSize: 10, fontWeight: 700, background: "#fef3c7", color: "#d97706", border: "1px solid #fde68a", textTransform: "uppercase" }}>Blocked</span>
                          )}
                        </div>
                        {c.company_code && (
                          <span style={{ display: "block", fontSize: 13, marginTop: 4, color: '#64748b' }}>{c.company_code}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "16px", textAlign: "center", fontSize: "15px", fontWeight: "600", color: '#475569' }}>
                    {c.employee_count ?? 0}
                  </td>
                  <td style={{ padding: "16px", color: '#475569' }}>
                    <span style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '500' }}>
                      {(() => {
                        const planName = c.pricing_plan_name;
                        const planPrice = c.pricing_plan_price || c.pricing_plan_price_monthly;
                        if (planName) return `${planName} - ₹${parseFloat(planPrice || 0).toLocaleString("en-IN")}/mo`;
                        const planId = c.pricing_plan ?? c.pricing_plan_id ?? null;
                        if (planId && pricingPlans && pricingPlans.length > 0) {
                          const planObj = pricingPlans.find((p) => Number(p.id) === Number(planId));
                          if (planObj) return `${planObj.name} - ₹${parseFloat(planObj.monthly_price || 0).toLocaleString('en-IN')}/mo`;
                        }
                        return PLAN_LABELS[c.plan] ?? c.plan ?? "—";
                      })()}
                    </span>
                  </td>
                  <td style={{ padding: "16px" }}>
                    {c.is_active ? (
                      <span style={{ background: "#f0fdf4", color: "#16a34a", padding: "6px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }}></span> Active
                      </span>
                    ) : (
                      <span style={{ background: "#fef2f2", color: "#dc2626", padding: "6px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#dc2626' }}></span> Suspended
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "16px 24px", textAlign: "center" }}>
                    <button
                      type="button"
                      onClick={(e) => toggleMenu(c.id, e.currentTarget)}
                      style={{ padding: "8px", fontSize: 18, lineHeight: 1, borderRadius: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', transition: 'all 0.2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
                    >
                      ⋮
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedCompanies.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "48px 24px" }}>
                    <div style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '8px' }}>No companies found.</div>
                    <div style={{ color: '#cbd5e1', fontSize: '14px' }}>Click "Create Company" to add one.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {companies.length > 0 && (
          <div className="attendance-pagination-container" style={{ margin: 0, borderTop: '1px solid #e2e8f0', borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
            <div className="pagination-left">
              <span>Show</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="items-per-page-select"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>entries per page</span>
            </div>

            <div className="pagination-right">
              <button
                className="page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </button>
              <div className="page-number-group" style={{ display: 'flex', gap: '4px' }}>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, idx) => {
                  const start = Math.max(1, currentPage - 2);
                  return start + idx <= totalPages ? start + idx : null;
                }).filter(Boolean).map((pg) => (
                  <button
                    key={pg}
                    className={`page-btn ${pg === currentPage ? "active" : ""}`}
                    onClick={() => setCurrentPage(pg)}
                  >
                    {pg}
                  </button>
                ))}
              </div>
              <span className="page-summary">Page {currentPage} of {totalPages}</span>
              <button
                className="page-btn"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {activeCompany && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 10 }}
            onClick={() => setOpenMenuId(null)}
            aria-hidden
          />
          <div
            className="card"
            style={{
              position: "fixed",
              top: menuPosition.top,
              left: menuPosition.left,
              width: 220,
              maxHeight: "min(70vh, 460px)",
              zIndex: 9999,
              overflowY: "auto",
              padding: 8,
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            }}
          >
            <button
              type="button"
              className="btn"
              style={{ display: "block", width: "100%", textAlign: "left", marginBottom: 4 }}
              onClick={() => goToDetails(activeCompany.id)}
            >
              View Details
            </button>
            <button
              type="button"
              className="btn"
              style={{ display: "block", width: "100%", textAlign: "left", marginBottom: 4 }}
              onClick={() => openEdit(activeCompany)}
            >
              Edit
            </button>

            <Link
              to={`/super-admin/companies/${activeCompany.id}/employees`}
              style={{ display: "block", padding: "8px 12px", marginBottom: 4, borderRadius: 8 }}
              onClick={() => setOpenMenuId(null)}
            >
              View Employees
            </Link>
            <Link
              to={`/super-admin/companies/${activeCompany.id}/payroll`}
              style={{ display: "block", padding: "8px 12px", marginBottom: 4, borderRadius: 8 }}
              onClick={() => setOpenMenuId(null)}
            >
              View Payroll
            </Link>
            <Link
              to={`/super-admin/billing?assign=${activeCompany.id}`}
              style={{ display: "block", padding: "8px 12px", marginBottom: 4, borderRadius: 8 }}
              onClick={() => setOpenMenuId(null)}
            >
              Assign Plan
            </Link>
            {activeCompany.billing_action_stopped ? (
              <button
                type="button"
                className="btn"
                style={{ display: "block", width: "100%", textAlign: "left", marginBottom: 4, color: "#166534", fontWeight: "600" }}
                onClick={() => openMarkPaidModal(activeCompany)}
              >
                Mark as Paid
              </button>
            ) : (
              activeCompany.subscription_period_end && new Date(activeCompany.subscription_period_end) < new Date() && (
                <button
                  type="button"
                  className="btn"
                  style={{ display: "block", width: "100%", textAlign: "left", marginBottom: 4, color: "#d97706", fontWeight: "600" }}
                  onClick={() => handleStopActions(activeCompany.id)}
                >
                  Stop Actions
                </button>
              )
            )}
            {activeCompany.is_active ? (
              <button
                type="button"
                className="btn"
                style={{ display: "block", width: "100%", textAlign: "left", marginBottom: 4, color: "#b45309" }}
                onClick={() => handleSuspend(activeCompany.id)}
              >
                Suspend
              </button>
            ) : (
              <button
                type="button"
                className="btn primary"
                style={{ display: "block", width: "100%", textAlign: "left", marginBottom: 4 }}
                onClick={() => handleActivate(activeCompany.id)}
              >
                Activate
              </button>
            )}
            <button
              type="button"
              className="btn danger"
              style={{ display: "block", width: "100%", textAlign: "left" }}
              onClick={() => handleHardDelete(activeCompany.id, activeCompany.name)}
            >
              Delete
            </button>
          </div>
        </>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(720px, 95vw)",
              maxWidth: "95vw",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h3>{editing ? "Edit company" : "Create company"}</h3>
            <div style={{display: 'flex', gap: '8px', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #e2e8f0'}}>
              <div style={{flex: 1, padding: '8px', textAlign: 'center', background: currentStep === 1 ? '#eff6ff' : 'transparent', color: currentStep === 1 ? '#1d4ed8' : '#64748b', borderRadius: '8px', fontWeight: currentStep === 1 ? '600' : '400'}}>Step 1: Company Details</div>
              <div style={{flex: 1, padding: '8px', textAlign: 'center', background: currentStep === 2 ? '#eff6ff' : 'transparent', color: currentStep === 2 ? '#1d4ed8' : '#64748b', borderRadius: '8px', fontWeight: currentStep === 2 ? '600' : '400'}}>Step 2: Admin Details</div>
            </div>
            <form onSubmit={(e) => {
              if (currentStep === 2) {
                handleSubmit(e);
              } else {
                e.preventDefault();
                setCurrentStep(prev => prev + 1);
              }
            }}>
              {currentStep === 1 && (
                <>
                  <label>Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                  <label>Company code * (unique)</label>
                  <input
                    value={form.company_code}
                    onChange={(e) =>
                      setForm({ ...form, company_code: e.target.value.toUpperCase() })
                    }
                    required
                    disabled={!!editing}
                  />
                  <label>Domain</label>
                  <input
                    value={form.domain}
                    onChange={(e) => setForm({ ...form, domain: e.target.value })}
                    placeholder="Optional, e.g. abc.hrms.com"
                  />
                  <label>Plan</label>
                  <select
                    value={form.pricing_plan}
                    onChange={(e) => setForm({ ...form, pricing_plan: e.target.value })}
                  >
                    <option value="">— No plan —</option>
                    {pricingPlans.filter((p) => p.is_active).map((p) => (
                      <option key={p.id} value={p.id}>{p.name} – ₹{p.monthly_price}/mo</option>
                    ))}
                  </select>

                  {(() => {
                    const selectedPlan = pricingPlans.find((p) => Number(p.id) === Number(form.pricing_plan));
                    if (!selectedPlan) return null;

                    const normalized = normalizeCompanyModules(selectedPlan.features_json);
                    const activeModules = ORIGINAL_MODULES_SCHEMA.filter((m) => normalized[m.key]?.enabled === true);

                    return (
                      <div style={{
                        marginTop: "16px",
                        marginBottom: "16px",
                        padding: "16px",
                        borderRadius: "12px",
                        background: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        boxShadow: "0 4px 12px rgba(22,101,52,0.04)"
                      }}>
                        <h4 style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: "750", color: "#166534", display: "flex", alignItems: "center", gap: "6px" }}>
                          <span>📦</span> Plan Features Preview: {selectedPlan.name}
                        </h4>
                        {selectedPlan.description && (
                          <p style={{ margin: "0 0 12px 0", fontSize: "12px", color: "#1b5e20", fontStyle: "italic" }}>
                            {selectedPlan.description}
                          </p>
                        )}

                        {activeModules.length === 0 ? (
                          <p style={{ margin: 0, fontSize: "12px", color: "#166534" }}>No modules included in this plan.</p>
                        ) : (
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px", marginTop: "10px" }}>
                            {activeModules.map((m) => (
                              <div
                                key={m.key}
                                style={{
                                  background: "#ffffff",
                                  padding: "10px",
                                  borderRadius: "8px",
                                  border: "1px solid #dcfce7",
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "4px"
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                  <span>{m.icon}</span>
                                  <strong style={{ fontSize: "13px", color: "#14532d" }}>{m.label}</strong>
                                </div>
                                {m.pages && m.pages.filter(p => normalized[m.key]?.pages?.[p.key] === true).length > 0 && (
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "4px" }}>
                                    {m.pages
                                      .filter(p => normalized[m.key]?.pages?.[p.key] === true)
                                      .map(p => (
                                        <span
                                          key={p.key}
                                          style={{
                                            fontSize: "9px",
                                            fontWeight: "700",
                                            background: "#dcfce7",
                                            color: "#166534",
                                            padding: "2px 6px",
                                            borderRadius: "4px"
                                          }}
                                        >
                                          {p.label}
                                        </span>
                                      ))
                                    }
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  <label>Subscription start date</label>
                  <input
                    type="date"
                    value={form.subscription_period_start}
                    onChange={(e) => setForm({ ...form, subscription_period_start: e.target.value })}
                  />
                  <label>Subscription period end</label>
                  <input
                    type="date"
                    value={form.subscription_period_end}
                    onChange={(e) => setForm({ ...form, subscription_period_end: e.target.value })}
                  />
                  <label>Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                  <label>Phone</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                  <label>Address</label>
                  <textarea
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />

                  {/* GST & Billing Details */}
                  <div style={{ 
                    marginTop: "20px", 
                    marginBottom: "20px",
                    padding: "20px", 
                    borderRadius: "12px", 
                    background: "#f8fafc", 
                    border: "1px solid #e2e8f0" 
                  }}>
                    <h4 style={{ 
                      margin: "0 0 16px 0", 
                      fontSize: "14px", 
                      fontWeight: "700", 
                      color: "#1e293b", 
                      borderBottom: "1px solid #cbd5e1", 
                      paddingBottom: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}>
                      <span>💼</span> GST & Billing Details
                    </h4>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>GSTIN</label>
                        <input
                          value={form.gstin}
                          onChange={(e) => setForm({ ...form, gstin: e.target.value.toUpperCase() })}
                          placeholder="e.g. 22AAAAA0000A1Z5"
                          style={{ margin: 0 }}
                        />
                      </div>
                      
                      <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>State</label>
                        <input
                          value={form.state}
                          onChange={(e) => setForm({ ...form, state: e.target.value })}
                          placeholder="e.g. Maharashtra"
                          style={{ margin: 0 }}
                        />
                      </div>

                      <div style={{ gridColumn: "span 2" }}>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>State Code</label>
                        <input
                          value={form.state_code}
                          onChange={(e) => setForm({ ...form, state_code: e.target.value })}
                          placeholder="e.g. 27"
                          style={{ margin: 0 }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div style={{ 
                    marginBottom: "20px",
                    padding: "20px", 
                    borderRadius: "12px", 
                    background: "#f8fafc", 
                    border: "1px solid #e2e8f0" 
                  }}>
                    <h4 style={{ 
                      margin: "0 0 16px 0", 
                      fontSize: "14px", 
                      fontWeight: "700", 
                      color: "#1e293b", 
                      borderBottom: "1px solid #cbd5e1", 
                      paddingBottom: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}>
                      <span>🏦</span> Bank Details (for Receipts)
                    </h4>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div style={{ gridColumn: "span 2" }}>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>A/c (Bank Account No)</label>
                        <input
                          value={form.bank_account_no}
                          onChange={(e) => setForm({ ...form, bank_account_no: e.target.value })}
                          placeholder="e.g. 918020012345678"
                          style={{ margin: 0 }}
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>IFSC Code</label>
                        <input
                          value={form.bank_ifsc}
                          onChange={(e) => setForm({ ...form, bank_ifsc: e.target.value.toUpperCase() })}
                          placeholder="e.g. UTIB0000123"
                          style={{ margin: 0 }}
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Bank Branch</label>
                        <input
                          value={form.bank_branch}
                          onChange={(e) => setForm({ ...form, bank_branch: e.target.value })}
                          placeholder="e.g. Mumbai Main Branch"
                          style={{ margin: 0 }}
                        />
                      </div>
                    </div>
                  </div>
                  {editing && (
                    <>
                      <label>
                        <input
                          type="checkbox"
                          checked={form.is_active}
                          onChange={(e) =>
                            setForm({ ...form, is_active: e.target.checked })
                          }
                        />{" "}
                        Active
                      </label>
                    </>
                  )}
                </>
              )}
              
              {currentStep === 2 && (
                <>
                  <h4 style={{ marginBottom: 8 }}>Company Admin</h4>
                  <p className="muted-text" style={{ marginTop: 0 }}>
                    {editing ? "Update the company admin details below. If no admin exists, one will be created." : "Create the first company admin now. A temporary password will be emailed automatically."}
                  </p>
                  <label>Admin first name</label>
                  <input
                    value={form.admin_first_name}
                    onChange={(e) => setForm({ ...form, admin_first_name: e.target.value })}
                    placeholder="First name"
                  />
                  <label>Admin last name</label>
                  <input
                    value={form.admin_last_name}
                    onChange={(e) => setForm({ ...form, admin_last_name: e.target.value })}
                    placeholder="Last name"
                  />
                  <label>Admin email *</label>
                  <input
                    type="email"
                    value={form.admin_email}
                    onChange={(e) => setForm({ ...form, admin_email: e.target.value })}
                    placeholder="admin@company.com"
                    required
                  />
                </>
              )}
              <div className="modal-actions" style={{marginTop: '24px', display: 'flex', justifyContent: 'space-between', width: '100%'}}>
                <div>
                  {currentStep > 1 && (
                    <button type="button" className="btn" onClick={() => setCurrentStep(prev => prev - 1)}>
                      ← Back
                    </button>
                  )}
                </div>
                <div style={{display: 'flex', gap: '12px'}}>
                  <button type="button" className="btn-cancel" onClick={() => setModalOpen(false)}>Cancel</button>
                  {currentStep === 2 ? (
                    <button type="button" className="btn primary" onClick={handleSubmit}>Save</button>
                  ) : (
                    <button type="submit" className="btn primary">
                      Next →
                    </button>
                  )}
                </div>
              </div>
            </form>

          </div>
        </div>
      )}

      {markPaidOpen && markPaidCompany && (
        <div className="modal-overlay" onClick={() => setMarkPaidOpen(false)}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(480px, 90vw)",
              padding: "24px",
              borderRadius: "16px",
              background: "#ffffff",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            }}
          >
            <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>
              Mark as Paid: {markPaidCompany.name}
            </h3>
            <p className="muted-text" style={{ fontSize: "14px", marginBottom: "20px" }}>
              Extend this company's subscription and restore user access.
            </p>
            <form onSubmit={handleMarkPaidSubmit}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "8px" }}>
                  Subscription Period End Date
                </label>
                <input
                  type="date"
                  value={markPaidDate}
                  onChange={(e) => setMarkPaidDate(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>
              <div className="modal-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button type="button" className="btn-cancel" onClick={() => setMarkPaidOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  ✓ Restore & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
}
