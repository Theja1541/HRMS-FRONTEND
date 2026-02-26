import { Outlet } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import EmployeeSidebar from "./EmployeeSidebar";
import "../../styles/employeeLayout.css";

export default function EmployeeLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="employee-layout">

      {/* SIDEBAR */}
      <EmployeeSidebar />

      {/* MAIN CONTENT */}
      <div className="employee-body">

        {/* HEADER (Minimal Professional Top Bar) */}
        <header className="employee-header">

          <div className="employee-header-left">
            <span className="employee-role">
              {user?.role}
            </span>
          </div>

          <div className="employee-header-right">
            <span className="employee-user">
              {user?.username}
            </span>

            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </div>

        </header>

        {/* PAGE CONTENT */}
        <main className="employee-main">
          <div className="employee-content">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}