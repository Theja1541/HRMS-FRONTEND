import React from "react";
import { formatINR } from "../../services/subscriptionService";

export default function PricingCard({ plan, isYearly, currentPlanSlug, onSelect, loadingPlanId }) {
  const price = isYearly ? plan.yearly_price : plan.monthly_price;
  const cycleText = isYearly ? "/ year" : "/ month";
  
  // Calculate discount if yearly
  const monthlyEquivalent = Number(plan.monthly_price);
  const yearlyEquivalent = Number(plan.yearly_price);
  const discountPercent = Math.round(((monthlyEquivalent * 12 - yearlyEquivalent) / (monthlyEquivalent * 12)) * 100);

  const isCurrentPlan = currentPlanSlug === plan.slug;
  const isEnterprise = plan.slug === "enterprise";
  const isProfessional = plan.slug === "professional";
  const isLoading = loadingPlanId === plan.id;

  // Curated harmonious styling cards
  const getCardStyle = () => {
    if (isEnterprise) {
      return {
        background: "linear-gradient(135deg, #1e1b4b 0%, #311042 100%)",
        color: "#ffffff",
        border: "2px solid #86198f",
        boxShadow: "0 10px 25px -5px rgba(134, 25, 143, 0.4)",
      };
    }
    if (isProfessional) {
      return {
        background: "#ffffff",
        border: "2px solid #2563eb",
        boxShadow: "0 10px 30px -10px rgba(37, 99, 235, 0.25)",
        transform: "scale(1.03)",
        position: "relative",
      };
    }
    return {
      background: "#ffffff",
      border: "1px solid #e2e8f0",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
    };
  };

  const getFeaturesList = () => {
    const defaultLabels = {
      attendance: "Attendance Tracking & Shifts",
      leave: "Leave Request & Balance",
      holidays: "Holiday Calendars",
      notifications: "Platform Broadcast Emails",
      payroll: "Payslip Generation & EPF/ESI",
      support: "Helpdesk Ticketing Support",
      daybook: "Day Book Double-Entry Finance",
      assets: "Inventory & Assets Assignment",
      billing: "Billing Dashboard & Invoices",
    };

    const modulePagesMap = {
      attendance: {
        attendance: "Attendance Log",
        monthly: "Monthly Report"
      },
      leave: {
        dashboard: "Dashboard",
        approvals: "Leave Approvals",
        rejected: "Rejected History",
        "leave-calendar": "Leave Calendar",
        "leave-settings": "Leave Settings"
      },
      payroll: {
        payroll: "Generate Payslip",
        "payroll-summary": "Payroll Summary",
        "salary-payment-summary": "Payment Summary",
        "email-dashboard": "Email Dashboard"
      },
      assets: {
        dashboard: "Dashboard",
        categories: "Categories",
        assets: "Manage Assets",
        assign: "Assign Assets",
        returns: "Returns",
        maintenance: "Maintenance",
        history: "History"
      },
      daybook: {
        dashboard: "Finance Dashboard",
        transactions: "Transactions Log",
        vendors: "Manage Vendors",
        categories: "Category Setup",
        reports: "Financial Reports"
      },
      holidays: {
        view: "Holidays List"
      },
      notifications: {
        view: "Send Notifications"
      },
      support: {
        view: "Support Tickets"
      },
      billing: {
        view: "Billing & Plans"
      }
    };

    let featuresObj = plan.features_json;
    if (typeof featuresObj === "string") {
      try {
        featuresObj = JSON.parse(featuresObj);
      } catch (e) {
        featuresObj = {};
      }
    }
    featuresObj = featuresObj || {};

    const featuresList = [];

    Object.keys(defaultLabels).forEach((key) => {
      const val = featuresObj[key];
      let isActive = false;
      let activePages = [];
      let inactivePages = [];

      if (val === true) {
        isActive = true;
      } else if (typeof val === "object" && val !== null) {
        isActive = val.enabled === true;
        // Collect active / inactive subpages
        const pagesConfig = val.pages || {};
        const pagesMap = modulePagesMap[key] || {};
        
        Object.keys(pagesMap).forEach((pk) => {
          const isPageActive = pagesConfig[pk] !== false;
          if (isPageActive) {
            activePages.push(pagesMap[pk]);
          } else {
            inactivePages.push(pagesMap[pk]);
          }
        });
      }

      featuresList.push({
        key,
        name: defaultLabels[key],
        active: isActive,
        activePages,
        inactivePages
      });
    });

    return featuresList;
  };

  return (
    <div
      className="pricing-card-wrapper"
      style={{
        borderRadius: "20px",
        padding: "32px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        height: "100%",
        minHeight: "450px",
        cursor: "pointer",
        ...getCardStyle(),
      }}
      onMouseEnter={(e) => {
        if (!isProfessional && !isEnterprise) {
          e.currentTarget.style.transform = "translateY(-6px)";
          e.currentTarget.style.boxShadow = "0 10px 20px -5px rgba(0, 0, 0, 0.1)";
        } else if (isProfessional) {
          e.currentTarget.style.transform = "scale(1.05) translateY(-4px)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isProfessional && !isEnterprise) {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.05)";
        } else if (isProfessional) {
          e.currentTarget.style.transform = "scale(1.03)";
        }
      }}
    >
      {/* Popular Badge */}
      {isProfessional && (
        <span
          style={{
            position: "absolute",
            top: "-14px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            color: "white",
            padding: "4px 16px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: "700",
            letterSpacing: "0.5px",
            boxShadow: "0 4px 6px rgba(37,99,235,0.3)",
          }}
        >
          RECOMMENDED PLAN
        </span>
      )}

      {/* Header Info */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3
            style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: "800",
              color: isEnterprise ? "#fdf4ff" : "#1e293b",
            }}
          >
            {plan.name}
          </h3>
          {isYearly && discountPercent > 0 && (
            <span
              style={{
                fontSize: "11px",
                fontWeight: "700",
                background: isEnterprise ? "#fef08a" : "#dcfce7",
                color: isEnterprise ? "#854d0e" : "#15803d",
                padding: "2px 8px",
                borderRadius: "12px",
              }}
            >
              SAVE {discountPercent}%
            </span>
          )}
        </div>

        <p
          style={{
            fontSize: "13px",
            color: isEnterprise ? "#cbd5e1" : "#64748b",
            lineHeight: "1.5",
            marginBottom: "24px",
          }}
        >
          {plan.description}
        </p>

        {/* Pricing Display */}
        <div style={{ display: "flex", alignItems: "baseline", marginBottom: "28px" }}>
          <span
            style={{
              fontSize: "36px",
              fontWeight: "900",
              color: isEnterprise ? "#ffffff" : "#0f172a",
              letterSpacing: "-1px",
            }}
          >
            {formatINR(price)}
          </span>
          <span
            style={{
              fontSize: "14px",
              color: isEnterprise ? "#94a3b8" : "#64748b",
              marginLeft: "4px",
              fontWeight: "500",
            }}
          >
            {cycleText}
          </span>
        </div>

        {/* Employee Quota */}
        <div
          style={{
            fontSize: "13px",
            fontWeight: "600",
            color: isEnterprise ? "#e9d5ff" : "#4f46e5",
            background: isEnterprise ? "rgba(168,85,247,0.15)" : "#f5f3ff",
            padding: "8px 12px",
            borderRadius: "10px",
            marginBottom: "24px",
            display: "inline-block",
          }}
        >
          👤 Limit: {plan.employee_limit ? `${plan.employee_limit} Employees max` : "Unlimited Staff"}
        </div>

        {/* Divider */}
        <hr
          style={{
            border: 0,
            borderTop: isEnterprise ? "1px solid rgba(255,255,255,0.1)" : "1px solid #f1f5f9",
            margin: "0 0 24px 0",
          }}
        />

        {/* Features Checklist */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {getFeaturesList().map((feat, idx) => (
            <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <span
                  style={{
                    color: feat.active ? (isEnterprise ? "#c084fc" : "#2563eb") : "#94a3b8",
                    fontWeight: "bold",
                    fontSize: "14px",
                    lineHeight: "1",
                  }}
                >
                  {feat.active ? "✓" : "⊘"}
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    color: feat.active ? (isEnterprise ? "#e2e8f0" : "#334155") : "#94a3b8",
                    textDecoration: feat.active ? "none" : "line-through",
                    opacity: feat.active ? 1 : 0.6,
                    fontWeight: feat.active ? "600" : "normal",
                  }}
                >
                  {feat.name}
                </span>
              </div>
              
              {/* Show active pages under the module in a beautiful, compact nested display */}
              {feat.active && feat.activePages && feat.activePages.length > 0 && (
                <div style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "4px",
                  paddingLeft: "24px",
                  marginTop: "2px"
                }}>
                  {feat.activePages.map((pg, pidx) => (
                    <span
                      key={pidx}
                      style={{
                        fontSize: "10px",
                        fontWeight: "600",
                        background: isEnterprise ? "rgba(192, 132, 252, 0.15)" : "rgba(37, 99, 235, 0.08)",
                        color: isEnterprise ? "#e9d5ff" : "#2563eb",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        border: isEnterprise ? "1px solid rgba(192, 132, 252, 0.2)" : "1px solid rgba(37, 99, 235, 0.1)"
                      }}
                    >
                      {pg}
                    </span>
                  ))}
                  {feat.inactivePages && feat.inactivePages.length > 0 && (
                    feat.inactivePages.map((pg, pidx) => (
                      <span
                        key={`in-${pidx}`}
                        style={{
                          fontSize: "10px",
                          fontWeight: "500",
                          background: "transparent",
                          color: "#94a3b8",
                          padding: "1px 5px",
                          borderRadius: "4px",
                          border: "1px dashed #cbd5e1",
                          textDecoration: "line-through",
                          opacity: 0.6
                        }}
                      >
                        {pg}
                      </span>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        disabled={isCurrentPlan || isLoading}
        onClick={() => onSelect(plan)}
        style={{
          width: "100%",
          padding: "12px 24px",
          borderRadius: "12px",
          fontWeight: "700",
          fontSize: "14px",
          cursor: isCurrentPlan ? "default" : "pointer",
          transition: "all 0.2s ease",
          marginTop: "32px",
          border: "none",
          outline: "none",
          background: isCurrentPlan
            ? (isEnterprise ? "rgba(255,255,255,0.15)" : "#e2e8f0")
            : (isEnterprise
                ? "linear-gradient(135deg, #c084fc 0%, #a855f7 100%)"
                : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"),
          color: isCurrentPlan
            ? (isEnterprise ? "#cbd5e1" : "#64748b")
            : "#ffffff",
          boxShadow: isCurrentPlan ? "none" : (isEnterprise ? "0 4px 10px rgba(168,85,247,0.3)" : "0 4px 10px rgba(37,99,235,0.2)"),
        }}
        onMouseEnter={(e) => {
          if (!isCurrentPlan && !isLoading) {
            e.currentTarget.style.opacity = "0.9";
          }
        }}
        onMouseLeave={(e) => {
          if (!isCurrentPlan && !isLoading) {
            e.currentTarget.style.opacity = "1";
          }
        }}
      >
        {isLoading ? "Processing Order..." : isCurrentPlan ? "YOUR CURRENT PLAN" : isEnterprise ? "GO ENTERPRISE" : "UPGRADE NOW"}
      </button>
    </div>
  );
}
