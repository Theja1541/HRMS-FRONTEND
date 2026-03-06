import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { useState, useEffect } from "react";
import "../../styles/employeeSidebar.css";

export default function EmployeeSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [leaveOpen, setLeaveOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [payslipOpen, setPayslipOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

 useEffect(() => {

  if (
    location.pathname.includes("/employee/apply-leave") ||
    location.pathname.includes("/employee/my-leaves") ||
    location.pathname.includes("/employee/leave-balance")
  ) {
    setLeaveOpen(true);
  }

  if (
    location.pathname.includes("/employee/my-payslips") ||
    location.pathname.includes("/employee/salary-timeline")
  ) {
    setPayslipOpen(true);
  }

}, [location.pathname]);

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>

      {/* HEADER */}
      <div className="sidebar-header">
        {!collapsed && <div className="sidebar-logo">Employee Portal</div>}

        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? "➤" : "◀"}
        </button>
      </div>

      {/* MENU */}
      <div className="sidebar-menu">

        <NavLink to="/employee/dashboard" className="sidebar-item">
          <span>🏠</span>
          {!collapsed && <span>Dashboard</span>}
        </NavLink>

        <NavLink to="/employee/attendance" className="sidebar-item">
          <span>📅</span>
          {!collapsed && <span>My Attendance</span>}
        </NavLink>

        {/* LEAVES */}
        <div
          className={`sidebar-item dropdown-parent ${
            leaveOpen ? "open" : ""
          }`}
          onClick={() => !collapsed && setLeaveOpen(!leaveOpen)}
        >
          <span>🍃</span>
          {!collapsed && <span>Leaves</span>}
          {!collapsed && (
            <span className="dropdown-arrow">
              ▼
            </span>
          )}
        </div>

        {/* Always render, control via CSS height */}
        <div className={`dropdown-wrapper ${leaveOpen ? "show" : ""}`}>
          <NavLink to="/employee/apply-leave" className="sidebar-item child">
            Apply Leave
          </NavLink>

          <NavLink to="/employee/my-leaves" className="sidebar-item child">
            My Leaves
          </NavLink>

          <NavLink to="/employee/leave-balance" className="sidebar-item child">
            Leave Balance
          </NavLink>
        </div>

        {/* PAYSLIPS */}
          <div
            className={`sidebar-item dropdown-parent ${
              payslipOpen ? "open" : ""
            }`}
            onClick={() => !collapsed && setPayslipOpen(!payslipOpen)}
          >
            <span>💰</span>
            {!collapsed && <span>Payslips</span>}
            {!collapsed && (
              <span className="dropdown-arrow">
                ▼
              </span>
            )}
          </div>

          <div className={`dropdown-wrapper ${payslipOpen ? "show" : ""}`}>

            <NavLink to="/employee/my-payslips" className="sidebar-item child">
              My Payslips
            </NavLink>

            <NavLink to="/employee/salary-timeline" className="sidebar-item child">
              Salary Growth Timeline
            </NavLink>

          </div>

        <NavLink to="/employee/profile" className="sidebar-item">
          <span>👤</span>
          {!collapsed && <span>My Profile</span>}
        </NavLink>

      </div>

      {/* FOOTER */}
      <div className="sidebar-footer">
        <div className="sidebar-item logout" onClick={handleLogout}>
          <span>🚪</span>
          {!collapsed && <span>Logout</span>}
        </div>
      </div>
    </aside>
  );
}