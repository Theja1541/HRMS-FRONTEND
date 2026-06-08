import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../auth/AuthContext";
import "../../styles/login.css";
import companyLogo from "../../assets/company-logo.png";

export default function ChangePassword() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* =========================================
     OPTIONAL: Prevent direct access
  ========================================= */

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (!newPassword || !confirmPassword) {
    setError("All fields are required");
    return;
  }

  if (newPassword !== confirmPassword) {
    setError("Passwords do not match");
    return;
  }

  try {
    setLoading(true);

    await api.post("/accounts/change-password/", {
      new_password: newPassword,
    });

    alert("Password changed successfully. Taking you to your dashboard.");

    // Redirect to role-based dashboard (keep session; no re-login)
    const role = (authUser?.role || "").toUpperCase();
    if (role === "SUPER_ADMIN") {
      navigate("/super-admin/dashboard", { replace: true });
    } else if (role === "ADMIN" || role === "HR") {
      navigate("/dashboard", { replace: true });
    } else if (role === "EMPLOYEE") {
      navigate("/employee/dashboard", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }

  } catch (err) {
    setError(
      err.response?.data?.error ||
      "Failed to change password"
    );
  } finally {
    setLoading(false);
  }
};



  return (
    <div className="login-page-wrapper">
      <div className="login-sidebar">
        <div className="sidebar-content">
          <h1>Secure Your Account</h1>
          <p>Update your password with a strong, secure phrase to protect your workspace and HRMS data.</p>
          <div className="sidebar-decoration">
            <div className="glass-card card-1">
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
            </div>
            <div className="glass-card card-2">
              <div className="user-avatar"></div>
              <div className="skeleton-line"></div>
            </div>
            <div className="circle circle-1"></div>
            <div className="circle circle-2"></div>
          </div>
        </div>
      </div>
      
      <div className="login-container">
        <form className="login-card" onSubmit={handleSubmit}>
          <div className="brand-logo" style={{ background: "transparent", border: "none", display: "flex", justifyContent: "center", marginBottom: "16px" }}>
            <img src={companyLogo} alt="HRMS Logo" style={{ height: "80px", objectFit: "contain" }} />
          </div>
          <h2>Change Password</h2>
          <p className="login-subtitle">
            You must change your password before continuing
          </p>

          {error && (
            <div className="login-error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <span>{error}</span>
            </div>
          )}

          <div className="input-group">
            <label>New Password</label>
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? <span className="loader"></span> : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
