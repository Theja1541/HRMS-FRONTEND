import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function AdminOrHRRoute({ children }) {
  const { user } = useAuth();

  if (!user || !user.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin" && user.role !== "hr") {
    return <Navigate to="/employee/dashboard" replace />;
  }

  return children;
}
