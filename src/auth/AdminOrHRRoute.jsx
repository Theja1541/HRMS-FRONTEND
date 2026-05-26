import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function AdminOrHRRoute({ children }) {
  const { user } = useAuth();
  const currentRole = (user?.role || "").toUpperCase().trim();

  if (!user || !currentRole) {
    return <Navigate to="/login" replace />;
  }

  if (!["ADMIN", "HR", "SUPER_ADMIN"].includes(currentRole)) {
    return <Navigate to="/employee/dashboard" replace />;
  }

  return children;
}
