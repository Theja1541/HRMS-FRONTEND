import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import NotificationCenter from "./NotificationCenter";
import { useAuth } from "../../auth/AuthContext";
import { getCompanyBranding } from "../../api/companies";
import "../../styles/layout.css";

/**
 * Shared layout for Admin and SuperAdmin. Same CSS (layout.css, sidebar.css).
 * sidebarVariant: "admin" | "superadmin" to switch menu.
 */
export default function Layout({ sidebarVariant = "admin" }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth() || {};
  const navigate = useNavigate();
  const location = useLocation();
  const [lockoutActive, setLockoutActive] = useState(false);

  useEffect(() => {
    if (!user || user.role === "SUPER_ADMIN") {
      setLockoutActive(false);
      return;
    }

    getCompanyBranding()
      .then((res) => {
        if (res.data?.billing_action_stopped) {
          setLockoutActive(true);
        } else {
          setLockoutActive(false);
        }
      })
      .catch(() => {});
  }, [user, location.pathname]);

  // Formatted Role helper
  const getRoleLabel = (role) => {
    if (role === "SUPER_ADMIN") return "Super Admin";
    if (role === "ADMIN") return "Admin";
    if (role === "HR") return "HR Manager";
    if (role === "EMPLOYEE") return "Employee";
    return role || "User";
  };

  // Initials helper
  const getInitials = (name) => {
    if (!name) return "U";
    return name.slice(0, 2).toUpperCase();
  };

  const isExemptPage =
    location.pathname === "/support" ||
    (location.pathname === "/settings" && new URLSearchParams(location.search).get("tab") === "subscription-plan");

  return (
    <div className="layout-root">
      <button
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        variant={sidebarVariant}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="layout-main">
        {/* Sleek top bar with notification bell and profile badge */}
        <div className="layout-topbar" style={{ display: "flex", gap: 16 }}>
          <NotificationCenter />
          {user && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#ffffff",
              padding: "4px 12px 4px 4px",
              borderRadius: "9999px",
              border: "1.5px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
            }}>
              <div style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: user.role === "SUPER_ADMIN" ? "#6366f1" : "#0284c7",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "700",
                fontSize: "12px"
              }}>
                {getInitials(user.username || user.email)}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "12.5px", fontWeight: "600", color: "#0f172a", lineHeight: 1.1 }}>
                  {user.username || user.email?.split("@")[0]}
                </span>
                <span style={{ fontSize: "10.5px", fontWeight: "500", color: "#64748b" }}>
                  {getRoleLabel(user.role)}
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="layout-content">
          {lockoutActive && !isExemptPage ? (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "calc(100vh - 120px)",
              background: "rgba(255, 251, 235, 0.45)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              borderRadius: "16px",
              border: "1px solid rgba(253, 230, 138, 0.6)",
              padding: "48px 32px",
              textAlign: "center",
              boxShadow: "0 10px 40px -10px rgba(217, 119, 6, 0.12)",
              margin: "24px",
            }}>
              <div style={{ maxWidth: "480px" }}>
                <div style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  background: "#fef3c7",
                  border: "2px solid #fde68a",
                  color: "#d97706",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "32px",
                  margin: "0 auto 20px auto",
                  boxShadow: "0 4px 12px rgba(217, 119, 6, 0.15)",
                }}>
                  ⚠️
                </div>
                <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#78350f", marginBottom: "12px", letterSpacing: "-0.5px" }}>
                  Subscription Expired
                </h2>
                <p style={{ fontSize: "15px", color: "#92400e", lineHeight: "1.6", marginBottom: "28px", fontWeight: "500" }}>
                  Your company's subscription has expired and actions have been suspended. Please renew your plan or contact support to restore access.
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => navigate("/settings?tab=subscription-plan")}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "8px",
                      background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
                      color: "#ffffff",
                      fontWeight: "600",
                      fontSize: "14px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(217, 119, 6, 0.3)",
                      cursor: "pointer",
                      transition: "transform 0.15s, box-shadow 0.15s"
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "0 6px 16px rgba(217, 119, 6, 0.4)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(217, 119, 6, 0.3)";
                    }}
                  >
                    💳 View Billing Plan
                  </button>
                  <button
                    onClick={() => navigate("/support")}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "8px",
                      background: "#ffffff",
                      color: "#78350f",
                      fontWeight: "600",
                      fontSize: "14px",
                      border: "1.5px solid #fde68a",
                      cursor: "pointer",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                      transition: "background 0.15s"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = "#fffbeb"}
                    onMouseOut={(e) => e.currentTarget.style.background = "#ffffff"}
                  >
                    💬 Contact Support
                  </button>
                  <button
                    onClick={logout}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "8px",
                      background: "#fee2e2",
                      color: "#991b1b",
                      fontWeight: "600",
                      fontSize: "14px",
                      border: "none",
                      cursor: "pointer",
                      transition: "background 0.15s"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = "#fecaca"}
                    onMouseOut={(e) => e.currentTarget.style.background = "#fee2e2"}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </main>
    </div>
  );
}
