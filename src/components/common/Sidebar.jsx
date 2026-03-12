import { NavLink } from "react-router-dom";
import { useState } from "react";
import "../../styles/sidebar.css";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [openLeaves, setOpenLeaves] = useState(false);
  const [openPayroll, setOpenPayroll] = useState(false);
  const [openDaybook, setOpenDaybook] = useState(false);

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      
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

        <NavLink to="/dashboard" className="sidebar-item">
          🏠 {!collapsed && "Dashboard"}
        </NavLink>

        <NavLink to="/employees" className="sidebar-item">
          👥 {!collapsed && "Employees"}
        </NavLink>

        <NavLink to="/attendance" className="sidebar-item">
          📅 {!collapsed && "Attendance"}
        </NavLink>

        <NavLink to="/monthly" className="sidebar-item">
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
            <NavLink to="/leaves" className="sidebar-subitem">
              📊 Leave Dashboard
            </NavLink>
            <NavLink to="/approvals" className="sidebar-subitem">
              ✅ Leave Approvals
            </NavLink>
            <NavLink to="/rejected" className="sidebar-subitem">
              ❌ Leave Rejected
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
          <NavLink to="/payroll" className="sidebar-subitem">
            📄 Generate Payslip
          </NavLink>

          <NavLink to="/payroll-summary" className="sidebar-subitem">
            📊 Payroll Summary
          </NavLink>

          <NavLink to="/email-dashboard" className="sidebar-subitem">
            📧 Email Dashboard
          </NavLink>
        </div>
      )}

        {/* DAYBOOK DROPDOWN */}
        <div
          className="sidebar-item dropdown"
          onClick={() => setOpenDaybook(!openDaybook)}
        >
          📒 {!collapsed && "Daybook"}
          {!collapsed && (
            <span className="dropdown-arrow">
              {openDaybook ? "▲" : "▼"}
            </span>
          )}
        </div>

        {openDaybook && !collapsed && (
          <div className="sidebar-dropdown-menu">
            <NavLink to="/daybook/dashboard" className="sidebar-subitem">
              📊 Dashboard
            </NavLink>
            <NavLink to="/daybook/transactions" className="sidebar-subitem">
              💳 Transactions
            </NavLink>
            {/* <NavLink to="/daybook/add-transaction" className="sidebar-subitem">
              ➕ Add Transaction
            </NavLink> */}
            <NavLink to="/daybook/vendors" className="sidebar-subitem">
              🏢 Vendors
            </NavLink>
            <NavLink to="/daybook/categories" className="sidebar-subitem">
              📁 Categories
            </NavLink>
            <NavLink to="/daybook/reports" className="sidebar-subitem">
              📈 Reports
            </NavLink>
          </div>
        )}
      </nav>

      {/* FOOTER */}
      <div className="sidebar-footer">
        <NavLink to="/login" className="sidebar-item logout">
          🚪 {!collapsed && "Logout"}
        </NavLink>
      </div>

    </aside>
  );
}
