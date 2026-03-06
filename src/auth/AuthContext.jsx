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

    const data = res.data;

    const authUser = {
      id: data.user.id,
      username: data.user.username,
      email: data.user.email,
      role: data.user.role.toUpperCase(),
      employeeProfileId: data.user.employee_profile_id,
      isAuthenticated: true,
    };

    localStorage.setItem("authUser", JSON.stringify(authUser));
    localStorage.setItem("accessToken", data.access);
    localStorage.setItem("refreshToken", data.refresh);

    setUser(authUser);

    return {
      success: true,
      role: authUser.role,
      forcePasswordChange: data.force_password_change, // convert naming here
    };

  } catch (err) {

    console.log("LOGIN ERROR DATA:", err.response?.data);

    const errorData = err.response?.data;

    let message = "Invalid email or password";

    if (errorData?.email) {
      message = errorData.email[0];
    } else if (errorData?.password) {
      message = errorData.password[0];
    } else if (errorData?.detail) {
      message = errorData.detail;
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