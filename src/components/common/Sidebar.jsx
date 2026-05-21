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
  });
  const [logoImageLoaded, setLogoImageLoaded] = useState(false);
  const [logoImageError, setLogoImageError] = useState(false);
  const brandingUserKeyRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isSuperAdmin = variant === "superadmin";

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
          });
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
            <NavLink to="/employees" className="sidebar-item" style={getBlockedStyle()} onClick={onClose}>
              👥 {!collapsed && "Employees"}
            </NavLink>
            <NavLink to="/company-users" className="sidebar-item" style={getBlockedStyle()} onClick={onClose}>
              🧑 {!collapsed && "Company Users"}
            </NavLink>
            <NavLink to="/attendance" className="sidebar-item" style={getBlockedStyle(features.attendance ? undefined : "none")} onClick={onClose}>
              📅 {!collapsed && "Attendance"}
            </NavLink>
            <NavLink to="/monthly" className="sidebar-item" style={getBlockedStyle(features.attendance ? undefined : "none")} onClick={onClose}>
              📊 {!collapsed && "Monthly"}
            </NavLink>
            <div
              className="sidebar-item dropdown"
              style={getBlockedStyle(features.leave ? undefined : "none")}
              onClick={() => !lockoutActive && setOpenLeaves(!openLeaves)}
            >
              🍃 {!collapsed && "Leaves"}
              {!collapsed && (
                <span className="dropdown-arrow">{openLeaves ? "▲" : "▼"}</span>
              )}
            </div>
            {features.leave && openLeaves && !collapsed && (
              <div className="sidebar-dropdown-menu">
                <NavLink to="/leave-dashboard" className="sidebar-subitem" style={getBlockedStyle()} onClick={onClose}>
                  📊 Dashboard
                </NavLink>
                <NavLink to="/approvals" className="sidebar-subitem" style={getBlockedStyle()} onClick={onClose}>
                  ✅ Approvals
                </NavLink>
                <NavLink to="/rejected" className="sidebar-subitem" style={getBlockedStyle()} onClick={onClose}>
                  ❌ Rejected
                </NavLink>
                <NavLink to="/leave-calendar" className="sidebar-subitem" style={getBlockedStyle()} onClick={onClose}>
                  📅 Calendar
                </NavLink>
                <NavLink to="/leave-settings" className="sidebar-subitem" style={getBlockedStyle()} onClick={onClose}>
                  ⚙️ Settings
                </NavLink>
              </div>
            )}
            <div
              className="sidebar-item dropdown"
              style={getBlockedStyle(features.payroll ? undefined : "none")}
              onClick={() => !lockoutActive && setOpenPayroll(!openPayroll)}
            >
              💰 {!collapsed && "Payroll"}
              {!collapsed && (
                <span className="dropdown-arrow">{openPayroll ? "▲" : "▼"}</span>
              )}
            </div>
            {features.payroll && openPayroll && !collapsed && (
              <div className="sidebar-dropdown-menu">
                <NavLink to="/payroll" className="sidebar-subitem" style={getBlockedStyle()} onClick={onClose}>
                  📄 Generate Payslip
                </NavLink>
                <NavLink to="/payroll-summary" className="sidebar-subitem" style={getBlockedStyle()} onClick={onClose}>
                  📊 Payroll Summary
                </NavLink>
                <NavLink to="/salary-payment-summary" className="sidebar-subitem" style={getBlockedStyle()} onClick={onClose}>
                  💳 Payment Summary
                </NavLink>
                <NavLink to="/email-dashboard" className="sidebar-subitem" style={getBlockedStyle()} onClick={onClose}>
                  📧 Email Dashboard
                </NavLink>
              </div>
            )}
            <div
              className="sidebar-item dropdown"
              style={getBlockedStyle(features.assets ? undefined : "none")}
              onClick={() => !lockoutActive && setOpenAssets(!openAssets)}
            >
              📦 {!collapsed && "Assets"}
              {!collapsed && (
                <span className="dropdown-arrow">{openAssets ? "▲" : "▼"}</span>
              )}
            </div>
            {features.assets && openAssets && !collapsed && (
              <div className="sidebar-dropdown-menu">
                <NavLink to="/assets" className="sidebar-subitem" style={getBlockedStyle()} onClick={onClose}>
                  📋 Manage Assets
                </NavLink>
                <NavLink to="/asset-returns" className="sidebar-subitem" style={getBlockedStyle()} onClick={onClose}>
                  🔄 Asset Returns
                </NavLink>
              </div>
            )}
            <NavLink to="/support" className="sidebar-item" style={{ display: features.support ? undefined : "none" }} onClick={onClose}>
              🎫 {!collapsed && "Support"}
            </NavLink>
            <NavLink to="/notifications" className="sidebar-item" style={getBlockedStyle(features.notifications ? undefined : "none")} onClick={onClose}>
              📧 {!collapsed && "Notifications"}
            </NavLink>
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
