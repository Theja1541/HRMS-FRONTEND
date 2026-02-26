import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RoleAuth({ roles, children }) {
  const { user } = useAuth();

  // 🔐 Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🔒 Role-based access
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
