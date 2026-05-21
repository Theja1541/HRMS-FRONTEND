import { createContext, useContext, useState } from "react";
import api from "../api/axios";
import { clearSidebarBrandingCache } from "../utils/sidebarBrandingCache";

const AuthContext = createContext(null);
const VALID_ROLES = new Set(["SUPER_ADMIN", "ADMIN", "HR", "EMPLOYEE"]);

export function AuthProvider({ children }) {

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("authUser");
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      if (parsed?.role) {
        parsed.role = String(parsed.role).toUpperCase().trim();
      }
      if (!parsed?.role || !VALID_ROLES.has(parsed.role)) {
        localStorage.removeItem("authUser");
        return null;
      }
      return parsed;
    } catch {
      localStorage.removeItem("authUser");
      return null;
    }
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

      const data = res.data;

      // ── MFA required: don't store tokens yet ──────────────────
      if (data.mfa_required) {
        return {
          success: true,
          mfa_required: true,
          user_id: data.user_id,
          email: data.email,
        };
      }

      // ── Normal / Force password change flow ───────────────────
      return _finaliseLogin(data, res);

    } catch (err) {
      console.log("LOGIN ERROR DATA:", err.response?.data);
      const errorData = err.response?.data;
      let message = "Invalid email or password";
      if (errorData?.email)          message = errorData.email[0];
      else if (errorData?.password)  message = errorData.password[0];
      else if (errorData?.detail)    message = errorData.detail;
      return { success: false, message };
    }
  };

  /* =========================================
     COMPLETE LOGIN AFTER MFA
  ========================================= */

  const completeMfaLogin = (data) => {
    return _finaliseLogin(data, null);
  };

  /* =========================================
     SHARED LOGIN FINALISATION
  ========================================= */

  const _finaliseLogin = (data, _res) => {
    const authUser = {
      id: data.user.id,
      username: data.user.username,
      email: data.user.email,
      role: data.user.role.toUpperCase(),
      employeeProfileId: data.user.employee_profile_id,
      companyId: data.user.company_id ?? data.user.company?.id ?? null,
      company: data.user.company || null,
      isAuthenticated: true,
    };

    localStorage.setItem("authUser", JSON.stringify(authUser));
    localStorage.setItem("accessToken", data.access);
    localStorage.setItem("refreshToken", data.refresh);

    clearSidebarBrandingCache();
    setUser(authUser);

    return {
      success: true,
      role: authUser.role,
      forcePasswordChange: data.force_password_change,
    };
  };

  /* =========================================
     LOGOUT
  ========================================= */

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await api.post("/accounts/logout/", { refresh: refreshToken });
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
        completeMfaLogin,
        logout,
        isAuthenticated: !!(user && user.role),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}