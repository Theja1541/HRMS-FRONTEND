import "../../styles/header.css";

export default function Header({ onToggleSidebar }) {
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
          <div className="avatar">A</div>
          <span className="username">Admin</span>
        </div>

        <button className="logout-btn">Logout</button>
      </div>
    </header>
  );
}
