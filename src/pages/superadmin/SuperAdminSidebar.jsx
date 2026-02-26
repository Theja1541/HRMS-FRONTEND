import { NavLink } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

export default function SuperAdminSidebar() {
  const { logout } = useAuth();

  return (
    <div className="super-sidebar">
      <h2 className="super-logo">SUPER ADMIN</h2>

      <NavLink to="/super-admin">Dashboard</NavLink>
      <NavLink to="/super-admin/users">Manage Users</NavLink>
      <NavLink to="/super-admin/settings">System Settings</NavLink>
      <NavLink to="/super-admin/reports">Reports</NavLink>

      <button className="super-logout" onClick={logout}>
        Logout
      </button>
    </div>
  );
}
