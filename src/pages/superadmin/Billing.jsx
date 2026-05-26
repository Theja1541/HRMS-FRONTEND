import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getPricingPlans,
  createPricingPlan,
  updatePricingPlan,
  deletePricingPlan,
  getPayments,
  createPayment,
  getInvoices,
  createInvoice,
  getSubscriptionAlerts,
  assignPlanToCompany,
} from "../../api/billing";
import { getCompanies } from "../../api/companies";
import "../../styles/pages.css";
import "../../styles/modal.css";

const TABS = ["Plans", "Payments", "Invoices", "Subscription Alerts"];

const formatCurrency = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

export default function Billing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState("Plans");
  const [plans, setPlans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [planModal, setPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planForm, setPlanForm] = useState({
    name: "",
    code: "",
    description: "",
    price_monthly: "",
    currency: "INR",
    max_employees: "",
    is_active: true,
  });
  const [assignModal, setAssignModal] = useState(false);
  const [assignCompanyId, setAssignCompanyId] = useState(null);
  const [assignForm, setAssignForm] = useState({ pricing_plan_id: "", subscription_period_start: new Date().toISOString().slice(0,10), subscription_period_end: "" });
  const [paymentModal, setPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    company: "",
    pricing_plan: "",
    amount: "",
    status: "COMPLETED",
    payment_date: new Date().toISOString().slice(0, 10),
    reference: "",
  });
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    company: "",
    invoice_number: "",
    amount: "",
    issued_at: new Date().toISOString().slice(0, 10),
    due_date: "",
    status: "SENT",
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
          code: plan.code,
          description: plan.description || "",
          price_monthly: String(plan.price_monthly),
          currency: plan.currency || "INR",
          max_employees: plan.max_employees != null ? String(plan.max_employees) : "",
          is_active: plan.is_active !== false,
        }
        : {
          name: "",
          code: "",
          description: "",
          price_monthly: "",
          currency: "INR",
          max_employees: "",
          is_active: true,
        }
    );
    setPlanModal(true);
  };

  const savePlan = async (e) => {
    e.preventDefault();
    const payload = {
      name: planForm.name,
      code: planForm.code.toUpperCase().replace(/\s/g, "_"),
      description: planForm.description,
      price_monthly: parseFloat(planForm.price_monthly) || 0,
      currency: planForm.currency,
      max_employees: planForm.max_employees ? parseInt(planForm.max_employees, 10) : null,
      is_active: planForm.is_active,
    };
    try {
      if (editingPlan) await updatePricingPlan(editingPlan.id, payload);
      else await createPricingPlan(payload);
      setPlanModal(false);
      loadPlans();
    } catch (err) {
      alert(err.response?.data?.code?.[0] || err.response?.data?.name?.[0] || "Failed to save plan");
    }
  };

  const deletePlan = async (id) => {
    if (!window.confirm("Delete this plan?")) return;
    try {
      await deletePricingPlan(id);
      loadPlans();
    } catch {
      alert("Failed to delete plan");
    }
  };

  const openAssignModal = (companyId) => {
    setAssignCompanyId(companyId);
    setAssignForm({ pricing_plan_id: "", subscription_period_start: new Date().toISOString().slice(0,10), subscription_period_end: "" });
    setAssignModal(true);
  };

  const submitAssign = async (e) => {
    e.preventDefault();
    if (!assignCompanyId || !assignForm.pricing_plan_id) return;
    try {
      await assignPlanToCompany(assignCompanyId, {
        pricing_plan_id: parseInt(assignForm.pricing_plan_id, 10),
        subscription_period_start: assignForm.subscription_period_start || null,
        subscription_period_end: assignForm.subscription_period_end || null,
      });
      setAssignModal(false);
      loadAlerts();
      loadCompanies();
    } catch {
      alert("Failed to assign plan");
    }
  };

  const openPaymentModal = () => {
    setPaymentForm({
      company: "",
      pricing_plan: "",
      amount: "",
      status: "COMPLETED",
      payment_date: new Date().toISOString().slice(0, 10),
      reference: "",
    });
    setPaymentModal(true);
  };

  const submitPayment = async (e) => {
    e.preventDefault();
    try {
      await createPayment({
        company: parseInt(paymentForm.company, 10),
        pricing_plan: paymentForm.pricing_plan ? parseInt(paymentForm.pricing_plan, 10) : null,
        amount: parseFloat(paymentForm.amount) || 0,
        status: paymentForm.status,
        payment_date: paymentForm.payment_date || null,
        reference: paymentForm.reference,
      });
      setPaymentModal(false);
      loadPayments();
    } catch (err) {
      alert(err.response?.data?.company?.[0] || "Failed to create payment");
    }
  };

  const openInvoiceModal = () => {
    const nextNum = invoices.length + 1;
    setInvoiceForm({
      company: "",
      invoice_number: `INV-${new Date().getFullYear()}-${String(nextNum).padStart(4, "0")}`,
      amount: "",
      issued_at: new Date().toISOString().slice(0, 10),
      due_date: "",
      status: "SENT",
    });
    setInvoiceModal(true);
  };

  const submitInvoice = async (e) => {
    e.preventDefault();
    try {
      await createInvoice({
        company: parseInt(invoiceForm.company, 10),
        invoice_number: invoiceForm.invoice_number,
        amount: parseFloat(invoiceForm.amount) || 0,
        issued_at: invoiceForm.issued_at,
        due_date: invoiceForm.due_date || invoiceForm.issued_at,
        status: invoiceForm.status,
      });
      setInvoiceModal(false);
      loadInvoices();
    } catch (err) {
      alert(err.response?.data?.invoice_number?.[0] || "Failed to create invoice");
    }
  };

  if (loading && !plans.length) return <p>Loading billing...</p>;

  return (
    <div>
      <div className="page-hero" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 0 }}>
        <h2 style={{ margin: 0, color: "white" }}>💳 Subscription &amp; Billing</h2>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", marginTop: 20 }}>
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            className={tab === t ? "btn primary" : "btn"}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Plans" && (
        <div className="card" style={{ overflow: "visible" }}>
          <div style={{
            background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
            borderRadius: "12px 12px 0 0",
            margin: "-24px -24px 20px -24px",
            padding: "20px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <h3 style={{ margin: 0, color: "white", fontSize: 18, fontWeight: 700 }}>💰 Pricing Plans</h3>
              <p style={{ margin: "4px 0 0 0", color: "rgba(255,255,255,0.8)", fontSize: 13 }}>Manage subscription plans and pricing tiers</p>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button type="button" className="btn" onClick={() => loadPlans()} style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.3)" }}>
                🔄 Refresh
              </button>
              <button type="button" className="btn" onClick={() => openPlanModal()} style={{ background: "white", color: "#2563eb", border: "none", fontWeight: 600 }}>
                ➕ Create Plan
              </button>
            </div>
          </div>
          {plans.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <p className="muted-text" style={{ marginBottom: 12 }}>No pricing plans yet. Create one to get started.</p>
              <button type="button" className="btn primary" onClick={() => openPlanModal()}>Create First Plan</button>
            </div>
          ) : (
            <div className="table-wrapper" style={{ margin: "0 -24px -24px -24px" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: "25%" }}>Plan</th>
                    <th style={{ width: "18%" }}>Price</th>
                    <th style={{ width: "18%", textAlign: "center" }}>Max Employees</th>
                    <th style={{ width: "15%" }}>Status</th>
                    <th style={{ width: "24%", textAlign: "center" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <strong style={{ fontSize: "14px", color: "#0f172a" }}>{p.name}</strong>
                        {p.description && (
                          <span className="muted-text" style={{ display: "block", fontSize: 12, marginTop: 4 }}>
                            {p.description}
                          </span>
                        )}
                      </td>
                      <td style={{ fontWeight: "600", fontSize: "14px" }}>{formatCurrency(p.price_monthly)}/mo</td>
                      <td style={{ textAlign: "center" }}>
                        <span style={{ fontSize: "14px", fontWeight: "600" }}>
                          {p.max_employees == null ? "Unlimited" : p.max_employees}
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
            </div>
          )}
        </div>
      )}

      {tab === "Payments" && (
        <div className="card" style={{ overflow: "visible" }}>
          <div style={{
            background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
            borderRadius: "12px 12px 0 0",
            margin: "-24px -24px 20px -24px",
            padding: "20px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <h3 style={{ margin: 0, color: "white", fontSize: 18, fontWeight: 700 }}>💳 Payments</h3>
              <p style={{ margin: "4px 0 0 0", color: "rgba(255,255,255,0.8)", fontSize: 13 }}>Track all payment transactions</p>
            </div>
            <button type="button" className="btn" onClick={openPaymentModal} style={{ background: "white", color: "#2563eb", border: "none", fontWeight: 600 }}>
              ➕ Record Payment
            </button>
          </div>
          {payments.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <p className="muted-text">No payments recorded yet.</p>
            </div>
          ) : (
            <div className="table-wrapper" style={{ margin: "0 -24px -24px -24px" }}>
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
                      <td><strong>{p.company_name}</strong><span className="muted-text" style={{ display: "block", fontSize: 12, marginTop: 2 }}>({p.company_code})</span></td>
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
        <div className="card" style={{ overflow: "visible" }}>
          <div style={{
            background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
            borderRadius: "12px 12px 0 0",
            margin: "-24px -24px 20px -24px",
            padding: "20px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <h3 style={{ margin: 0, color: "white", fontSize: 18, fontWeight: 700 }}>🧾 Invoice History</h3>
              <p style={{ margin: "4px 0 0 0", color: "rgba(255,255,255,0.8)", fontSize: 13 }}>View and manage all invoices</p>
            </div>
            <button type="button" className="btn" onClick={openInvoiceModal} style={{ background: "white", color: "#2563eb", border: "none", fontWeight: 600 }}>
              ➕ Create Invoice
            </button>
          </div>
          {invoices.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <p className="muted-text">No invoices created yet.</p>
            </div>
          ) : (
            <div className="table-wrapper" style={{ margin: "0 -24px -24px -24px" }}>
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
                      <td><strong>{inv.company_name}</strong><span className="muted-text" style={{ display: "block", fontSize: 12, marginTop: 2 }}>({inv.company_code})</span></td>
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
        <div className="card">
          <h3 style={{ marginBottom: 12 }}>Subscription Expiry Alerts</h3>
          <p className="muted-text" style={{ marginBottom: 16 }}>
            Companies with subscription ending in the next 30 days or already expired.
          </p>
          {alerts.length === 0 ? (
            <p className="muted-text">No expiring or expired subscriptions.</p>
          ) : (
            <div className="table-wrapper" style={{ margin: "0 -24px -24px -24px" }}>
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
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <h3>{editingPlan ? "Edit Plan" : "Create Pricing Plan"}</h3>
            <form onSubmit={savePlan}>
              <label>Name *</label>
              <input value={planForm.name} onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} required />
              <label>Code * (e.g. BASIC, PROFESSIONAL)</label>
              <input value={planForm.code} onChange={(e) => setPlanForm({ ...planForm, code: e.target.value })} required disabled={!!editingPlan} />
              <label>Description</label>
              <input value={planForm.description} onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })} placeholder="e.g. Up to 50 employees" />
              <label>Price per month (INR) *</label>
              <input type="number" min="0" step="0.01" value={planForm.price_monthly} onChange={(e) => setPlanForm({ ...planForm, price_monthly: e.target.value })} required />
              <label>Max employees (leave empty for unlimited)</label>
              <input type="number" min="0" value={planForm.max_employees} onChange={(e) => setPlanForm({ ...planForm, max_employees: e.target.value })} placeholder="Unlimited" />
              <label><input type="checkbox" checked={planForm.is_active} onChange={(e) => setPlanForm({ ...planForm, is_active: e.target.checked })} /> Active</label>
              <div className="modal-actions">
                <button type="submit" className="btn primary">Save</button>
                <button type="button" className="btn-cancel" onClick={() => setPlanModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign plan modal */}
      {assignModal && assignCompanyId && (
        <div className="modal-overlay" onClick={() => setAssignModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <h3>Assign Plan to Company</h3>
            <form onSubmit={submitAssign}>
              <label>Pricing Plan *</label>
              <select value={assignForm.pricing_plan_id} onChange={(e) => setAssignForm({ ...assignForm, pricing_plan_id: e.target.value })} required>
                <option value="">Select plan</option>
                {plans.filter((p) => p.is_active).map((p) => (
                  <option key={p.id} value={p.id}>{p.name} – {formatCurrency(p.price_monthly)}/mo</option>
                ))}
              </select>
                <label>Subscription period start</label>
                <input type="date" value={assignForm.subscription_period_start} onChange={(e) => setAssignForm({ ...assignForm, subscription_period_start: e.target.value })} />
                <label>Subscription period end (optional)</label>
                <input type="date" value={assignForm.subscription_period_end} onChange={(e) => setAssignForm({ ...assignForm, subscription_period_end: e.target.value })} />
              <div className="modal-actions">
                <button type="submit" className="btn primary">Assign</button>
                <button type="button" className="btn-cancel" onClick={() => setAssignModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment modal */}
      {paymentModal && (
        <div className="modal-overlay" onClick={() => setPaymentModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <h3>Record Payment</h3>
            <form onSubmit={submitPayment}>
              <label>Company *</label>
              <select value={paymentForm.company} onChange={(e) => setPaymentForm({ ...paymentForm, company: e.target.value })} required>
                <option value="">Select company</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <label>Plan (optional)</label>
              <select value={paymentForm.pricing_plan} onChange={(e) => setPaymentForm({ ...paymentForm, pricing_plan: e.target.value })}>
                <option value="">—</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <label>Amount *</label>
              <input type="number" min="0" step="0.01" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} required />
              <label>Status</label>
              <select value={paymentForm.status} onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value })}>
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
              </select>
              <label>Payment date</label>
              <input type="date" value={paymentForm.payment_date} onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })} />
              <label>Reference</label>
              <input value={paymentForm.reference} onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })} placeholder="Transaction ID" />
              <div className="modal-actions">
                <button type="submit" className="btn primary">Save</button>
                <button type="button" className="btn-cancel" onClick={() => setPaymentModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice modal */}
      {invoiceModal && (
        <div className="modal-overlay" onClick={() => setInvoiceModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <h3>Create Invoice</h3>
            <form onSubmit={submitInvoice}>
              <label>Company *</label>
              <select value={invoiceForm.company} onChange={(e) => setInvoiceForm({ ...invoiceForm, company: e.target.value })} required>
                <option value="">Select company</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <label>Invoice number *</label>
              <input value={invoiceForm.invoice_number} onChange={(e) => setInvoiceForm({ ...invoiceForm, invoice_number: e.target.value })} required />
              <label>Amount *</label>
              <input type="number" min="0" step="0.01" value={invoiceForm.amount} onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })} required />
              <label>Issued date *</label>
              <input type="date" value={invoiceForm.issued_at} onChange={(e) => setInvoiceForm({ ...invoiceForm, issued_at: e.target.value })} required />
              <label>Due date</label>
              <input type="date" value={invoiceForm.due_date} onChange={(e) => setInvoiceForm({ ...invoiceForm, due_date: e.target.value })} />
              <label>Status</label>
              <select value={invoiceForm.status} onChange={(e) => setInvoiceForm({ ...invoiceForm, status: e.target.value })}>
                <option value="DRAFT">Draft</option>
                <option value="SENT">Sent</option>
                <option value="PAID">Paid</option>
              </select>
              <div className="modal-actions">
                <button type="submit" className="btn primary">Create</button>
                <button type="button" className="btn-cancel" onClick={() => setInvoiceModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
