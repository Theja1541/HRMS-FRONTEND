import { useState } from "react";
import { Outlet } from "react-router-dom";
import SuperAdminSidebar from "./SuperAdminSidebar";
import SuperAdminHeader from "./SuperAdminHeader";
import "../../styles/superadmin.css";

export default function SuperAdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="super-layout">
      {/* ── Mobile hamburger toggle ── */}
      <button
        className="sa-mobile-menu-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Open navigation menu"
      >
        ☰
      </button>

      {/* ── Backdrop overlay ── */}
      {sidebarOpen && (
        <div
          className="sa-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <SuperAdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ── Main content ── */}
      <div className="super-content">
        <SuperAdminHeader />
        <div className="super-page">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
