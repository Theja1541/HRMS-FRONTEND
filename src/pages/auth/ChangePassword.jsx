import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../auth/AuthContext";
import "../../styles/login.css";

export default function ChangePassword() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* =========================================
     OPTIONAL: Prevent direct access
  ========================================= */
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
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

    alert("Password changed successfully ✅");

    // 🔥 VERY IMPORTANT
    localStorage.clear();

    // After successful change
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);

    navigate("/dashboard", { replace: true });

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
    <div className="login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>Change Password</h2>
        <p className="login-subtitle">
          You must change your password before continuing
        </p>

        {error && (
          <div className="login-error">{error}</div>
        )}

        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button
          type="submit"
          className="login-btn"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
