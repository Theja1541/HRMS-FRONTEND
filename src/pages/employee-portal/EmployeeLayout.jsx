import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../auth/AuthContext";
import EmployeeSidebar from "./EmployeeSidebar";
import NotificationCenter from "../../components/common/NotificationCenter";
import { getCompanyBranding } from "../../api/companies";
import "../../styles/employeeLayout.css";

export default function EmployeeLayout() {
  const { user, logout } = useAuth();
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

  const isExemptPage = location.pathname === "/employee/settings";

  return (
    <div className="employee-layout">

      {/* SIDEBAR */}
      <EmployeeSidebar lockoutActive={lockoutActive} />

      {/* MAIN CONTENT */}
      <div className="employee-body">

        {/* HEADER */}
        <header className="employee-header">

          <div className="employee-header-left">
            <span className="employee-role">{user?.role}</span>
          </div>

          <div className="employee-header-right" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* 🔔 Notification Bell — same component used in Admin portal */}
            <NotificationCenter />

            <span className="employee-user">{user?.username}</span>

            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </div>

        </header>

        {/* PAGE CONTENT */}
        <main className="employee-main">
          <div className="employee-content">
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
                    Your company's subscription has expired and actions have been suspended. Please contact your company administrator to restore access.
                  </p>
                  <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
                    <button
                      onClick={() => navigate("/employee/settings")}
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
                      ⚙️ View Settings
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
    </div>
  );
}