import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import "../../styles/superadmin.css";

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

        <NavLink to="/super-admin/users">
          Manage Users
        </NavLink>

        <NavLink to="/super-admin/system">
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
