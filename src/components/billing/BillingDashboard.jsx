import React, { useState, useEffect } from "react";
import { getSubscriptionPlans, getPaymentHistory } from "../../api/paymentApi";
import { fetchActiveSubscription, formatINR } from "../../services/subscriptionService";
import { initiatePlanSubscription } from "../../services/paymentService";
import PricingCard from "./PricingCard";
import SubscriptionTable from "./SubscriptionTable";
import PaymentSuccess from "./PaymentSuccess";
import PaymentFailure from "./PaymentFailure";
import InvoiceDownload from "./InvoiceDownload";

export default function BillingDashboard() {
  const [subStatus, setSubStatus] = useState(null);
  const [plans, setPlans] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Checkout flow states
  const [checkoutState, setCheckoutState] = useState("idle"); // idle, success, failure
  const [checkoutError, setCheckoutError] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedCycle, setSelectedCycle] = useState("monthly");
  const [successData, setSuccessData] = useState(null);
  const [loadingPlanId, setLoadingPlanId] = useState(null);
  
  const [isYearly, setIsYearly] = useState(false);
  const [showMatrix, setShowMatrix] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subRes, plansRes, historyRes] = await Promise.all([
        fetchActiveSubscription(),
        getSubscriptionPlans(),
        getPaymentHistory(historyPage, 5),
      ]);

      setSubStatus(subRes);
      setPlans(plansRes.data || []);
      setHistory(historyRes.data?.results || []);
      setHistoryTotalPages(historyRes.data?.total_pages || 1);
      
      if (subRes && subRes.billing_cycle) {
        setIsYearly(subRes.billing_cycle === "yearly");
      }
    } catch (error) {
      console.error("Failed to load billing dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [historyPage]);

  // Handle plan purchase / upgrade
  const handleSelectPlan = (plan, cycle) => {
    setSelectedPlan(plan);
    setSelectedCycle(cycle);
    setLoadingPlanId(plan.id);

    initiatePlanSubscription(
      plan,
      cycle,
      (successResult) => {
        // Payment success callback
        setSuccessData(successResult);
        setCheckoutState("success");
        setLoadingPlanId(null);
        loadData(); // Reload active subscription details
      },
      (errorMsg) => {
        // Payment failed or dismissed callback
        setCheckoutError(errorMsg);
        setCheckoutState("failure");
        setLoadingPlanId(null);
      }
    );
  };

  const handleRetryPayment = () => {
    if (selectedPlan && selectedCycle) {
      setCheckoutState("idle");
      handleSelectPlan(selectedPlan, selectedCycle);
    }
  };

  const handleCloseCheckoutFlow = () => {
    setCheckoutState("idle");
    setSuccessData(null);
    setCheckoutError("");
  };

  if (loading && !subStatus) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center" }}>
        <p className="muted-text" style={{ fontSize: "15px", fontWeight: "600" }}>🔄 Loading subscription billing details...</p>
      </div>
    );
  }

  // Render Success Landing View
  if (checkoutState === "success" && successData) {
    return (
      <PaymentSuccess
        subscription={successData.subscription}
        invoiceNumber={successData.invoice_number}
        amountPaid={successData.subscription?.plan_details?.yearly_price ? (selectedCycle === "yearly" ? successData.subscription.plan_details.yearly_price * 118 : successData.subscription.plan_details.monthly_price * 118) : 0}
        onClose={handleCloseCheckoutFlow}
      />
    );
  }

  // Render Failure Landing View
  if (checkoutState === "failure") {
    return (
      <PaymentFailure
        errorMessage={checkoutError}
        onRetry={handleRetryPayment}
        onClose={handleCloseCheckoutFlow}
      />
    );
  }

  const isExpired = subStatus?.expired;
  const expiryWarning = subStatus?.expiry_warning;

  return (
    <div className="billing-dashboard-wrap" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* 1. Subscription Header Alert Lockout banner if warning or expired */}
      {isExpired ? (
        <div
          style={{
            background: "linear-gradient(135deg, #f87171 0%, #dc2626 100%)",
            color: "white",
            padding: "16px 24px",
            borderRadius: "16px",
            boxShadow: "0 10px 15px -3px rgba(220, 38, 38, 0.3)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <strong style={{ fontSize: "15px", display: "block", marginBottom: "2px" }}>⊘ Subscription Expired &amp; Account Locked</strong>
            <span style={{ fontSize: "13px", opacity: 0.9 }}>Your enterprise HRMS subscription expired on {subStatus?.end_date}. Renew immediately to lift locks on your employees database.</span>
          </div>
          <button
            type="button"
            className="btn"
            onClick={() => {
              document.getElementById("pricing-plans-section")?.scrollIntoView({ behavior: "smooth" });
            }}
            style={{ background: "white", color: "#dc2626", border: "none", fontWeight: "700", fontSize: "13px", padding: "8px 18px", borderRadius: "10px" }}
          >
            Renew Now
          </button>
        </div>
      ) : expiryWarning ? (
        <div
          style={{
            background: "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)",
            color: "white",
            padding: "16px 24px",
            borderRadius: "16px",
            boxShadow: "0 10px 15px -3px rgba(217, 119, 6, 0.2)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <strong style={{ fontSize: "15px", display: "block", marginBottom: "2px" }}>⚠️ Expiry Warning: Subscription ending soon</strong>
            <span style={{ fontSize: "13px", opacity: 0.9 }}>Your HRMS subscription expires in {subStatus?.days_remaining} days on {subStatus?.end_date}. Extend now to guarantee staff access.</span>
          </div>
          <button
            type="button"
            className="btn"
            onClick={() => {
              document.getElementById("pricing-plans-section")?.scrollIntoView({ behavior: "smooth" });
            }}
            style={{ background: "white", color: "#d97706", border: "none", fontWeight: "700", fontSize: "13px", padding: "8px 18px", borderRadius: "10px" }}
          >
            Renew Now
          </button>
        </div>
      ) : null}

      {/* 2. Current active subscription panel */}
      <div className="settings-card subscription-panel" style={{ 
        margin: 0, 
        background: "#ffffff", 
        borderRadius: "24px", 
        border: "1px solid rgba(255, 255, 255, 0.4)",
        boxShadow: "0 10px 40px -10px rgba(0,0,0,0.08)",
        overflow: "hidden"
      }}>
        <div className="subscription-gradient-header" style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          padding: "32px 36px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "16px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
        }}>
          <div className="sub-header-details">
            <span className="sub-badge-pill" style={{
              background: "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))",
              color: "#60a5fa",
              border: "1px solid rgba(96, 165, 250, 0.2)",
              fontSize: "12px",
              fontWeight: "700",
              padding: "6px 14px",
              borderRadius: "24px",
              letterSpacing: "0.5px",
              display: "inline-block",
              marginBottom: "12px",
              textTransform: "uppercase"
            }}>
              Active Subscription
            </span>
            <h3 style={{ margin: 0, color: "white", fontSize: "28px", fontWeight: "800", letterSpacing: "-0.02em" }}>
              {subStatus?.plan_name || "Enterprise Tier"}
            </h3>
            <p className="sub-tagline" style={{ margin: "6px 0 0 0", color: "#94a3b8", fontSize: "15px", fontWeight: "500" }}>
              Enterprise: {subStatus?.company_name || "Company"}
            </p>
          </div>
          <div className="sub-status-pill-wrap" style={{ marginTop: "4px" }}>
            <span
              className={`sub-status-badge ${isExpired ? "expired" : "active"}`}
              style={{
                padding: "8px 20px",
                borderRadius: "24px",
                fontSize: "14px",
                fontWeight: "700",
                background: isExpired ? "rgba(220, 38, 38, 0.15)" : "rgba(22, 163, 74, 0.15)",
                color: isExpired ? "#ef4444" : "#4ade80",
                border: isExpired ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(74, 222, 128, 0.3)",
                display: "inline-block",
                boxShadow: isExpired ? "0 4px 12px rgba(220,38,38,0.2)" : "0 4px 12px rgba(22,163,74,0.2)",
              }}
            >
              {isExpired ? "⊘ Expired" : "✓ Active"}
            </span>
          </div>
        </div>

        <div style={{ padding: "36px" }}>
          {/* Dynamic Details Stats */}
          <div className="subscription-details-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "32px" }}>
            <div className="sub-detail-tile" style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "24px", borderRadius: "16px", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)" }}>
              <span className="tile-label" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#64748b", fontWeight: "700", textTransform: "uppercase", marginBottom: "8px" }}>
                <span style={{ fontSize: "16px" }}>👥</span> Staff Limit
              </span>
              <strong className="tile-value" style={{ fontSize: "20px", color: "#0f172a", fontWeight: "800", letterSpacing: "-0.01em" }}>
                {subStatus?.employee_limit ? `${subStatus.employee_limit} employees` : "Unlimited"}
              </strong>
            </div>

            <div className="sub-detail-tile" style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "24px", borderRadius: "16px", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)" }}>
              <span className="tile-label" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#64748b", fontWeight: "700", textTransform: "uppercase", marginBottom: "8px" }}>
                <span style={{ fontSize: "16px" }}>⏱️</span> Billing Cycle
              </span>
              <strong className="tile-value" style={{ fontSize: "20px", color: "#0f172a", fontWeight: "800", textTransform: "capitalize", letterSpacing: "-0.01em" }}>
                {subStatus?.billing_cycle || "N/A"}
              </strong>
            </div>

            <div className="sub-detail-tile" style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "24px", borderRadius: "16px", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)" }}>
              <span className="tile-label" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#64748b", fontWeight: "700", textTransform: "uppercase", marginBottom: "8px" }}>
                <span style={{ fontSize: "16px" }}>⏳</span> Days Remaining
              </span>
              <strong className="tile-value" style={{ fontSize: "20px", color: isExpired ? "#dc2626" : (expiryWarning ? "#d97706" : "#16a34a"), fontWeight: "800", letterSpacing: "-0.01em" }}>
                {isExpired ? "0 Days" : `${subStatus?.days_remaining || 0} Days`}
              </strong>
            </div>

            <div className="sub-detail-tile" style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "24px", borderRadius: "16px", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)" }}>
              <span className="tile-label" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#64748b", fontWeight: "700", textTransform: "uppercase", marginBottom: "8px" }}>
                <span style={{ fontSize: "16px" }}>📅</span> Renewal Date
              </span>
              <strong className="tile-value" style={{ fontSize: "20px", color: "#0f172a", fontWeight: "800", letterSpacing: "-0.01em" }}>
                {subStatus?.end_date ? new Date(subStatus.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
              </strong>
            </div>
          </div>

          {/* Control upgrade CTA button */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "flex-end", paddingTop: "24px", borderTop: "1px solid #e2e8f0" }}>
            <button
              type="button"
              className="btn primary"
              onClick={() => {
                document.getElementById("pricing-plans-section")?.scrollIntoView({ behavior: "smooth" });
              }}
              style={{ 
                fontWeight: "700", 
                fontSize: "14px", 
                padding: "12px 28px", 
                borderRadius: "12px",
                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
                border: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <span style={{ fontSize: "18px" }}>🚀</span> Upgrade Plan or Renew
            </button>
          </div>
        </div>
      </div>

      {/* Available Subscription Plans Section */}
      <div 
        id="pricing-plans-section" 
        className="card" 
        style={{ 
          padding: "36px", 
          borderRadius: "24px", 
          border: "1px solid #e2e8f0", 
          boxShadow: "0 10px 40px -10px rgba(0,0,0,0.04)",
          background: "#ffffff"
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <span style={{
            background: "linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(29, 78, 216, 0.1))",
            color: "#2563eb",
            fontSize: "12px",
            fontWeight: "700",
            padding: "6px 14px",
            borderRadius: "24px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            display: "inline-block",
            marginBottom: "12px"
          }}>
            Subscription Plans
          </span>
          <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: "0 0 8px 0" }}>
            🚀 Explore Our Subscription Plans
          </h2>
          <p style={{ fontSize: "15px", color: "#64748b", margin: 0, maxWidth: "600px", marginLeft: "auto", marginRight: "auto" }}>
            Scale up your employee limits, unlock advanced modules, and supercharge your HR operations seamlessly.
          </p>

          {/* Billing Cycle Toggle */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "#f1f5f9",
              padding: "4px",
              borderRadius: "30px",
              marginTop: "24px",
              border: "1px solid #e2e8f0",
            }}
          >
            <button
              type="button"
              onClick={() => setIsYearly(false)}
              style={{
                padding: "8px 20px",
                borderRadius: "20px",
                border: "none",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                background: !isYearly ? "#ffffff" : "transparent",
                color: !isYearly ? "#2563eb" : "#475569",
                boxShadow: !isYearly ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
                transition: "all 0.2s",
              }}
            >
              Billed Monthly
            </button>
            <button
              type="button"
              onClick={() => setIsYearly(true)}
              style={{
                padding: "8px 20px",
                borderRadius: "20px",
                border: "none",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                background: isYearly ? "#ffffff" : "transparent",
                color: isYearly ? "#2563eb" : "#475569",
                boxShadow: isYearly ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
                transition: "all 0.2s",
              }}
            >
              Billed Annually
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid or Comparison Matrix */}
        {!showMatrix ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
              alignItems: "stretch",
            }}
          >
            {plans.filter(plan => plan.is_active).map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                isYearly={isYearly}
                currentPlanSlug={subStatus?.plan_slug}
                onSelect={(selectedPlan) => handleSelectPlan(selectedPlan, isYearly ? "yearly" : "monthly")}
                loadingPlanId={loadingPlanId}
              />
            ))}
          </div>
        ) : (
          <SubscriptionTable plans={plans.filter(p => p.is_active)} isYearly={isYearly} />
        )}

        {/* Comparison Matrix Toggle Button */}
        <div style={{ textAlign: "center", marginTop: "36px", borderTop: "1px solid #f1f5f9", paddingTop: "24px" }}>
          <button
            type="button"
            className="btn"
            onClick={() => setShowMatrix(!showMatrix)}
            style={{
              background: "#f8fafc",
              border: "1px solid #cbd5e1",
              color: "#334155",
              fontWeight: "600",
              fontSize: "13px",
              padding: "10px 24px",
              borderRadius: "30px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5f9"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#f8fafc"; }}
          >
            {showMatrix ? "← Return to Pricing Cards" : "Compare All Features Side-by-Side →"}
          </button>
        </div>
      </div>

      {/* 3. Paginated Transactions Log History */}
      <div className="card" style={{ padding: "36px", borderRadius: "24px", border: "1px solid #e2e8f0", boxShadow: "0 10px 40px -10px rgba(0,0,0,0.04)" }}>
        <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: "0 0 6px 0", letterSpacing: "-0.01em" }}>
          🧾 Subscription Payment History
        </h3>
        <p className="muted-text" style={{ fontSize: "14px", margin: "0 0 24px 0", color: "#64748b" }}>
          View all payment receipts and download GST invoices for your accounting records.
        </p>

        {history.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center", border: "1px dashed #cbd5e1", borderRadius: "12px" }}>
            <p className="muted-text" style={{ margin: 0 }}>No payments recorded yet.</p>
          </div>
        ) : (
          <div className="table-wrapper" style={{ margin: "0 -24px -24px -24px" }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: "20%" }}>Order Reference</th>
                  <th style={{ width: "25%" }}>Subscription Plan</th>
                  <th style={{ width: "15%" }}>Amount</th>
                  <th style={{ width: "15%" }}>Status</th>
                  <th style={{ width: "15%" }}>Paid On</th>
                  <th style={{ width: "10%", textAlign: "center" }}>GST Invoice</th>
                </tr>
              </thead>
              <tbody>
                {history.map((tx) => (
                  <tr key={tx.id}>
                    <td>
                      <code style={{ fontSize: "12px", background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>
                        {tx.razorpay_order_id}
                      </code>
                    </td>
                    <td><strong>{tx.plan_name || "Enterprise Tier"}</strong></td>
                    <td style={{ fontWeight: "600" }}>{formatINR(tx.total_amount)}</td>
                    <td>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: "600",
                          background: tx.payment_status === "completed" ? "#dcfce7" : tx.payment_status === "failed" ? "#fee2e2" : "#fef3c7",
                          color: tx.payment_status === "completed" ? "#15803d" : tx.payment_status === "failed" ? "#b91c1c" : "#b45309",
                          textTransform: "capitalize",
                          display: "inline-block",
                        }}
                      >
                        {tx.payment_status}
                      </span>
                    </td>
                    <td>{tx.paid_at ? new Date(tx.paid_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}</td>
                    <td style={{ textAlign: "center" }}>
                      <InvoiceDownload url={tx.invoice_download_url} invoiceNumber={tx.invoice_number} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {historyTotalPages > 1 && (
              <div
                className="pagination"
                style={{
                  padding: "12px 24px",
                  background: "#f8fafc",
                  borderTop: "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                  alignItems: "center",
                }}
              >
                <button
                  type="button"
                  className="btn"
                  disabled={historyPage === 1}
                  onClick={() => setHistoryPage(historyPage - 1)}
                  style={{ padding: "6px 12px", fontSize: "12px" }}
                >
                  Previous
                </button>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>
                  Page {historyPage} of {historyTotalPages}
                </span>
                <button
                  type="button"
                  className="btn"
                  disabled={historyPage === historyTotalPages}
                  onClick={() => setHistoryPage(historyPage + 1)}
                  style={{ padding: "6px 12px", fontSize: "12px" }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
