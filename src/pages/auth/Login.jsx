import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import api from "../../api/axios";
import { mfaSendOtp, mfaVerifyOtp } from "../../api/superadmin";
import "../../styles/login.css";
import companyLogo from "../../assets/company-logo.png";

export default function Login() {
  const { login, completeMfaLogin } = useAuth();
  const navigate = useNavigate();

  // ── Step 1: Credentials ──────────────────────────────
  const [username, setUsername] = useState(() => localStorage.getItem("rememberedEmail") || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem("rememberedEmail"));

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

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", username.trim());
      } else {
        localStorage.removeItem("rememberedEmail");
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
    <div className="login-page-wrapper">
      <div className="login-sidebar">
        <div className="sidebar-content">
          <h1>Welcome to HRMS</h1>
          <p>Empowering your workforce with intelligent management, seamless collaboration, and advanced analytics.</p>
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
          <h2>Welcome Back</h2>
          <p className="login-subtitle">Sign in to access your workspace</p>

          {error && (
            <div className="login-error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <span>{error}</span>
            </div>
          )}

          <div className="input-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              <input
                type="text"
                placeholder="name@company.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="form-actions">
            <label className="remember-me">
              <input 
                type="checkbox" 
                checked={rememberMe} 
                onChange={(e) => setRememberMe(e.target.checked)} 
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              className="forgot-password-link"
              onClick={() => setShowForgotPassword(true)}
            >
              Forgot Password?
            </button>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <span className="loader"></span> : "Sign In"}
          </button>
        </form>

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="modal-overlay" onClick={() => setShowForgotPassword(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={() => setShowForgotPassword(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
              
              <div className="modal-header-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>
              </div>
              <h3>Reset Password</h3>
              <p className="modal-subtitle">
                Enter your registered email to receive a temporary password.
              </p>

              <form onSubmit={handleForgotPassword} className="forgot-form">
                {forgotError && (
                  <div className="login-error">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <span>{forgotError}</span>
                  </div>
                )}
                {forgotSuccess && (
                  <div className="login-success">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    <span>{forgotSuccess}</span>
                  </div>
                )}
                
                <div className="input-group">
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    <input
                      type="email"
                      placeholder="name@company.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>
                
                <button type="submit" className="login-btn mt-4" disabled={forgotLoading}>
                  {forgotLoading ? <span className="loader"></span> : "Send Reset Link"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
