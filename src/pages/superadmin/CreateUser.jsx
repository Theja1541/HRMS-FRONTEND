import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { createUser } from "../../api/users";
import { getCompanies } from "../../api/companies";
import "../../styles/pages.css";
import "../../styles/createUser.css";

export default function CreateUser() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const companyIdFromUrl = searchParams.get("company_id");

  const [companies, setCompanies] = useState([]);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [companySearch, setCompanySearch] = useState("");
  const [touched, setTouched] = useState({});
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: companyIdFromUrl ? "ADMIN" : "EMPLOYEE",
    company_id: companyIdFromUrl ? String(companyIdFromUrl) : "",
    phone: "",
    department: "",
    admin_permissions: {
      manageUsers: true,
      managePayroll: true,
      manageLeaves: true,
    },
  });

  useEffect(() => {
    getCompanies()
      .then((res) => setCompanies(Array.isArray(res.data) ? res.data : []))
      .catch(() => setCompanies([]));
  }, []);

  useEffect(() => {
    if (companyIdFromUrl) {
      setForm((f) => ({
        ...f,
        company_id: String(companyIdFromUrl),
        role: f.role === "SUPER_ADMIN" ? "ADMIN" : f.role,
      }));
    }
  }, [companyIdFromUrl]);

  const handleChange = (e) => {
    setSubmitError("");
    const { name, value } = e.target;
    setForm((f) => {
      const next = { ...f, [name]: value };
      if (name === "role" && value === "SUPER_ADMIN") next.company_id = "";
      if (name === "role" && (value === "ADMIN" || value === "HR")) next.password = "";
      return next;
    });
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    if (!name) return;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handlePermissionToggle = (permissionKey) => {
    setForm((prev) => ({
      ...prev,
      admin_permissions: {
        ...prev.admin_permissions,
        [permissionKey]: !prev.admin_permissions[permissionKey],
      },
    }));
  };

  const usesTemporaryPassword = form.role === "ADMIN" || form.role === "HR";
  const companyRequired = form.role !== "SUPER_ADMIN";
  const needsManualPassword = !usesTemporaryPassword;
  const passwordValid = !needsManualPassword || form.password.length >= 8;
  const hasEmail =
    form.email.trim() || (form.username.trim() && form.username.trim().includes("@"));
  const emailToValidate =
    form.email.trim() || (form.username.trim().includes("@") ? form.username.trim() : "");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailValid = !emailToValidate || emailRegex.test(emailToValidate);
  const canSubmit =
    form.username.trim() &&
    hasEmail &&
    emailValid &&
    passwordValid &&
    (!needsManualPassword || form.password) &&
    (!companyRequired || (form.company_id && form.company_id !== ""));
  const companyOptions = companies.filter((c) => {
    if (!companySearch.trim()) return true;
    const query = companySearch.toLowerCase();
    return (
      c.name?.toLowerCase().includes(query) ||
      c.company_code?.toLowerCase().includes(query)
    );
  });
  const errors = {
    company_id: companyRequired && !form.company_id ? "Please select a company." : "",
    role: !form.role ? "Please select a role." : "",
    username: !form.username.trim() ? "Username is required." : "",
    email: !hasEmail
      ? "Email is required (or enter an email-style username)."
      : !emailValid
        ? "Please enter a valid email format."
        : "",
    password:
      needsManualPassword && (!form.password || form.password.length < 8)
        ? "Password must be at least 8 characters."
        : "",
  };
  const showError = (field) => (touched[field] || submitError) && errors[field];

  const doSave = async () => {
    if (saving) return;
    setSubmitError("");

    const username = form.username.trim();
    const emailRaw = form.email.trim();
    const email = emailRaw || (username.includes("@") ? username : "");

    if (!username) {
      setSubmitError("Please enter Username.");
      return;
    }
    if (!email) {
      setSubmitError("Please enter Email, or use an email-style Username (e.g. admin@company.com).");
      return;
    }
    if (!emailRegex.test(email)) {
      setSubmitError("Please enter a valid email format.");
      return;
    }
    if (companyRequired && (!form.company_id || form.company_id === "")) {
      setSubmitError("Please select a Company for this tenant user.");
      return;
    }
    if (needsManualPassword) {
      if (!form.password || form.password.length < 8) {
        setSubmitError("Please enter a Password (at least 8 characters).");
        return;
      }
    }

    const payload = {
      username,
      email,
      role: form.role,
    };
    if (needsManualPassword) payload.password = form.password;
    if (form.company_id) payload.company_id = parseInt(form.company_id, 10);

    setSaving(true);
    try {
      const res = await createUser(payload);
      const data = res?.data || {};
      const emailSent = data.temporary_password_email_sent === true;
      if (usesTemporaryPassword) {
        if (emailSent) {
          toast.success(
            `${form.role === "ADMIN" ? "Tenant Admin" : "HR user"} created and temporary password sent.`
          );
        } else {
          toast(
            `${form.role === "ADMIN" ? "Tenant Admin" : "HR user"} created. Email not sent; use Reset Password from Manage Users.`
          );
        }
      } else {
        toast.success("User created successfully.");
      }
      setForm({
        username: "",
        email: "",
        password: "",
        role: companyIdFromUrl ? "ADMIN" : "EMPLOYEE",
        company_id: companyIdFromUrl ? String(companyIdFromUrl) : "",
        phone: "",
        department: "",
        admin_permissions: {
          manageUsers: true,
          managePayroll: true,
          manageLeaves: true,
        },
      });
      navigate("/super-admin/manage-users", { replace: true });
    } catch (err) {
      const status = err.response?.status;
      const d = err.response?.data;
      let msg = "Error creating user.";
      if (status === 403 || status === 401) {
        msg = "Access denied. Please log in as Super Admin.";
      } else if (d && typeof d === "object") {
        const first =
          d.company_id?.[0] ?? d.username?.[0] ?? d.email?.[0] ?? d.password?.[0] ?? d.role?.[0] ?? d.error ?? d.detail;
        if (first) msg = Array.isArray(first) ? first[0] : String(first);
      } else if (err.message) {
        msg = err.message;
      }
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    doSave();
  };

  return (
    <div className="create-user-page">
      <div className="create-user-shell">
        <div className="create-user-header">
          <div>
            <h2 className="page-title create-user-title">👤 Create User / Tenant Admin</h2>
            <p className="page-subtitle" style={{ marginBottom: 0 }}>
              Super Admin can create platform or tenant users. Admins and HR users receive a temporary password via email and must change it on first login.
            </p>
          </div>
          <div className="create-user-header-actions">
            <button
              type="button"
              className="create-user-btn create-user-btn-secondary"
              onClick={() => navigate("/super-admin/manage-users")}
              disabled={saving}
            >
              ✕ Cancel
            </button>
            <button
              type="button"
              className="create-user-btn create-user-btn-primary"
              disabled={saving || !canSubmit}
              onClick={() => doSave()}
            >
              {saving ? (
                <span className="create-user-spinner-wrap">
                  <span className="create-user-spinner" aria-hidden />
                  Saving...
                </span>
              ) : (
                "✓ Save User"
              )}
            </button>
          </div>
        </div>
        {submitError && (
          <div className="create-user-error" role="alert">
            {submitError}
          </div>
        )}
        <div className="card create-user-card">
          <form id="create-user-form" onSubmit={handleSubmit}>
            <section className="create-user-section">
              <h3 className="create-user-section-title">📋 Basic Information</h3>

              <div className="create-user-field">
                <label htmlFor="company_id">
                  Company {companyRequired ? "*" : "(optional for Super Admin)"}
                </label>
                <input
                  id="company-search"
                  type="text"
                  placeholder="Search company..."
                  value={companySearch}
                  onChange={(e) => setCompanySearch(e.target.value)}
                  className="create-user-search"
                />
                <select
                  id="company_id"
                  name="company_id"
                  value={form.company_id}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required={companyRequired}
                >
                  <option value="">{companyRequired ? "Select Company" : "No company"}</option>
                  {companyOptions.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name} ({c.company_code})
                    </option>
                  ))}
                </select>
                {showError("company_id") && <p className="create-user-field-error">{errors.company_id}</p>}
              </div>

              <div className="create-user-field">
                <label htmlFor="username">Username *</label>
                <input
                  id="username"
                  name="username"
                  placeholder="Enter username"
                  value={form.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                {showError("username") && <p className="create-user-field-error">{errors.username}</p>}
              </div>

              <div className="create-user-field">
                <label htmlFor="email">Email *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="e.g. admin@company.com"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <p className="create-user-hint">If empty, username email will be used automatically.</p>
                {showError("email") && <p className="create-user-field-error">{errors.email}</p>}
              </div>

              <div className="create-user-grid">
                <div className="create-user-field">
                  <label htmlFor="phone">Phone Number (optional)</label>
                  <input
                    id="phone"
                    name="phone"
                    placeholder="Enter phone number"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="create-user-field">
                  <label htmlFor="department">Department (optional)</label>
                  <input
                    id="department"
                    name="department"
                    placeholder="e.g. Finance, HR"
                    value={form.department}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </section>

            <section className="create-user-section">
              <h3 className="create-user-section-title">🔐 Role & Access</h3>

              <div className="create-user-field">
                <label htmlFor="role">Role *</label>
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="ADMIN">Admin (Tenant Admin)</option>
                  <option value="HR">HR</option>
                  <option value="EMPLOYEE">Employee</option>
                </select>
              </div>

              {needsManualPassword ? (
                <div className="create-user-field">
                  <label htmlFor="password">Password * (min 8 characters)</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Min 8 characters"
                    value={form.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    minLength={8}
                  />
                  {showError("password") && <p className="create-user-field-error">{errors.password}</p>}
                </div>
              ) : (
                <div className="create-user-info">
                  A secure temporary password will be generated automatically and emailed to this{" "}
                  {form.role === "ADMIN" ? "Tenant Admin" : "HR user"}.
                </div>
              )}

              {form.role === "ADMIN" && (
                <div className="create-user-permission-card">
                  <p className="create-user-permission-title">Admin permissions</p>
                  <label className="create-user-checkbox">
                    <input
                      type="checkbox"
                      checked={form.admin_permissions.manageUsers}
                      onChange={() => handlePermissionToggle("manageUsers")}
                    />
                    <span>Manage users</span>
                  </label>
                  <label className="create-user-checkbox">
                    <input
                      type="checkbox"
                      checked={form.admin_permissions.managePayroll}
                      onChange={() => handlePermissionToggle("managePayroll")}
                    />
                    <span>Manage payroll</span>
                  </label>
                  <label className="create-user-checkbox">
                    <input
                      type="checkbox"
                      checked={form.admin_permissions.manageLeaves}
                      onChange={() => handlePermissionToggle("manageLeaves")}
                    />
                    <span>Manage leave workflows</span>
                  </label>
                </div>
              )}

              {form.role === "EMPLOYEE" && (
                <div className="create-user-info">
                  Employee role uses limited self-service access only.
                </div>
              )}
            </section>

            <button type="submit" style={{ display: "none" }} aria-hidden />
          </form>
        </div>
      </div>
    </div>
  );
}
