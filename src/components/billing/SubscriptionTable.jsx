import React from "react";
import { formatINR } from "../../services/subscriptionService";

export default function SubscriptionTable({ plans, isYearly }) {
  const getPrice = (plan) => {
    return isYearly ? plan.yearly_price : plan.monthly_price;
  };

  const getCycle = () => {
    return isYearly ? "/yr" : "/mo";
  };

  const comparisonRows = [
    { name: "Attendance & Shifts", moduleKey: "attendance" },
    { name: "Leave Management", moduleKey: "leave" },
    { name: "Platform Broadcast Notifications", moduleKey: "notifications" },
    { name: "Holiday Calendars", moduleKey: "holidays" },
    { name: "SaaS Billing Dashboard", moduleKey: "billing" },
    { name: "Payroll Generating & E-payslips", moduleKey: "payroll" },
    { name: "Support Helpdesk Tickets", moduleKey: "support" },
    { name: "Asset Assignment Inventory", moduleKey: "assets" },
    { name: "Day Book Double-Entry Bookkeeping", moduleKey: "daybook" },
  ];

  return (
    <div className="table-wrapper" style={{ marginTop: "32px", overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.02)" }}>
      <table className="table" style={{ width: "100%", borderCollapse: "collapse", margin: 0 }}>
        <thead>
          <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
            <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "14px", fontWeight: "700", color: "#1e293b", width: "30%" }}>Feature comparison</th>
            {plans.map((p) => {
              const isProf = p.slug === "professional";
              const isEnt = p.slug === "enterprise";
              return (
                <th
                  key={p.id}
                  style={{
                    padding: "16px 24px",
                    textAlign: "center",
                    fontSize: "14px",
                    fontWeight: "700",
                    color: isProf ? "#2563eb" : (isEnt ? "#86198f" : "#1e293b"),
                    background: isProf ? "rgba(37,99,235,0.02)" : "none",
                  }}
                >
                  {p.name}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {/* Price Header Row */}
          <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
            <td style={{ padding: "20px 24px", fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>Rate Plan Price</td>
            {plans.map((p) => {
              const price = getPrice(p);
              const isProf = p.slug === "professional";
              const isEnt = p.slug === "enterprise";
              return (
                <td
                  key={p.id}
                  style={{
                    padding: "20px 24px",
                    textAlign: "center",
                    fontWeight: "800",
                    fontSize: "16px",
                    color: isProf ? "#2563eb" : (isEnt ? "#86198f" : "#334155"),
                    background: isProf ? "rgba(37,99,235,0.02)" : "none",
                  }}
                >
                  {formatINR(price)}
                  <span style={{ fontSize: "11px", fontWeight: "500", color: "#64748b" }}>{getCycle()}</span>
                </td>
              );
            })}
          </tr>

          {/* Employee Limit Row */}
          <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
            <td style={{ padding: "14px 24px", fontSize: "13px", fontWeight: "500", color: "#475569" }}>Max Employees Quota</td>
            {plans.map((p) => {
              const isProf = p.slug === "professional";
              return (
                <td
                  key={p.id}
                  style={{
                    padding: "14px 24px",
                    textAlign: "center",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#475569",
                    background: isProf ? "rgba(37,99,235,0.02)" : "none",
                  }}
                >
                  {p.employee_limit ? `Up to ${p.employee_limit}` : "Unlimited"}
                </td>
              );
            })}
          </tr>

          {/* Feature Matrix Rows */}
          {comparisonRows.map((row, idx) => (
            <tr
              key={row.moduleKey}
              style={{
                borderBottom: idx === comparisonRows.length - 1 ? "none" : "1px solid #e2e8f0",
                background: idx % 2 === 1 ? "#fafafa" : "#ffffff",
              }}
            >
              <td style={{ padding: "14px 24px", fontSize: "13px", fontWeight: "500", color: "#475569" }}>
                <div>{row.name}</div>
                {plans.some(p => {
                  let fObj = p.features_json;
                  if (typeof fObj === "string") {
                    try { fObj = JSON.parse(fObj); } catch { fObj = {}; }
                  }
                  fObj = fObj || {};
                  const val = fObj[row.moduleKey];
                  return typeof val === "object" && val !== null && val.pages;
                }) && (
                  <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px", paddingLeft: "4px" }}>
                    {(() => {
                      const pagesMap = {
                        attendance: ["attendance", "monthly"],
                        leave: ["dashboard", "approvals", "rejected", "leave-calendar", "leave-settings"],
                        payroll: ["payroll", "payroll-summary", "salary-payment-summary", "email-dashboard"],
                        assets: ["dashboard", "categories", "assets", "assign", "returns", "maintenance", "history"],
                        daybook: ["dashboard", "transactions", "vendors", "categories", "reports"],
                        holidays: ["view"],
                        notifications: ["view"],
                        support: ["view"],
                        billing: ["view"]
                      };
                      const subpageLabels = {
                        attendance: "Attendance Log",
                        monthly: "Monthly Report",
                        dashboard: "Dashboard",
                        approvals: "Approvals",
                        rejected: "Rejected",
                        "leave-calendar": "Calendar",
                        "leave-settings": "Settings",
                        payroll: "Generate Payslip",
                        "payroll-summary": "Payroll Summary",
                        "salary-payment-summary": "Payment Summary",
                        "email-dashboard": "Email Dashboard",
                        dashboard: "Dashboard",
                        categories: "Categories",
                        assets: "Manage Assets",
                        assign: "Assign Assets",
                        returns: "Returns",
                        maintenance: "Maintenance",
                        history: "History",
                        transactions: "Transactions Log",
                        vendors: "Manage Vendors",
                        categories: "Category Setup",
                        reports: "Financial Reports",
                        view: "Included Pages"
                      };
                      const pkeys = pagesMap[row.moduleKey] || [];
                      if (pkeys.length <= 1) return null;
                      return (
                        <span style={{ fontStyle: "italic" }}>
                          Indicated pages: {pkeys.map(pk => subpageLabels[pk] || pk).join(", ")}
                        </span>
                      );
                    })()}
                  </div>
                )}
              </td>
              {plans.map((p) => {
                let featuresObj = p.features_json;
                if (typeof featuresObj === "string") {
                  try {
                    featuresObj = JSON.parse(featuresObj);
                  } catch (e) {
                    featuresObj = {};
                  }
                }
                featuresObj = featuresObj || {};

                const mVal = featuresObj[row.moduleKey];
                let isEnabled = false;
                let subpageDetails = null;

                if (mVal === true) {
                  isEnabled = true;
                } else if (typeof mVal === "object" && mVal !== null) {
                  isEnabled = mVal.enabled === true;

                  if (isEnabled && mVal.pages) {
                    const totalPages = Object.keys(mVal.pages).length;
                    const activePagesCount = Object.values(mVal.pages).filter(v => v === true).length;
                    if (activePagesCount < totalPages && activePagesCount > 0) {
                      subpageDetails = `${activePagesCount}/${totalPages} Pages`;
                    }
                  }
                }

                const isProf = p.slug === "professional";
                const isEnt = p.slug === "enterprise";

                let cellColor = "#94a3b8";
                let cellWeight = "400";
                if (isEnabled) {
                  if (isProf) {
                    cellColor = "#2563eb";
                    cellWeight = "700";
                  } else if (isEnt) {
                    cellColor = "#86198f";
                    cellWeight = "700";
                  } else {
                    cellColor = "#16a34a";
                    cellWeight = "600";
                  }
                }

                return (
                  <td
                    key={p.id}
                    style={{
                      padding: "14px 24px",
                      textAlign: "center",
                      fontSize: "13px",
                      color: cellColor,
                      fontWeight: cellWeight,
                      background: isProf ? "rgba(37,99,235,0.02)" : "none",
                    }}
                  >
                    {isEnabled ? (
                      <div>
                        <div>✓ Included</div>
                        {subpageDetails && (
                          <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px", fontWeight: "600" }}>
                            ({subpageDetails})
                          </div>
                        )}
                      </div>
                    ) : "—"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
