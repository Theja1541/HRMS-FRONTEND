import { NavLink } from "react-router-dom";
import { useState } from "react";
import "../../styles/sidebar.css";

export default function Sidebar({ isOpen, onClose }) {
  const [collapsed, setCollapsed] = useState(false);
  const [openLeaves, setOpenLeaves] = useState(false);
  const [openPayroll, setOpenPayroll] = useState(false);
  const [openAssets, setOpenAssets] = useState(false);

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${isOpen ? "mobile-open" : ""}`}>
      
      {/* HEADER */}
      <div className="sidebar-header">
        {!collapsed && <h2 className="sidebar-logo">GMMC HRMS</h2>}
        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
        >
          ☰
        </button>
      </div>

      {/* MENU */}
      <nav className="sidebar-menu">

        <NavLink to="/dashboard" className="sidebar-item" onClick={onClose}>
          🏠 {!collapsed && "Dashboard"}
        </NavLink>

        <NavLink to="/employees" className="sidebar-item" onClick={onClose}>
          👥 {!collapsed && "Employees"}
        </NavLink>

        <NavLink to="/attendance" className="sidebar-item" onClick={onClose}>
          📅 {!collapsed && "Attendance"}
        </NavLink>

        <NavLink to="/monthly" className="sidebar-item" onClick={onClose}>
          📊 {!collapsed && "Monthly"}
        </NavLink>

        {/* LEAVES DROPDOWN */}
        <div
          className="sidebar-item dropdown"
          onClick={() => setOpenLeaves(!openLeaves)}
        >
          🍃 {!collapsed && "Leaves"}
          {!collapsed && (
            <span className="dropdown-arrow">
              {openLeaves ? "▲" : "▼"}
            </span>
          )}
        </div>

        {openLeaves && !collapsed && (
          <div className="sidebar-dropdown-menu">
            <NavLink to="/leave-dashboard" className="sidebar-subitem" onClick={onClose}>
              📊 Dashboard
            </NavLink>
            <NavLink to="/approvals" className="sidebar-subitem" onClick={onClose}>
              ✅ Approvals
            </NavLink>
            <NavLink to="/rejected" className="sidebar-subitem" onClick={onClose}>
              ❌ Rejected
            </NavLink>
            <NavLink to="/leave-calendar" className="sidebar-subitem" onClick={onClose}>
              📅 Calendar
            </NavLink>
            <NavLink to="/leave-settings" className="sidebar-subitem" onClick={onClose}>
              ⚙️ Settings
            </NavLink>
          </div>
        )}

        {/* PAYROLL DROPDOWN */}
      <div
        className="sidebar-item dropdown"
        onClick={() => setOpenPayroll(!openPayroll)}
      >
        💰 {!collapsed && "Payroll"}
        {!collapsed && (
          <span className="dropdown-arrow">
            {openPayroll ? "▲" : "▼"}
          </span>
        )}
      </div>

      {openPayroll && !collapsed && (
        <div className="sidebar-dropdown-menu">
          <NavLink to="/payroll" className="sidebar-subitem" onClick={onClose}>
            📄 Generate Payslip
          </NavLink>

          <NavLink to="/payroll-summary" className="sidebar-subitem" onClick={onClose}>
            📊 Payroll Summary
          </NavLink>

          <NavLink to="/email-dashboard" className="sidebar-subitem" onClick={onClose}>
            📧 Email Dashboard
          </NavLink>
        </div>
      )}

        {/* ASSETS DROPDOWN */}
        <div
          className="sidebar-item dropdown"
          onClick={() => setOpenAssets(!openAssets)}
        >
          📦 {!collapsed && "Assets"}
          {!collapsed && (
            <span className="dropdown-arrow">
              {openAssets ? "▲" : "▼"}
            </span>
          )}
        </div>

        {openAssets && !collapsed && (
          <div className="sidebar-dropdown-menu">
            <NavLink to="/assets" className="sidebar-subitem" onClick={onClose}>
              📋 Manage Assets
            </NavLink>
            <NavLink to="/asset-returns" className="sidebar-subitem" onClick={onClose}>
              🔄 Asset Returns
            </NavLink>
          </div>
        )}

        <NavLink to="/settings" className="sidebar-item" onClick={onClose}>
          ⚙️ {!collapsed && "Settings"}
        </NavLink>
      </nav>

      {/* FOOTER */}
      <div className="sidebar-footer">
        <NavLink to="/login" className="sidebar-item logout" onClick={onClose}>
          🚪 {!collapsed && "Logout"}
        </NavLink>
      </div>

    </aside>
  );
}
