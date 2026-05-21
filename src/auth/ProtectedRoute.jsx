import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // 🔐 Not logged in
  if (!isAuthenticated) {

    // ✅ Allow access to change-password without authentication
    if (location.pathname === "/change-password") {
      return children;
    }

    return <Navigate to="/login" replace />;
  }

  const currentRole = (user?.role || "").toUpperCase().trim();
  const normalizedAllowedRoles = (allowedRoles || []).map((role) =>
    String(role).toUpperCase().trim()
  );

  if (!currentRole) {
    return <Navigate to="/login" replace />;
  }

  const redirectPathByRole = {
    SUPER_ADMIN: "/super-admin/dashboard",
    ADMIN: "/dashboard",
    HR: "/dashboard",
    EMPLOYEE: "/employee/dashboard",
  };

  // 🚫 Role not allowed: send users to their own dashboard
  if (!normalizedAllowedRoles.includes(currentRole)) {
    return (
      <Navigate
        to={redirectPathByRole[currentRole] || "/unauthorized"}
        replace
      />
    );
  }

  return children;
}