import { useEffect, useMemo, useState } from "react";
import { createCompanyUser, getCompanyUsers } from "../api/users";
import { useAuth } from "../auth/AuthContext";
import "../styles/pages.css";

const ROLE_LABELS = {
  ADMIN: "Company Admin",
  HR: "HR",
};

function formatDate(value) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleString();
}

export default function CompanyUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  const companyName = user?.company?.name || "your company";

  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => (a.role > b.role ? 1 : -1)),
    [users]
  );

  const fetchUsers = async () => {
    try {
      const res = await getCompanyUsers();
      setUsers(Array.isArray(res.data) ? res.data : []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load company users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    setSaving(true);
    setError("");

    try {
      const payload = {
        role: "HR",
        email: form.email.trim(),
        username: form.email.trim().toLowerCase(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
      };

      await createCompanyUser(payload);
      alert("HR user created successfully. A temporary password has been emailed.");
      setForm({
        first_name: "",
        last_name: "",
        email: "",
      });
      fetchUsers();
    } catch (err) {
      const data = err.response?.data || {};
      const firstError =
        data.email?.[0] ||
        data.role?.[0] ||
        data.error ||
        data.detail ||
        "Failed to create HR user.";
      setError(firstError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Company Users</h2>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Manage Admin and HR users for <strong>{companyName}</strong>. HR has the same
            operational portal access as Admin, but remains scoped to this company only.
          </p>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            marginTop: 12,
            padding: "12px 16px",
            borderRadius: 10,
            background: "#fef2f2",
            color: "#b91c1c",
            fontSize: 14,
          }}
        >
          {error}
        </div>
      )}

      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Create HR User</h3>
        <form
          onSubmit={handleSubmit}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}
        >
          <div>
            <label>First name</label>
            <input
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              placeholder="First name"
            />
          </div>
          <div>
            <label>Last name</label>
            <input
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              placeholder="Last name"
            />
          </div>
          <div>
            <label>Email *</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="hr@company.com"
              required
            />
          </div>
          <div style={{ alignSelf: "end" }}>
            <button type="submit" className="btn primary" disabled={saving}>
              {saving ? "Creating..." : "Create HR User"}
            </button>
          </div>
        </form>
        <p className="muted-text" style={{ marginTop: 12 }}>
          A temporary password is generated automatically and sent to the HR user's email.
        </p>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Admin and HR Directory</h3>
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((companyUser) => (
                <tr key={companyUser.id}>
                  <td>
                    {`${companyUser.first_name || ""} ${companyUser.last_name || ""}`.trim() ||
                      companyUser.username}
                  </td>
                  <td>{companyUser.email}</td>
                  <td>{ROLE_LABELS[companyUser.role] || companyUser.role}</td>
                  <td>{companyUser.is_active ? "Active" : "Inactive"}</td>
                  <td>{formatDate(companyUser.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && sortedUsers.length === 0 && (
          <p className="muted-text" style={{ marginBottom: 0 }}>
            No Admin or HR users found for this company yet.
          </p>
        )}
      </div>
    </div>
  );
}
