import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import "../../styles/login.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter username and password");
      return;
    }

    try {
      setLoading(true);

      const result = await login(username.trim(), password.trim());

      if (!result.success) {
        setError(result.message || "Invalid credentials");
        return;
      }

      /* =========================================
         🔐 FORCE PASSWORD CHANGE FLOW
      ========================================= */

      if (result.forcePasswordChange) {
        navigate("/change-password", {
          state: { username, password }
        });
        return;
      }


      /* =========================================
         🎯 ROLE BASED REDIRECT
      ========================================= */

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
      </form>
    </div>
  );
}
