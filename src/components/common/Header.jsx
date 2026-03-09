import "../../styles/header.css";
import { useAuth } from "../../auth/AuthContext";

export default function Header({ onToggleSidebar }) {
  const { user } = useAuth();

  return (
    <header className="app-header">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          className="sidebar-toggle"
          onClick={onToggleSidebar}
        >
          ☰
        </button>

        <h1 className="app-title">HRMS</h1>
      </div>

      <div className="header-right">
        <span className="notification">🔔</span>

        <div className="user-info">
          <div className="avatar">{user?.role?.charAt(0) || "A"}</div>
          <span className="username">{user?.role || "Admin"}</span>
        </div>

        <button className="logout-btn">Logout</button>
      </div>
    </header>
  );
}
