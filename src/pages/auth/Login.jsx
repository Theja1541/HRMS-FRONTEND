import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import api from "../../api/axios";
import "../../styles/login.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot Password State
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (loading) return;   // 🔥 prevent double submit

  setError("");

  if (!username.trim() || !password.trim()) {
    setError("Please enter username and password");
    return;
  }

  try {
    setLoading(true);

    const result = await login(username.trim(), password.trim());
    console.log("LOGIN RESULT:", result);

    if (result.forcePasswordChange) {
      // console.log("Redirecting to change-password page...");
      navigate("/change-password", {
        state: { username, password }
      });
      return;
    }
    console.log("Navigating to change password...");

    if (!result.success) {
      setError(result.message || "Invalid credentials");
      return;
    }

    const role = result.role?.toUpperCase();

    switch (role) {
      case "SUPER_ADMIN":
        navigate("/super-admin/dashboard", { replace: true });
        break;
      case "ADMIN":
      case "HR":
        navigate("/dashboard", { replace: true });
        break;
      case "EMPLOYEE":
        navigate("/employee/dashboard", { replace: true });
        break;
      default:
        navigate("/unauthorized", { replace: true });
    }

  } catch (err) {
    console.error("Login error:", err);
    setError("Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};

  // Handle Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");

    if (!forgotEmail.trim()) {
      setForgotError("Please enter your email");
      return;
    }

    try {
      setForgotLoading(true);

      await api.post("/accounts/forgot-password/", {
        email: forgotEmail.trim()
      });

      setForgotSuccess("Temporary password sent to your email!");
      setForgotEmail("");

      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotSuccess("");
      }, 3000);

    } catch (err) {
      setForgotError(
        err.response?.data?.error || "Failed to send temporary password"
      );
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>HRMS Login</h2>
        <p className="login-subtitle">
          Sign in to access your dashboard
        </p>

        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="login-btn"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        <button
          type="button"
          className="forgot-password-link"
          onClick={() => setShowForgotPassword(true)}
        >
          Forgot Password?
        </button>
      </form>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="modal-overlay" onClick={() => setShowForgotPassword(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Forgot Password</h3>
              <button
                className="modal-close"
                onClick={() => setShowForgotPassword(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleForgotPassword}>
              <p className="modal-subtitle">
                Enter your registered email to receive a temporary password
              </p>

              {forgotError && (
                <div className="login-error">{forgotError}</div>
              )}

              {forgotSuccess && (
                <div className="login-success">{forgotSuccess}</div>
              )}

              <input
                type="email"
                placeholder="Enter your email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                autoFocus
              />

              <button
                type="submit"
                className="login-btn"
                disabled={forgotLoading}
              >
                {forgotLoading ? "Sending..." : "Send Temporary Password"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
