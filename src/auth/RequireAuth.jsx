import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RequireAuth({ roles, children }) {
  const { user } = useAuth();
  const currentRole = (user?.role || "").toUpperCase().trim();
  const allowedRoles = (roles || []).map((role) => String(role).toUpperCase().trim());

  if (!user || !currentRole) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !allowedRoles.includes(currentRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
