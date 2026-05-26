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
  const itemsPerPage = 5;
  const [form, setForm] = useState({
    name: "",
    company_code: "",
    domain: "",
    email: "",
    phone: "",
    address: "",
    plan: "BASIC",
    is_active: true,
    pricing_plan: "",
    subscription_period_start: new Date().toISOString().slice(0,10),
    subscription_period_end: "",
    admin_first_name: "",
    admin_last_name: "",
    admin_email: "",
    enabled_modules: {
      attendance: true,
      leave: true,
      payroll: true,
      assets: true,
      support: true,
      notifications: true,
      billing: true,
      daybook: true,
      holidays: true,
    },
  });


  const [currentStep, setCurrentStep] = useState(1);
  const [editFeaturesOpen, setEditFeaturesOpen] = useState(false);
  const [editFeaturesCompany, setEditFeaturesCompany] = useState(null);
  const [editingFeatures, setEditingFeatures] = useState({});

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


  const handleSaveFeatures = async (e) => {
    e.preventDefault();
    if (!editFeaturesCompany) return;
    try {
      await updateCompany(editFeaturesCompany.id, {
        enabled_modules: editingFeatures
      });
      alert("Features updated successfully");
      setEditFeaturesOpen(false);
      fetchCompanies();
    } catch(err) {
      alert("Failed to update features");
    }
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
              pricing_plan_price: p.price_monthly || p.price,
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
      plan: "BASIC",
      is_active: true,
      pricing_plan: "",
      subscription_period_start: new Date().toISOString().slice(0,10),
      subscription_period_end: "",
      admin_first_name: "",
      admin_last_name: "",
      admin_email: "",
      enabled_modules: {
        attendance: true,
        leave: true,
        payroll: true,
        assets: true,
        support: true,
        notifications: true,
        billing: true,
        daybook: true,
        holidays: true,
      },
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
      plan: c.plan || "BASIC",
      is_active: c.is_active !== false,
      pricing_plan: c.pricing_plan ?? "",
      subscription_period_start: c.subscription_period_start ? c.subscription_period_start.slice(0,10) : new Date().toISOString().slice(0,10),
      subscription_period_end: c.subscription_period_end ? c.subscription_period_end.slice(0, 10) : "",
      admin_first_name: "",
      admin_last_name: "",
      admin_email: "",
      enabled_modules: {
        attendance: true,
        leave: true,
        payroll: true,
        assets: true,
        support: true,
        notifications: true,
        billing: true,
        daybook: true,
        holidays: true,
      },
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
        delete payload.admin_first_name;
        delete payload.admin_last_name;
        delete payload.admin_email;
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
              pricing_plan_price: planObj ? (planObj.price_monthly || planObj.price) : c.pricing_plan_price,
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
    <div>
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
                        if (c.pricing_plan_name) return `${c.pricing_plan_name} - ₹${parseFloat(c.pricing_plan_price || 0).toLocaleString("en-IN")}/mo`;
                        const planId = c.pricing_plan ?? c.pricing_plan_id ?? null;
                        if (planId && pricingPlans && pricingPlans.length > 0) {
                          const plan = pricingPlans.find((p) => Number(p.id) === Number(planId));
                          if (plan) return `${plan.name} - ₹${parseFloat(plan.price_monthly || plan.price || 0).toLocaleString('en-IN')}/mo`;
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
          <div className="pagination" style={{ 
            marginTop: 0, 
            padding: '16px 24px', 
            background: '#f8fafc', 
            borderTop: '1px solid #e2e8f0',
            borderBottomLeftRadius: '16px',
            borderBottomRightRadius: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span className="page-summary" style={{ color: '#64748b', fontSize: '14px', fontWeight: '500', margin: 0 }}>
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, companies.length)} of {companies.length} companies
            </span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: currentPage === 1 ? '#f1f5f9' : '#fff', color: currentPage === 1 ? '#94a3b8' : '#334155', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontWeight: '500', fontSize: '14px', transition: 'all 0.2s' }}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                onMouseEnter={(e) => { if (currentPage !== 1) { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; } }}
                onMouseLeave={(e) => { if (currentPage !== 1) { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e2e8f0'; } }}
              >
                Previous
              </button>
              
              <div style={{ display: 'flex', gap: '4px' }}>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, idx) => {
                  const start = Math.max(1, currentPage - 2);
                  return start + idx <= totalPages ? start + idx : null;
                }).filter(Boolean).map((pg) => (
                  <button
                    key={pg}
                    style={{ width: '36px', height: '36px', borderRadius: '8px', border: pg === currentPage ? 'none' : '1px solid #e2e8f0', background: pg === currentPage ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : '#fff', color: pg === currentPage ? '#fff' : '#334155', cursor: 'pointer', fontWeight: pg === currentPage ? '600' : '500', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: pg === currentPage ? '0 2px 4px rgba(37,99,235,0.2)' : 'none', transition: 'all 0.2s' }}
                    onClick={() => setCurrentPage(pg)}
                    onMouseEnter={(e) => { if (pg !== currentPage) { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; } }}
                    onMouseLeave={(e) => { if (pg !== currentPage) { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e2e8f0'; } }}
                  >
                    {pg}
                  </button>
                ))}
              </div>

              <button
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: currentPage >= totalPages ? '#f1f5f9' : '#fff', color: currentPage >= totalPages ? '#94a3b8' : '#334155', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer', fontWeight: '500', fontSize: '14px', transition: 'all 0.2s' }}
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                onMouseEnter={(e) => { if (currentPage < totalPages) { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; } }}
                onMouseLeave={(e) => { if (currentPage < totalPages) { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e2e8f0'; } }}
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
            <button
              type="button"
              className="btn"
              style={{ display: "block", width: "100%", textAlign: "left", marginBottom: 4 }}
              onClick={() => {
                setOpenMenuId(null);
                setEditFeaturesCompany(activeCompany);
                setEditingFeatures(activeCompany.enabled_modules || {
                  attendance: true, leave: true, payroll: true, assets: true,
                  support: true, notifications: true, billing: true, daybook: true, holidays: true
                });
                setEditFeaturesOpen(true);
              }}
            >
              Edit Features
            </button>
            <Link
              to={`/super-admin/create-user?company_id=${activeCompany.id}`}
              style={{ display: "block", padding: "8px 12px", marginBottom: 4, borderRadius: 8 }}
              onClick={() => setOpenMenuId(null)}
            >
              Create Admin for this company
            </Link>
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
              <div style={{flex: 1, padding: '8px', textAlign: 'center', background: currentStep === 1 ? '#eff6ff' : 'transparent', color: currentStep === 1 ? '#1d4ed8' : '#64748b', borderRadius: '8px', fontWeight: currentStep === 1 ? '600' : '400'}}>Step 1: Company</div>
              {!editing && <div style={{flex: 1, padding: '8px', textAlign: 'center', background: currentStep === 2 ? '#eff6ff' : 'transparent', color: currentStep === 2 ? '#1d4ed8' : '#64748b', borderRadius: '8px', fontWeight: currentStep === 2 ? '600' : '400'}}>Step 2: Admin</div>}
              <div style={{flex: 1, padding: '8px', textAlign: 'center', background: currentStep === 3 ? '#eff6ff' : 'transparent', color: currentStep === 3 ? '#1d4ed8' : '#64748b', borderRadius: '8px', fontWeight: currentStep === 3 ? '600' : '400'}}>Step {editing ? '2' : '3'}: Features</div>
            </div>
            <form onSubmit={(e) => {
              if ((currentStep === 3 && !editing) || (currentStep === 2 && editing)) {
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
                      <option key={p.id} value={p.id}>{p.name} – ₹{p.price_monthly}/mo</option>
                    ))}
                  </select>
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
              
              {currentStep === 2 && !editing && (
                <>
                  <h4 style={{ marginBottom: 8 }}>Company Admin</h4>
                  <p className="muted-text" style={{ marginTop: 0 }}>
                    Create the first company admin now. A temporary password will be emailed automatically.
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

              {((currentStep === 3 && !editing) || (currentStep === 2 && editing)) && (
                <>
                  <h4 style={{ marginBottom: 8 }}>Enabled Modules</h4>
                  <p className="muted-text" style={{ marginTop: 0, marginBottom: 16 }}>
                    Select which modules this company has access to.
                  </p>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                    {['attendance', 'leave', 'payroll', 'assets', 'support', 'notifications', 'billing', 'daybook', 'holidays'].map(mod => (
                      <label key={mod} style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0}}>
                        <input
                          type="checkbox"
                          checked={!!form.enabled_modules[mod]}
                          onChange={(e) => setForm({...form, enabled_modules: {...form.enabled_modules, [mod]: e.target.checked}})}
                          style={{width: 'auto', margin: 0}}
                        />
                        <span style={{textTransform: 'capitalize', fontWeight: '500', fontSize: '14px'}}>{mod}</span>
                      </label>
                    ))}
                  </div>
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
                  {((currentStep === 3 && !editing) || (currentStep === 2 && editing)) ? (
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

      {editFeaturesOpen && editFeaturesCompany && (
        <div className="modal-overlay" onClick={() => setEditFeaturesOpen(false)}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(480px, 90vw)",
              padding: "24px",
              borderRadius: "16px",
            }}
          >
            <h3>Edit Features: {editFeaturesCompany.name}</h3>
            <form onSubmit={handleSaveFeatures}>
              <div style={{display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px'}}>
                {['attendance', 'leave', 'payroll', 'assets', 'support', 'notifications', 'billing', 'daybook', 'holidays'].map(mod => (
                  <label key={mod} style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0}}>
                    <input
                      type="checkbox"
                      checked={!!editingFeatures[mod]}
                      onChange={(e) => setEditingFeatures({...editingFeatures, [mod]: e.target.checked})}
                      style={{width: 'auto', margin: 0}}
                    />
                    <span style={{textTransform: 'capitalize', fontWeight: '500', fontSize: '14px'}}>{mod}</span>
                  </label>
                ))}
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn primary">Save Features</button>
                <button type="button" className="btn-cancel" onClick={() => setEditFeaturesOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
