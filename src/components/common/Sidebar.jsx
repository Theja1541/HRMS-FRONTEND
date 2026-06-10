import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import api from "../../api/axios";
import { getEffectiveSystemSettings } from "../../api/superadmin";
import {
  clearSidebarBrandingCache,
  fetchSidebarBranding,
  sidebarBrandingCacheKey,
} from "../../utils/sidebarBrandingCache";
import "../../styles/sidebar.css";

/**
 * Logo URLs from the API may be relative (/media/...). The app runs on Vite (e.g. :5173);
 * relative URLs would hit the wrong host, break loading, and trigger text fallback.
 */
function resolveBrandingLogoUrl(raw) {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;
  if (/^(https?:|data:)/i.test(s)) return s;
  if (s.startsWith("//") && typeof window !== "undefined") {
    return `${window.location.protocol}${s}`;
  }
  const base = (api.defaults?.baseURL || "").replace(/\/+$/, "");
  const origin = base.replace(/\/api\/?$/i, "") || (typeof window !== "undefined" ? window.location.origin : "");
  if (!origin) return s;
  if (s.startsWith("/")) return `${origin}${s}`;
  return `${origin}/${s}`;
}

export default function Sidebar({ variant = "admin", isOpen, onClose, lockoutActive = false }) {
  const [collapsed, setCollapsed] = useState(false);
  const [openLeaves, setOpenLeaves] = useState(false);
  const [openPayroll, setOpenPayroll] = useState(false);
  const [openAssets, setOpenAssets] = useState(false);
  const [openDaybook, setOpenDaybook] = useState(false);
  const [openSeparation, setOpenSeparation] = useState(false);
  const [openProjects, setOpenProjects] = useState(false);
  const [openAttendance, setOpenAttendance] = useState(false);

  const getBlockedStyle = (display = undefined) => {
    const styleObj = {};
    if (display !== undefined) {
      styleObj.display = display;
    }
    if (lockoutActive) {
      styleObj.pointerEvents = "none";
      styleObj.opacity = 0.4;
      styleObj.cursor = "not-allowed";
    }
    return styleObj;
  };
  const [branding, setBranding] = useState(null);
  const [features, setFeatures] = useState({
    attendance: true,
    leave: true,
    payroll: true,
    assets: true,
    support: true,
    billing: true,
    holidays: true,
    daybook: true,
    separation: true,
    projects: true,
  });
  const [logoImageLoaded, setLogoImageLoaded] = useState(false);
  const [logoImageError, setLogoImageError] = useState(false);
  const brandingUserKeyRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isSuperAdmin = variant === "superadmin";

  const [companyFeatures, setCompanyFeatures] = useState({});

  const hasPermission = (moduleName, pageName = null) => {
    if (!user) return false;

    // Enforce Company-level granular permissions first
    if (companyFeatures && Object.keys(companyFeatures).length > 0) {
      const compKey = moduleName === "leaves" ? "leave" : moduleName;
      const companyModObj = companyFeatures[compKey] || companyFeatures[moduleName];
      if (companyModObj !== undefined) {
        if (typeof companyModObj === "boolean") {
          if (!companyModObj) return false;
        } else if (typeof companyModObj === "object" && companyModObj !== null) {
          // Check if module itself is disabled
          if (companyModObj.enabled === false) return false;

          // If a pageName is specified, check both page-level visibility and action-level rights
          if (pageName) {
            // Check page-level permission
            if (companyModObj.pages && companyModObj.pages[pageName] === false) {
              return false;
            }

            // For menu visibility, we only require "view" action permission!
            const actionKey = "view";

            // Check action-level permission (granular first, then module fallback)
            let hasPageActionPerm = true;
            if (companyModObj.page_actions && companyModObj.page_actions[pageName]) {
              const pageActions = companyModObj.page_actions[pageName];
              if (pageActions[actionKey] !== undefined) {
                hasPageActionPerm = pageActions[actionKey] === true;
              } else if (companyModObj.actions && companyModObj.actions[actionKey] !== undefined) {
                hasPageActionPerm = companyModObj.actions[actionKey] === true;
              }
            } else if (companyModObj.actions && companyModObj.actions[actionKey] !== undefined) {
              hasPageActionPerm = companyModObj.actions[actionKey] === true;
            }

            if (!hasPageActionPerm) {
              return false;
            }
          }
        }
      }
    }

    if (user.role !== "HR") return true;
    if (moduleName === "separation") return true;
    if (!user.hr_permissions) return false;
    
    const hrModKey = moduleName === "leave" ? "leaves" : (moduleName === "leaves" ? "leaves" : moduleName);
    const modObj = user.hr_permissions[hrModKey] || user.hr_permissions[moduleName];
    if (!modObj) return false;
    
    if (!pageName) {
      if (typeof modObj === "boolean") return modObj;
      return Object.values(modObj).some(val => val === true);
    }
    
    if (typeof modObj === "boolean") return modObj;

    // For sidebar menu visibility, we check if the HR user has "view" permission
    return modObj["view"] === true;
  };

  const handleLogout = async () => {
    clearSidebarBrandingCache();
    await logout();
    navigate("/login");
    onClose?.();
  };

  useEffect(() => {
    if (!user) {
      clearSidebarBrandingCache();
      setBranding(null);
      brandingUserKeyRef.current = null;
      return;
    }
    const k = sidebarBrandingCacheKey(user);
    if (brandingUserKeyRef.current !== k) {
      setBranding(null);
      brandingUserKeyRef.current = k;
    }
    let cancelled = false;
    fetchSidebarBranding(user).then((data) => {
      if (!cancelled) setBranding(data);
    });
    return () => {
      cancelled = true;
    };
  }, [user, user?.companyId, user?.id]);

  useEffect(() => {
    if (!user || isSuperAdmin) {
      return;
    }
    let cancelled = false;
    getEffectiveSystemSettings()
      .then((res) => {
        if (!cancelled) {
          setFeatures((prev) => ({ ...prev, ...(res.data?.features || {}) }));
          setCompanyFeatures(res.data?.company_enabled_modules || {});
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFeatures({
            attendance: true,
            leave: true,
            payroll: true,
            assets: true,
            support: true,
            notifications: true,
            billing: true,
            holidays: true,
            daybook: true,
            separation: true,
            projects: true,
          });
          setCompanyFeatures({});
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user, isSuperAdmin]);

  const companyName = branding?.name || user?.company?.name || "HRMS";
  const hasBrandingPayload = branding != null;
  const rawLogoUrl = hasBrandingPayload
    ? branding.logo_url || branding.logoUrl || null
    : user?.company?.logo_url || user?.company?.logoUrl || null;
  const logoUrl = resolveBrandingLogoUrl(rawLogoUrl);
  const showLogoGraphic = Boolean(logoUrl && !logoImageError);
  /** Never show company name while a logo URL exists — only skeleton until decode, or text if no logo / broken image. */
  const showTitleFallback = !showLogoGraphic;

  /**
   * Preload with `Image()` — a clipped 1×1 `<img>` often never finishes loading, so `onLoad` never fires
   * (blank skeleton until hard refresh). Decode off-DOM, then mount a normal `<img>`.
   */
  useEffect(() => {
    if (!logoUrl) {
      setLogoImageLoaded(false);
      setLogoImageError(false);
      return;
    }
    let cancelled = false;
    setLogoImageLoaded(false);
    setLogoImageError(false);
    const img = new Image();
    img.onload = () => {
      if (!cancelled) setLogoImageLoaded(true);
    };
    img.onerror = () => {
      if (!cancelled) setLogoImageError(true);
    };
    img.src = logoUrl;
    return () => {
      cancelled = true;
    };
  }, [logoUrl]);

  const titleText = isSuperAdmin ? `${companyName} · Super Admin` : companyName;

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${isOpen ? "mobile-open" : ""}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          {showLogoGraphic && !logoImageLoaded && (
            <span
              className={`sidebar-logo-skeleton ${collapsed ? "sidebar-logo-skeleton--collapsed" : ""}`}
              aria-hidden
            />
          )}
          {showLogoGraphic && logoImageLoaded && (
            <img
              src={logoUrl}
              alt={companyName}
              className={`sidebar-logo-img sidebar-logo-img--loaded ${
                collapsed ? "sidebar-logo-img--collapsed" : ""
              }`}
              decoding="async"
            />
          )}
          {!collapsed && showTitleFallback && (
            <h2 className="sidebar-logo">{titleText}</h2>
          )}
        </div>
        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
        >
          ☰
        </button>
      </div>

      <nav className="sidebar-menu">
        {isSuperAdmin ? (
          <>
            <NavLink to="/super-admin" end className="sidebar-item" onClick={onClose}>
              🏠 {!collapsed && "Dashboard"}
            </NavLink>
            <NavLink to="/super-admin/companies" className="sidebar-item" onClick={onClose}>
              🏢 {!collapsed && "Companies"}
            </NavLink>
            <NavLink to="/super-admin/manage-users" className="sidebar-item" onClick={onClose}>
              👥 {!collapsed && "Manage Users"}
            </NavLink>

            <NavLink to="/super-admin/audit" className="sidebar-item" onClick={onClose}>
              📋 {!collapsed && "Audit Logs"}
            </NavLink>
            <NavLink to="/super-admin/notifications" className="sidebar-item" onClick={onClose}>
              📧 {!collapsed && "Send Notification"}
            </NavLink>
            <NavLink to="/super-admin/billing" className="sidebar-item" onClick={onClose}>
              💳 {!collapsed && "Billing"}
            </NavLink>
            <NavLink to="/super-admin/settings" className="sidebar-item" onClick={onClose}>
              ⚙️ {!collapsed && "Settings"}
            </NavLink>
            <NavLink to="/super-admin/reports" className="sidebar-item" onClick={onClose}>
              📊 {!collapsed && "Reports"}
            </NavLink>
            <NavLink to="/super-admin/support" className="sidebar-item" onClick={onClose}>
              🎫 {!collapsed && "Support Tickets"}
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/dashboard" className="sidebar-item" style={getBlockedStyle()} onClick={onClose}>
              🏠 {!collapsed && "Dashboard"}
            </NavLink>
            {hasPermission("employees") && (
              <NavLink to="/roles-departments" className="sidebar-item" style={getBlockedStyle()} onClick={onClose}>
                ⚙️ {!collapsed && "Roles & Depts"}
              </NavLink>
            )}
            {hasPermission("employees") && (
              <NavLink to="/employees" className="sidebar-item" style={getBlockedStyle()} onClick={onClose}>
                👥 {!collapsed && "Employees"}
              </NavLink>
            )}
            {user?.role === "ADMIN" && (
              <NavLink to="/company-users" className="sidebar-item" style={getBlockedStyle()} onClick={onClose}>
                🧑 {!collapsed && "Company Users"}
              </NavLink>
            )}
            {features.attendance && hasPermission("attendance") && (
              <>
                <div
                  className="sidebar-item dropdown"
                  style={getBlockedStyle()}
                  onClick={() => !lockoutActive && setOpenAttendance(!openAttendance)}
                >
                  📅 {!collapsed && "Attendance"}
                  {!collapsed && (
                    <span className="dropdown-arrow">{openAttendance ? "▲" : "▼"}</span>
                  )}
                </div>
                {openAttendance && !collapsed && (
                  <div className="sidebar-dropdown-menu">
                    {hasPermission("attendance", "attendance") && (
                      <NavLink to="/attendance" className="sidebar-subitem" style={getBlockedStyle()} onClick={onClose}>
                        📅 Daily Attendance
                      </NavLink>
                    )}
                    {hasPermission("attendance", "monthly") && (
                      <NavLink to="/monthly" className="sidebar-subitem" style={getBlockedStyle()} onClick={onClose}>
                        📊 Monthly Attendance
                      </NavLink>
                    )}
                  </div>
                )}
              </>
            )}
            {features.leave && hasPermission("leaves") && (
              <>
                <div
                  className="sidebar-item dropdown"
                  style={getBlockedStyle()}
                  onClick={() => !lockoutActive && setOpenLeaves(!openLeaves)}
                >
                  🍃 {!collapsed && "Leaves"}
                  {!collapsed && (
                    <span className="dropdown-arrow">{openLeaves ? "▲" : "▼"}</span>
                  )}
                </div>
                {openLeaves && !collapsed && (
                  <div className="sidebar-dropdown-menu">
                    {hasPermission("leaves", "dashboard") && (
                      <NavLink to="/leave-dashboard" className="sidebar-subitem" style={getBlockedStyle()} onClick={onClose}>
                        📊 Dashboard
                      </NavLink>
                    )}
                    {hasPermission("leaves", "approvals") && (
                      <NavLink to="/approvals" className="sidebar-subitem" style={getBlockedStyle()} onClick={onClose}>
                        ✅ Approvals
                      </NavLink>
                    )}
                    {hasPermission("leaves", "rejected") && (
                      <NavLink to="/rejected" className="sidebar-subitem" style={getBlockedStyle()} onClick={onClose}>
                        ❌ Rejected
                      </NavLink>
                    )}
                    {hasPermission("leaves", "leave-calendar") && (
                      <NavLink to="/leave-calendar" className="sidebar-subitem" style={getBlockedStyle()} onClick={onClose}>
                        📅 Calendar
                      </NavLink>
                    )}
                    {hasPermission("leaves", "leave-settings") && (
                      <NavLink to="/leave-settings" className="sidebar-subitem" style={getBlockedStyle()} onClick={onClose}>
                        ⚙️ Settings
                      </NavLink>
                    )}
                  </div>
                )}
              </>
            )}
            {features.payroll && hasPermission("payroll") && (
              <>
                <div
                  className="sidebar-item dropdown"
                  style={getBlockedStyle()}
                  onClick={() => !lockoutActive && setOpenPayroll(!openPayroll)}
                >
                  💰 {!collapsed && "Payroll"}
                  {!collapsed && (
                    <span className="dropdown-arrow">{openPayroll ? "▲" : "▼"}</span>
                  )}
                </div>
                {openPayroll && !collapsed && (
                  <div className="sidebar-dropdown-menu">
                    {hasPermission("payroll", "payroll") && (
                      <NavLink to="/payroll" className="sidebar-subitem" style={getBlockedStyle()} onClick={onClose}>
                        📄 Generate Payslip
                      </NavLink>
                    )}
                    {hasPermission("payroll", "payroll-summary") && (
                      <NavLink to="/payroll-summary" className="sidebar-subitem" style={getBlockedStyle()} onClick={onClose}>
                        📊 Payroll Summary
                      </NavLink>
                    )}
                    {hasPermission("payroll", "salary-payment-summary") && (
                      <NavLink to="/salary-payment-summary" className="sidebar-subitem" style={getBlockedStyle()} onClick={onClose}>
                        💳 Payment Summary
                      </NavLink>
                    )}
                    {hasPermission("payroll", "email-dashboard") && (
                      <NavLink to="/email-dashboard" className="sidebar-subitem" style={getBlockedStyle()} onClick={onClose}>
                        📧 Email Dashboard
                      </NavLink>
                    )}
                  </div>
                )}
              </>
            )}
            {features.projects && (user?.role === "ADMIN" || user?.role === "HR") && hasPermission("projects") && (
              <>
                <div
                  className="sidebar-item dropdown"
                  style={getBlockedStyle()}
                  onClick={() => !lockoutActive && setOpenProjects(!openProjects)}
                >
                  🚀 {!collapsed && "Projects"}
                  {!collapsed && (
                    <span className="dropdown-arrow">{openProjects ? "▲" : "▼"}</span>
                  )}
                </div>
                {openProjects && !collapsed && (
                  <div className="sidebar-dropdown-menu">
                    {hasPermission("projects", "dashboard") && (
                      <NavLink to="/projects/dashboard" className="sidebar-subitem" style={getBlockedStyle()} onClick={onClose}>
                        📊 Dashboard
                      </NavLink>
                    )}
                    {hasPermission("projects", "projects") && (
                      <NavLink to="/projects" end className="sidebar-subitem" style={getBlockedStyle()} onClick={onClose}>
                        📋 All Projects
                      </NavLink>
                    )}
                    {hasPermission("projects", "projects") && (
                      <NavLink to="/projects/create" className="sidebar-subitem" style={getBlockedStyle()} onClick={onClose}>
                        ➕ Create Project
                      </NavLink>
                    )}
                    {hasPermission("projects", "projects") && (
                      <NavLink to="/projects/assign" className="sidebar-subitem" style={getBlockedStyle()} onClick={onClose}>
                        👥 Assign Team
                      </NavLink>
                    )}
                  </div>
                )}
              </>
            )}
            {features.daybook && hasPermission("daybook") && (
              <>
                <div
                  className="sidebar-item dropdown"
                  style={getBlockedStyle()}
                  onClick={() => !lockoutActive && setOpenDaybook(!openDaybook)}
                >
                  📘 {!collapsed && "Day Book"}
                  {!collapsed && (
                    <span className="dropdown-arrow">{openDaybook ? "▲" : "▼"}</span>
                  )}
                </div>
                {openDaybook && !collapsed && (
                  <div className="sidebar-dropdown-menu">
                    {hasPermission("daybook", "dashboard") && (
                      <NavLink to="/daybook/dashboard" className="sidebar-subitem" style={getBlockedStyle()} onClick={onClose}>
                        📊 Dashboard
                      </NavLink>
                    )}
                    {hasPermission("daybook", "transactions") && (
                      <NavLink to="/daybook/transactions" className="sidebar-subitem" style={getBlockedStyle()} onClick={onClose}>
                        💸 Transactions
                      </NavLink>
                    )}
                    {hasPermission("daybook", "vendors") && (
                      <NavLink to="/daybook/vendors" className="sidebar-subitem" style={getBlockedStyle()} onClick={onClose}>
                        🏢 Vendors
                      </NavLink>
                    )}
                    {hasPermission("daybook", "categories") && (
                      <NavLink to="/daybook/categories" className="sidebar-subitem" style={getBlockedStyle()} onClick={onClose}>
                        📂 Categories
                      </NavLink>
                    )}
                    {hasPermission("daybook", "reports") && (
                      <NavLink to="/daybook/reports" className="sidebar-subitem" style={getBlockedStyle()} onClick={onClose}>
                        📈 Reports
                      </NavLink>
                    )}
                  </div>
                )}
              </>
            )}
            {features.holidays && hasPermission("holidays") && (
              <NavLink to="/holidays" className="sidebar-item" style={getBlockedStyle()} onClick={onClose}>
                🏖️ {!collapsed && "Holidays"}
              </NavLink>
            )}
            {features.assets && hasPermission("assets") && (
              <>
                <div
                  className="sidebar-item dropdown"
                  style={getBlockedStyle()}
                  onClick={() => !lockoutActive && setOpenAssets(!openAssets)}
                >
                  📦 {!collapsed && "Assets"}
                  {!collapsed && (
                    <span className="dropdown-arrow">{openAssets ? "▲" : "▼"}</span>
                  )}
                </div>
                {openAssets && !collapsed && (
                  <div className="sidebar-dropdown-menu">
                    {hasPermission("assets", "dashboard") && (
                      <NavLink to="/assets/dashboard" className="sidebar-subitem" style={getBlockedStyle()} onClick={onClose}>
                        📊 Dashboard
                      </NavLink>
                    )}
                    {hasPermission("assets", "categories") && (
                      <NavLink to="/assets/categories" className="sidebar-subitem" style={getBlockedStyle()} onClick={onClose}>
                        📂 Categories
                      </NavLink>
                    )}
                    {hasPermission("assets", "assets") && (
                      <NavLink to="/assets" end className="sidebar-subitem" style={getBlockedStyle()} onClick={onClose}>
                        📋 Manage Assets
                      </NavLink>
                    )}
                    {hasPermission("assets", "assign") && (
                      <NavLink to="/assets/assign" className="sidebar-subitem" style={getBlockedStyle()} onClick={onClose}>
                        🤝 Assign Assets
                      </NavLink>
                    )}
                    {hasPermission("assets", "returns") && (
                      <NavLink to="/assets/returns" className="sidebar-subitem" style={getBlockedStyle()} onClick={onClose}>
                        ↩️ Returns
                      </NavLink>
                    )}
                    {hasPermission("assets", "maintenance") && (
                      <NavLink to="/assets/maintenance" className="sidebar-subitem" style={getBlockedStyle()} onClick={onClose}>
                        🔧 Maintenance
                      </NavLink>
                    )}
                    {hasPermission("assets", "history") && (
                      <NavLink to="/assets/history" className="sidebar-subitem" style={getBlockedStyle()} onClick={onClose}>
                        🕒 History
                      </NavLink>
                    )}
                  </div>
                )}
              </>
            )}
            {features.separation && hasPermission("separation") && (
              <>
                <div
                  className="sidebar-item dropdown"
                  style={getBlockedStyle()}
                  onClick={() => !lockoutActive && setOpenSeparation(!openSeparation)}
                >
                  👋 {!collapsed && "Separation"}
                  {!collapsed && (
                    <span className="dropdown-arrow">{openSeparation ? "▲" : "▼"}</span>
                  )}
                </div>
                {openSeparation && !collapsed && (
                  <div className="sidebar-dropdown-menu">
                    {hasPermission("separation", "dashboard") && (user?.role === "HR" || user?.role === "ADMIN" || isSuperAdmin) && (
                      <NavLink to="/separation" end className="sidebar-subitem" style={getBlockedStyle()} onClick={onClose}>
                        📊 Dashboard
                      </NavLink>
                    )}
                    {hasPermission("separation", "ff-history") && (user?.role === "HR" || user?.role === "ADMIN" || isSuperAdmin) && (
                      <NavLink to="/separation/ff-history" className="sidebar-subitem" style={getBlockedStyle()} onClick={onClose}>
                        📜 F&F History
                      </NavLink>
                    )}
                  </div>
                )}
              </>
            )}
            {features.support && hasPermission("support") && (
              <NavLink to="/support" className="sidebar-item" onClick={onClose}>
                🎫 {!collapsed && "Support"}
              </NavLink>
            )}
            {features.notifications && hasPermission("notifications") && (
              <NavLink to="/notifications" className="sidebar-item" style={getBlockedStyle()} onClick={onClose}>
                📧 {!collapsed && "Notifications"}
              </NavLink>
            )}
            <NavLink to="/settings?tab=subscription-plan" className="sidebar-item" style={{ display: features.billing ? undefined : "none" }} onClick={onClose}>
              💳 {!collapsed && "Billing"}
            </NavLink>
            <NavLink to="/settings" className="sidebar-item" onClick={onClose}>
              ⚙️ {!collapsed && "Settings"}
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <button
          type="button"
          className="sidebar-item logout"
          onClick={handleLogout}
          style={{ width: "100%", textAlign: "left", border: "none", background: "none", cursor: "pointer" }}
        >
          🚪 {!collapsed && "Logout"}
        </button>
      </div>
    </aside>
  );
}
