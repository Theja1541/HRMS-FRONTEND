import React, { useState } from "react";
import PricingCard from "./PricingCard";
import SubscriptionTable from "./SubscriptionTable";

export default function UpgradePlanModal({ isOpen, onClose, plans, currentPlanSlug, onSelectPlan, loadingPlanId }) {
  const [isYearly, setIsYearly] = useState(false);
  const [showMatrix, setShowMatrix] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        padding: "20px",
        overflowY: "auto",
      }}
    >
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "24px",
          width: "100%",
          maxWidth: "1100px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "36px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          border: "1px solid #e2e8f0",
          position: "relative",
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: "24px",
            right: "24px",
            background: "#f1f5f9",
            border: "none",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontWeight: "bold",
            color: "#64748b",
            fontSize: "16px",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#e2e8f0"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#f1f5f9"; }}
        >
          ✕
        </button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: "0 0 8px 0" }}>
            🚀 Upgrade Your Subscription Plan
          </h2>
          <p style={{ fontSize: "15px", color: "#64748b", margin: 0 }}>
            Unlock advanced modules, scale employee counts, and streamline workflows.
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

        {/* Pricing Cards Grid */}
        {!showMatrix ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
              alignItems: "stretch",
            }}
          >
            {plans.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                isYearly={isYearly}
                currentPlanSlug={currentPlanSlug}
                onSelect={(selectedPlan) => onSelectPlan(selectedPlan, isYearly ? "yearly" : "monthly")}
                loadingPlanId={loadingPlanId}
              />
            ))}
          </div>
        ) : (
          <SubscriptionTable plans={plans} isYearly={isYearly} />
        )}

        {/* Matrix comparison toggle button */}
        <div style={{ textAlign: "center", marginTop: "36px" }}>
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
    </div>
  );
}
