import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { useState, useEffect } from "react";
import { getEffectiveSystemSettings } from "../../api/superadmin";
import "../../styles/employeeSidebar.css";

export default function EmployeeSidebar({ isOpen, onClose, lockoutActive = false }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

  const [leaveOpen, setLeaveOpen] = useState(false);
  const [payslipOpen, setPayslipOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [features, setFeatures] = useState({
    attendance: true,
    leave: true,
    payroll: true,
    assets: true,
  });

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
    onClose?.();
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
      location.pathname.includes("/employee/my-salary") ||
      location.pathname.includes("/employee/salary-timeline")
    ) {
      setPayslipOpen(true);
    }

  }, [location.pathname]);

  useEffect(() => {
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
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${isOpen ? "mobile-open" : ""}`}>

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

        <NavLink to="/employee/dashboard" className="sidebar-item" style={getBlockedStyle()} onClick={onClose}>
          <span>🏠</span>
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/employee/attendance" className="sidebar-item" style={getBlockedStyle(features.attendance ? undefined : "none")} onClick={onClose}>
          <span>📅</span>
          <span>My Attendance</span>
        </NavLink>

        {/* LEAVES */}
        {features.leave && !collapsed && (
          <>
            <div
              className={`sidebar-item dropdown-parent ${leaveOpen ? "open" : ""}`}
              style={getBlockedStyle()}
              onClick={() => {
                if (!lockoutActive) {
                  setLeaveOpen(!leaveOpen);
                  setPayslipOpen(false);
                }
              }}
            >
              <span>🍃</span>
              <span>Leaves</span>
              <span className="dropdown-arrow">▼</span>
            </div>

            <div className={`dropdown-wrapper ${leaveOpen ? "show" : ""}`}>
              <div>

                <NavLink to="/employee/apply-leave" className="sidebar-item child" style={getBlockedStyle()} onClick={onClose}>
                  Apply Leave
                </NavLink>

                <NavLink to="/employee/my-leaves" className="sidebar-item child" style={getBlockedStyle()} onClick={onClose}>
                  My Leaves
                </NavLink>

                <NavLink to="/employee/leave-balance" className="sidebar-item child" style={getBlockedStyle()} onClick={onClose}>
                  Leave Balance
                </NavLink>

              </div>
            </div>
          </>
        )}

        {features.leave && collapsed && (
          <NavLink to="/employee/apply-leave" className="sidebar-item" style={getBlockedStyle()} onClick={onClose}>
            <span>🍃</span>
          </NavLink>
        )}

        {/* PAYSLIPS */}
        {features.payroll && !collapsed && (
          <>
            <div
              className={`sidebar-item dropdown-parent ${payslipOpen ? "open" : ""}`}
              style={getBlockedStyle()}
              onClick={() => {
                if (!lockoutActive) {
                  setPayslipOpen(!payslipOpen);
                  setLeaveOpen(false);
                }
              }}
            >
              <span>💰</span>
              <span>Payslips</span>
              <span className="dropdown-arrow">▼</span>
            </div>

            <div className={`dropdown-wrapper ${payslipOpen ? "show" : ""}`}>
              <div>

                <NavLink to="/employee/my-payslips" className="sidebar-item child" style={getBlockedStyle()} onClick={onClose}>
                  My Payslips
                </NavLink>

                <NavLink to="/employee/my-salary" className="sidebar-item child" style={getBlockedStyle()} onClick={onClose}>
                  My Salary
                </NavLink>

                <NavLink to="/employee/salary-timeline" className="sidebar-item child" style={getBlockedStyle()} onClick={onClose}>
                  Salary Growth Timeline
                </NavLink>

              </div>
            </div>
          </>
        )}

        {features.payroll && collapsed && (
          <NavLink to="/employee/my-payslips" className="sidebar-item" style={getBlockedStyle()} onClick={onClose}>
            <span>💰</span>
          </NavLink>
        )}


        <NavLink to="/employee/asset-requests" className="sidebar-item" style={getBlockedStyle(features.assets ? undefined : "none")} onClick={onClose}>
          <span>📦</span>
          <span>Assets</span>
        </NavLink>

        <NavLink to="/employee/holidays" className="sidebar-item" style={getBlockedStyle()} onClick={onClose}>
          <span>🏖️</span>
          <span>Holidays</span>
        </NavLink>


        <NavLink to="/employee/profile" className="sidebar-item" style={getBlockedStyle()} onClick={onClose}>
          <span>👤</span>
          <span>My Profile</span>
        </NavLink>

        
        <NavLink to="/employee/resignation" className="sidebar-item" style={getBlockedStyle()} onClick={onClose}>
          <span>👋</span>
          <span>Resignation</span>
        </NavLink>

        <NavLink to="/employee/settings" className="sidebar-item" onClick={onClose}>
          <span>⚙️</span>
          <span>Settings</span>
        </NavLink>

      </div>

      {/* FOOTER */}
      <div className="sidebar-footer">
        <div className="sidebar-item logout" onClick={handleLogout}>
          <span>🚪</span>
          <span>Logout</span>
        </div>
      </div>

    </aside>
  );
}
