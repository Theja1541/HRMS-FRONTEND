import { NavLink } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

export default function SuperAdminSidebar({ isOpen, onClose }) {
  const { logout } = useAuth();

  const handleNav = () => {
    if (onClose) onClose();
  };

  const handleLogout = () => {
    if (onClose) onClose();
    logout();
  };

  return (
    <div className={`super-sidebar${isOpen ? " sa-mobile-open" : ""}`}>
      <h2 className="super-logo">SUPER ADMIN</h2>

      <NavLink to="/super-admin" end onClick={handleNav}>Dashboard</NavLink>
      <NavLink to="/super-admin/companies" onClick={handleNav}>Companies</NavLink>
      <NavLink to="/super-admin/billing" onClick={handleNav}>Billing</NavLink>
      <NavLink to="/super-admin/users" onClick={handleNav}>Manage Users</NavLink>
      <NavLink to="/super-admin/audit" onClick={handleNav}>Audit Logs</NavLink>
      <NavLink to="/super-admin/notifications" onClick={handleNav}>Notifications</NavLink>
      <NavLink to="/super-admin/reports" onClick={handleNav}>Reports</NavLink>
      <NavLink to="/super-admin/support" onClick={handleNav}>Support</NavLink>
      <NavLink to="/super-admin/settings" onClick={handleNav}>System Settings</NavLink>

      <button className="super-logout" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}
