import { useLocation } from "react-router-dom";
import "./topNavbar.css";

export default function TopNavbar() {
  const location = useLocation();

  /* ===== ROUTE → TITLE MAPPING ===== */
  const getPageTitle = () => {
    const path = location.pathname;

    if (path === "/") return "Dashboard";

    if (path.startsWith("/employees/add")) return "Add Employee";
    if (path.startsWith("/employees")) return "Employees";

    if (path.startsWith("/attendance/monthly"))
      return "Monthly Attendance";
    if (path.startsWith("/attendance")) return "Daily Attendance";

    if (path.startsWith("/leaves/history")) return "Leave History";
    if (path.startsWith("/leaves")) return "Leave Requests";

    if (path.startsWith("/settings")) return "Settings";

    return "HRMS";
  };

  return (
    <div className="top-navbar">
      <div className="right">
        <span className="icon">🔔</span>

        <div className="user">
          <div className="avatar">A</div>
          <span>Admin</span>
          <button className="logout-btn">Logout</button>
        </div>
      </div>
    </div>
  );
}
