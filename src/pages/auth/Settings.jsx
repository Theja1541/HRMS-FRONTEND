import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../auth/AuthContext";
import { deleteCompanyLogo, getCompanyBranding, uploadCompanyLogo } from "../../api/companies";
import { useToast } from "../../context/ToastContext";
import BillingDashboard from "../../components/billing/BillingDashboard";
import "../../styles/settings.css";

export default function Settings() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const { logout, user } = useAuth();
  const { showToast } = useToast() || {};

  const [activeTab, setActiveTab] = useState(tabParam || "change-password");
  const canManageBranding = ["ADMIN", "HR", "SUPER_ADMIN"].includes(user?.role || "");
  const canViewSubscription = ["ADMIN", "HR"].includes(user?.role || "");

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
  const [branding, setBranding] = useState(null);
  const [brandingLoading, setBrandingLoading] = useState(false);
  const [brandingError, setBrandingError] = useState("");
  const [logoBusy, setLogoBusy] = useState(false);

  const companyName = branding?.name || user?.company?.name || "Company";
  const initials = useMemo(() => {
    const parts = String(companyName || "").trim().split(/\s+/).filter(Boolean);
    return (parts[0]?.[0] || "C") + (parts[1]?.[0] || "");
  }, [companyName]);

  const isSubscriptionExpired = useMemo(() => {
    if (!branding?.subscription_period_end) return false;
    const end = new Date(branding.subscription_period_end);
    const today = new Date();
    end.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return end < today;
  }, [branding?.subscription_period_end]);

  const formattedExpiryDate = useMemo(() => {
    if (!branding?.subscription_period_end) return "Lifetime / Ongoing";
    try {
      const date = new Date(branding.subscription_period_end);
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return branding.subscription_period_end;
    }
  }, [branding?.subscription_period_end]);

  const formattedPrice = useMemo(() => {
    if (!branding?.pricing_plan_price) return "—";
    const amount = Number(branding.pricing_plan_price) || 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: branding.pricing_plan_currency || "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  }, [branding?.pricing_plan_price, branding?.pricing_plan_currency]);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const brandingLogoUrl = branding?.logo_url || branding?.logoUrl || null;

  useEffect(() => {
    if (!canManageBranding) return;
    const fetchBranding = async () => {
      try {
        setBrandingLoading(true);
        setBrandingError("");
        const res = await getCompanyBranding();
        setBranding(res.data);
      } catch (err) {
        setBrandingError(err.response?.data?.detail || "Failed to load company branding");
      } finally {
        setBrandingLoading(false);
      }
    };
    fetchBranding();
  }, [canManageBranding]);

  const notify = (message, type = "success") => {
    if (showToast) {
      showToast({ message, type });
    } else {
      alert(message);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBrandingError("");

    const accepted = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"];
    if (!accepted.includes((file.type || "").toLowerCase())) {
      setBrandingError("Unsupported image type. Use PNG, JPG, JPEG, WebP, or SVG.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setBrandingError("File too large. Maximum size is 2MB.");
      return;
    }

    try {
      setLogoBusy(true);
      const formData = new FormData();
      formData.append("logo", file);
      const res = await uploadCompanyLogo(formData);
      setBranding(res.data);
      notify("Company logo updated successfully.");
    } catch (err) {
      setBrandingError(err.response?.data?.error || "Failed to upload logo");
    } finally {
      setLogoBusy(false);
      e.target.value = "";
    }
  };

  const handleLogoDelete = async () => {
    try {
      setLogoBusy(true);
      setBrandingError("");
      const res = await deleteCompanyLogo();
      setBranding(res.data);
      notify("Company logo removed successfully.");
    } catch (err) {
      setBrandingError(err.response?.data?.error || "Failed to remove logo");
    } finally {
      setLogoBusy(false);
    }
  };

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
    <div className={`settings-page ${activeTab === "subscription-plan" ? "billing-active" : ""}`}>
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
        {canManageBranding && (
          <button
            className={`tab ${activeTab === "company-branding" ? "active" : ""}`}
            onClick={() => setActiveTab("company-branding")}
          >
            Company Branding
          </button>
        )}
        {canViewSubscription && (
          <button
            className={`tab ${activeTab === "subscription-plan" ? "active" : ""}`}
            onClick={() => setActiveTab("subscription-plan")}
          >
            Subscription Plan
          </button>
        )}
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

        {activeTab === "company-branding" && canManageBranding && (
          <div className="settings-card">
            <h3>Company Logo</h3>
            <p className="card-subtitle">
              This logo is used on company payslips and branding documents.
            </p>
            {brandingError && <div className="alert alert-error">{brandingError}</div>}
            {brandingLoading ? (
              <p>Loading branding...</p>
            ) : (
              <>
                <div className="branding-preview-wrap">
                  {brandingLogoUrl ? (
                    <img src={brandingLogoUrl} alt={`${companyName} logo`} className="branding-preview" />
                  ) : (
                    <div className="branding-fallback">{initials.toUpperCase()}</div>
                  )}
                  <div className="branding-meta">
                    <strong>{companyName}</strong>
                    <small>Recommended: transparent PNG, up to 2MB.</small>
                  </div>
                </div>

                <div className="branding-actions">
                  <label className="btn btn-primary branding-upload-btn">
                    {logoBusy ? "Uploading..." : "Upload / Replace"}
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={handleLogoUpload}
                      hidden
                      disabled={logoBusy}
                    />
                  </label>
                  <button
                    type="button"
                    className="btn branding-delete-btn"
                    onClick={handleLogoDelete}
                    disabled={logoBusy || !brandingLogoUrl}
                  >
                    Delete Logo
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "subscription-plan" && canViewSubscription && (
          <BillingDashboard />
        )}
      </div>
    </div>
  );
}
