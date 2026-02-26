// import { NavLink, useNavigate } from "react-router-dom";
// import { useAuth } from "../../auth/AuthContext";
// import "../../styles/employeeSidebar.css";

// export default function EmployeeSidebar() {
//   const { logout, user } = useAuth();
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     logout();
//     navigate("/login", { replace: true });
//   };

//   return (
//     <aside className="employee-sidebar">
//       {/* LOGO */}
//       <div className="sidebar-title">
//         Employee Portal
//       </div>

//       {/* MENU */}
//       <nav className="employee-menu">
//         <NavLink to="/employee/dashboard">
//           🏠 Dashboard
//         </NavLink>

//         <NavLink to="/employee/attendance">
//           📅 My Attendance
//         </NavLink>

//         <NavLink to="/employee/apply-leave">
//           🍃 Apply Leave
//         </NavLink>

//         <NavLink to="/employee/my-leaves">
//           📋 My Leaves
//         </NavLink>

//         <NavLink to="/employee/profile">
//           👤 My Profile
//         </NavLink>

//       </nav>

//       {/* FOOTER */}
//       <div className="employee-sidebar-footer">
//         <button className="logout-btn" onClick={handleLogout}>
//           🚪 Logout
//         </button>
//       </div>
//     </aside>
//   );
// }


import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import "../../styles/sidebar.css"; // ✅ Use SAME sidebar CSS as Admin

export default function EmployeeSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="sidebar">

      {/* HEADER */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          Employee Portal
        </div>
      </div>

      {/* MENU */}
      <div className="sidebar-menu">

        <NavLink
          to="/employee/dashboard"
          className={({ isActive }) =>
            isActive ? "sidebar-item active" : "sidebar-item"
          }
        >
          <span>🏠</span>
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/employee/attendance"
          className={({ isActive }) =>
            isActive ? "sidebar-item active" : "sidebar-item"
          }
        >
          <span>📅</span>
          <span>My Attendance</span>
        </NavLink>

        <NavLink
          to="/employee/apply-leave"
          className={({ isActive }) =>
            isActive ? "sidebar-item active" : "sidebar-item"
          }
        >
          <span>🍃</span>
          <span>Apply Leave</span>
        </NavLink>

        <NavLink
          to="/employee/my-leaves"
          className={({ isActive }) =>
            isActive ? "sidebar-item active" : "sidebar-item"
          }
        >
          <span>📋</span>
          <span>My Leaves</span>
        </NavLink>

        <NavLink
          to="/employee/my-payslips"
          className={({ isActive }) =>
            isActive ? "sidebar-item active" : "sidebar-item"
          }
        >
          <span>💰</span>
          <span>My Payslips</span>
        </NavLink>

        <NavLink
          to="/employee/profile"
          className={({ isActive }) =>
            isActive ? "sidebar-item active" : "sidebar-item"
          }
        >
          <span>👤</span>
          <span>My Profile</span>
        </NavLink>

      </div>

      {/* FOOTER */}
      <div className="sidebar-footer">
        <div
          className="sidebar-item logout"
          onClick={handleLogout}
        >
          <span>🚪</span>
          <span>Logout</span>
        </div>
      </div>

    </aside>
  );
}