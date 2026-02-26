import { createContext, useContext, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("authUser");
    return saved ? JSON.parse(saved) : null;
  });

  /* =========================================
     LOGIN (EMAIL BASED)
  ========================================= */

  const login = async (email, password) => {
    try {
      const res = await api.post("/accounts/login/", {
        email: email.trim(),
        password,
      });

      // 🔁 FORCE PASSWORD CHANGE
      if (res.data.force_password_change) {
        return {
          success: true,
          forcePasswordChange: true,
          message: res.data.message
        };
      }

      // ✅ NORMAL LOGIN
      const authUser = {
        id: res.data.user.id,
        username: res.data.user.username,   // still available from backend
        email: res.data.user.email,
        role: res.data.user.role.toUpperCase(),
        employeeProfileId: res.data.user.employee_profile_id,
        isAuthenticated: true,
      };

      localStorage.setItem("authUser", JSON.stringify(authUser));
      localStorage.setItem("accessToken", res.data.access);
      localStorage.setItem("refreshToken", res.data.refresh);

      setUser(authUser);

      return {
        success: true,
        role: authUser.role,
      };

    } catch (err) {

      console.log("LOGIN ERROR DATA:", err.response?.data);

      let message = "Invalid email or password";

      if (err.response?.data?.non_field_errors) {
        message = err.response.data.non_field_errors[0];
      }

      if (err.response?.data?.detail) {
        message = err.response.data.detail;
      }

      return {
        success: false,
        message,
      };
    }
  };

  /* =========================================
     LOGOUT
  ========================================= */

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        await api.post("/accounts/logout/", {
          refresh: refreshToken,
        });
      }
    } catch (err) {
      console.error("Logout error:", err);
    }

    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}