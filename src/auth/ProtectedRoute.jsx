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

  // 🚫 Role not allowed
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}