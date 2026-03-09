import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../auth/AuthContext";
import "../../styles/settings.css";

export default function Settings() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [activeTab, setActiveTab] = useState("change-password");

  // Change Password State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changeError, setChangeError] = useState("");
  const [changeSuccess, setChangeSuccess] = useState("");
  const [changeLoading, setChangeLoading] = useState(false);

  // Forgot Password State
  const [email, setEmail] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  // ==================== CHANGE PASSWORD ====================
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangeError("");
    setChangeSuccess("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setChangeError("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setChangeError("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setChangeError("Password must be at least 6 characters");
      return;
    }

    try {
      setChangeLoading(true);

      await api.post("/accounts/change-password-with-old/", {
        old_password: oldPassword,
        new_password: newPassword,
      });

      setChangeSuccess("Password changed successfully! Redirecting to login...");
      
      setTimeout(() => {
        logout();
        navigate("/login");
      }, 2000);

    } catch (err) {
      setChangeError(
        err.response?.data?.error || "Failed to change password"
      );
    } finally {
      setChangeLoading(false);
    }
  };

  // ==================== FORGOT PASSWORD ====================
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");

    if (!email) {
      setForgotError("Email is required");
      return;
    }

    try {
      setForgotLoading(true);

      await api.post("/accounts/forgot-password/", { email });

      setForgotSuccess(
        "Temporary password sent to your email. Please check your inbox."
      );
      setEmail("");

    } catch (err) {
      setForgotError(
        err.response?.data?.error || "Failed to send temporary password"
      );
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h2>Settings</h2>
        <p>Manage your account settings and password</p>
      </div>

      <div className="settings-tabs">
        <button
          className={`tab ${activeTab === "change-password" ? "active" : ""}`}
          onClick={() => setActiveTab("change-password")}
        >
          Change Password
        </button>
        <button
          className={`tab ${activeTab === "forgot-password" ? "active" : ""}`}
          onClick={() => setActiveTab("forgot-password")}
        >
          Forgot Password
        </button>
      </div>

      <div className="settings-content">
        {/* ==================== CHANGE PASSWORD TAB ==================== */}
        {activeTab === "change-password" && (
          <div className="settings-card">
            <h3>Change Password</h3>
            <p className="card-subtitle">
              Enter your old password and choose a new one
            </p>

            {changeError && (
              <div className="alert alert-error">{changeError}</div>
            )}

            {changeSuccess && (
              <div className="alert alert-success">{changeSuccess}</div>
            )}

            <form onSubmit={handleChangePassword}>
              <div className="form-field">
                <label>Old Password *</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter your current password"
                />
              </div>

              <div className="form-field">
                <label>New Password *</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>

              <div className="form-field">
                <label>Confirm New Password *</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={changeLoading}
              >
                {changeLoading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        )}

        {/* ==================== FORGOT PASSWORD TAB ==================== */}
        {activeTab === "forgot-password" && (
          <div className="settings-card">
            <h3>Forgot Password</h3>
            <p className="card-subtitle">
              Enter your email to receive a temporary password
            </p>

            {forgotError && (
              <div className="alert alert-error">{forgotError}</div>
            )}

            {forgotSuccess && (
              <div className="alert alert-success">{forgotSuccess}</div>
            )}

            <form onSubmit={handleForgotPassword}>
              <div className="form-field">
                <label>Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={forgotLoading}
              >
                {forgotLoading ? "Sending..." : "Send Temporary Password"}
              </button>
            </form>

            <div className="info-box">
              <p>
                📧 You will receive a temporary password via email. Use it to
                login, and you'll be prompted to change your password.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
