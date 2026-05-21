import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import api from "../../api/axios";
import { mfaSendOtp, mfaVerifyOtp } from "../../api/superadmin";
import "../../styles/login.css";

export default function Login() {
  const { login, completeMfaLogin } = useAuth();
  const navigate = useNavigate();

  // ── Step 1: Credentials ──────────────────────────────
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Step 2: MFA OTP ──────────────────────────────────
  const [mfaStep, setMfaStep] = useState(false);
  const [mfaUserId, setMfaUserId] = useState(null);
  const [mfaEmail, setMfaEmail] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [mfaError, setMfaError] = useState("");
  const [mfaLoading, setMfaLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef([]);

  // ── Forgot Password ───────────────────────────────────
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  /* ─────────────────────────────────────────────────────
     STEP 1: Submit credentials
  ───────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      const result = await login(username.trim(), password.trim());
      console.log("LOGIN RESULT:", result);

      if (!result.success) {
        setError(result.message || "Invalid credentials");
        return;
      }

      // ── MFA required ──────────────────────────────────
      if (result.mfa_required) {
        setMfaUserId(result.user_id);
        setMfaEmail(result.email);
        // Auto-send OTP immediately
        try {
          const r = await mfaSendOtp(result.user_id);
          setMaskedEmail(r.data.masked_email || result.email);
        } catch {
          setMaskedEmail(result.email);
        }
        setMfaStep(true);
        setResendCooldown(60);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
        return;
      }

      // ── Force password change ─────────────────────────
      if (result.forcePasswordChange) {
        navigate("/change-password", { state: { username, password } });
        return;
      }

      _navigateByRole(result.role);
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────────────────────────────────────────────
     STEP 2: OTP input helpers
  ───────────────────────────────────────────────────── */
  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setMfaError("");
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length > 0) {
      const next = [...otp];
      for (let i = 0; i < 6; i++) next[i] = pasted[i] || "";
      setOtp(next);
      otpRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
    e.preventDefault();
  };

  /* ─────────────────────────────────────────────────────
     STEP 2: Verify OTP
  ───────────────────────────────────────────────────── */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (mfaLoading) return;
    const rawOtp = otp.join("");
    if (rawOtp.length !== 6) {
      setMfaError("Please enter the complete 6-digit code.");
      return;
    }

    try {
      setMfaLoading(true);
      setMfaError("");
      const res = await mfaVerifyOtp(mfaUserId, rawOtp);
      const data = res.data;

      const result = completeMfaLogin(data);

      if (result.forcePasswordChange) {
        navigate("/change-password", { state: { username, password } });
        return;
      }
      _navigateByRole(result.role);
    } catch (err) {
      const msg = err.response?.data?.error || "Invalid code. Please try again.";
      setMfaError(msg);
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setMfaLoading(false);
    }
  };

  /* ─────────────────────────────────────────────────────
     STEP 2: Resend OTP
  ───────────────────────────────────────────────────── */
  const handleResend = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    try {
      setResendLoading(true);
      setMfaError("");
      const r = await mfaSendOtp(mfaUserId);
      setMaskedEmail(r.data.masked_email || mfaEmail);
      setOtp(["", "", "", "", "", ""]);
      setResendCooldown(60);
      otpRefs.current[0]?.focus();
    } catch {
      setMfaError("Failed to resend code. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  /* ─────────────────────────────────────────────────────
     Forgot password
  ───────────────────────────────────────────────────── */
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
      await api.post("/accounts/forgot-password/", { email: forgotEmail.trim() });
      setForgotSuccess("Temporary password sent to your email!");
      setForgotEmail("");
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotSuccess("");
      }, 3000);
    } catch (err) {
      setForgotError(err.response?.data?.error || "Failed to send temporary password");
    } finally {
      setForgotLoading(false);
    }
  };

  const _navigateByRole = (role) => {
    switch (role?.toUpperCase()) {
      case "SUPER_ADMIN": navigate("/super-admin/dashboard", { replace: true }); break;
      case "ADMIN":
      case "HR":          navigate("/dashboard", { replace: true }); break;
      case "EMPLOYEE":    navigate("/employee/dashboard", { replace: true }); break;
      default:            navigate("/unauthorized", { replace: true });
    }
  };

  /* ─────────────────────────────────────────────────────
     RENDER: OTP Screen
  ───────────────────────────────────────────────────── */
  if (mfaStep) {
    return (
      <div className="login-container">
        <form className="login-card" onSubmit={handleVerifyOtp} style={{ maxWidth: 420 }}>
          {/* Shield icon */}
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, margin: "0 auto 16px",
          }}>
            🔐
          </div>

          <h2 style={{ textAlign: "center", marginBottom: 6 }}>Two-Factor Authentication</h2>
          <p style={{ textAlign: "center", color: "#64748b", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
            We sent a 6-digit verification code to<br />
            <strong style={{ color: "#0f172a" }}>{maskedEmail}</strong>
          </p>

          {mfaError && (
            <div className="login-error" style={{ textAlign: "center" }}>{mfaError}</div>
          )}

          {/* OTP Input Boxes */}
          <div style={{
            display: "flex", gap: 10, justifyContent: "center", marginBottom: 24,
          }}
            onPaste={handleOtpPaste}
          >
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (otpRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                style={{
                  width: 48, height: 56, textAlign: "center",
                  fontSize: 22, fontWeight: 700, borderRadius: 10,
                  border: `2px solid ${digit ? "#2563eb" : "#cbd5e1"}`,
                  outline: "none", background: digit ? "#eff6ff" : "#fff",
                  color: "#1e3a8a", transition: "border-color 0.15s, background 0.15s",
                  caretColor: "transparent",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                onBlur={(e) => (e.target.style.borderColor = digit ? "#2563eb" : "#cbd5e1")}
              />
            ))}
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={mfaLoading || otp.join("").length !== 6}
          >
            {mfaLoading ? "Verifying..." : "Verify & Login"}
          </button>

          {/* Resend */}
          <div style={{ textAlign: "center", marginTop: 16 }}>
            {resendCooldown > 0 ? (
              <span style={{ color: "#94a3b8", fontSize: 13 }}>
                Resend code in {resendCooldown}s
              </span>
            ) : (
              <button
                type="button"
                className="forgot-password-link"
                onClick={handleResend}
                disabled={resendLoading}
              >
                {resendLoading ? "Sending..." : "Resend verification code"}
              </button>
            )}
          </div>

          {/* Back to login */}
          <div style={{ textAlign: "center", marginTop: 10 }}>
            <button
              type="button"
              className="forgot-password-link"
              onClick={() => {
                setMfaStep(false);
                setOtp(["", "", "", "", "", ""]);
                setMfaError("");
              }}
            >
              ← Back to login
            </button>
          </div>
        </form>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────
     RENDER: Normal Login Screen
  ───────────────────────────────────────────────────── */
  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>HRMS Login</h2>
        <p className="login-subtitle">Sign in to access your dashboard</p>

        {error && <div className="login-error">{error}</div>}

        <input
          type="text"
          placeholder="Email address"
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

        <button type="submit" className="login-btn" disabled={loading}>
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
              <button className="modal-close" onClick={() => setShowForgotPassword(false)}>×</button>
            </div>
            <form onSubmit={handleForgotPassword}>
              <p className="modal-subtitle">
                Enter your registered email to receive a temporary password
              </p>
              {forgotError && <div className="login-error">{forgotError}</div>}
              {forgotSuccess && <div className="login-success">{forgotSuccess}</div>}
              <input
                type="email"
                placeholder="Enter your email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                autoFocus
              />
              <button type="submit" className="login-btn" disabled={forgotLoading}>
                {forgotLoading ? "Sending..." : "Send Temporary Password"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
