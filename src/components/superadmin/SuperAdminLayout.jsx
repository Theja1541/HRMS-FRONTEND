import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
export default function SuperAdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="superadmin-container">
      {/* SIDEBAR */}
      <aside className="superadmin-sidebar">
        <h2>SUPER ADMIN</h2>

        <NavLink to="/super-admin" end>
          Dashboard
        </NavLink>

        <NavLink to="/super-admin/companies">
          Companies
        </NavLink>

        <NavLink to="/super-admin/manage-users">
          Manage Users
        </NavLink>

        <NavLink to="/super-admin/create-user">
          Create User / Company Admin
        </NavLink>

        <NavLink to="/super-admin/audit">
          Audit Logs
        </NavLink>

        <NavLink to="/super-admin/notifications">
          Send Notification
        </NavLink>

        <NavLink to="/super-admin/settings">
          System Settings
        </NavLink>

        <NavLink to="/super-admin/reports">
          Reports
        </NavLink>

        <button onClick={handleLogout}>
          Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="superadmin-content">
        <Outlet />
      </main>
    </div>
  );
}
