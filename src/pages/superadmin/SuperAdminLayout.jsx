import { Outlet } from "react-router-dom";
import SuperAdminSidebar from "./SuperAdminSidebar";
import SuperAdminHeader from "./SuperAdminHeader";
export default function SuperAdminLayout() {
  return (
    <div className="super-layout">
      <SuperAdminSidebar />

      <div className="super-content">
        <SuperAdminHeader />
        <div className="super-page">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
