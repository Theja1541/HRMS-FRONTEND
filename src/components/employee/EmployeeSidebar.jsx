import { NavLink } from "react-router-dom";
import "../../styles/sidebar.css";

export default function EmployeeSidebar() {
  return (
    <aside className="employee-sidebar">
      <h2 className="employee-logo">Employee Portal</h2>

      <NavLink to="/employee" end>
        Dashboard
      </NavLink>

      <NavLink to="/employee/profile">
        My Profile
      </NavLink>

      <NavLink to="/employee/attendance">
        My Attendance
      </NavLink>

      <NavLink to="/employee/leave">
        Apply Leave
      </NavLink>

      <NavLink to="/employee/documents">
        Documents
      </NavLink>

      <NavLink to="/employee/asset-returns">
        Asset Returns
      </NavLink>
    </aside>
  );
}
