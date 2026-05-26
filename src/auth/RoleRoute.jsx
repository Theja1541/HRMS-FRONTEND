import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RoleAuth({ roles, children }) {
  const { user } = useAuth();
  const currentRole = (user?.role || "").toUpperCase().trim();
  const allowedRoles = (roles || []).map((role) => String(role).toUpperCase().trim());

  // 🔐 Not logged in
  if (!user || !currentRole) {
    return <Navigate to="/login" replace />;
  }

  // 🔒 Role-based access
  if (roles && !allowedRoles.includes(currentRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
