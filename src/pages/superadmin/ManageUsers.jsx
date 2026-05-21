import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
  resetUserPassword,
  setUserBlock,
} from "../../api/users";
import "../../styles/pages.css";

const ROLE_LABELS = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Company Admin",
  HR: "HR Manager",
  EMPLOYEE: "Employee",
};

export default function ManageUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchUsers = async () => {
    try {
      const res = await getAllUsers();
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch {
      alert("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (id, newRole) => {
    if (id === currentUser?.id) return;
    setActionLoading(id);
    try {
      await updateUserRole(id, newRole);
      fetchUsers();
    } catch (e) {
      alert(e.response?.data?.error || "Failed to update role");
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetPassword = async (user) => {
    if (!window.confirm(`Send password reset email to ${user.email}?`)) return;
    setActionLoading(user.id);
    try {
      await resetUserPassword(user.id);
      alert("Temporary password sent to user's email.");
      fetchUsers();
    } catch (e) {
      alert(e.response?.data?.error || "Failed to send reset email");
    } finally {
      setActionLoading(null);
    }
  };

  const handleBlockToggle = async (user) => {
    if (user.id === currentUser?.id) return;
    const action = user.is_active ? "Block" : "Unblock";
    if (!window.confirm(`${action} user ${user.username}?`)) return;
    setActionLoading(user.id);
    try {
      await setUserBlock(user.id, !user.is_active);
      fetchUsers();
    } catch (e) {
      alert(e.response?.data?.error || `Failed to ${action.toLowerCase()} user`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (id === currentUser?.id) return;
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    setActionLoading(id);
    try {
      await deleteUser(id);
      fetchUsers();
    } catch (e) {
      alert(e.response?.data?.error || "Failed to delete user");
    } finally {
      setActionLoading(null);
    }
  };

  const companies = [...new Set(users.map((u) => u.company_name).filter(Boolean))].sort();

  const filteredUsers = users.filter((u) => {
    if (filterRole && u.role !== filterRole) return false;
    if (filterCompany && (u.company_name || "") !== filterCompany) return false;
    return true;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentPageSafe = Math.min(currentPage, totalPages || 1);
  const startIndex = (currentPageSafe - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const pageNumbers = Array.from({ length: Math.min(totalPages, 5) }, (_, idx) => {
    const start = Math.max(1, currentPageSafe - 2);
    return start + idx <= totalPages ? start + idx : null;
  }).filter(Boolean);

  // Reset to page 1 when filters change
  const handleFilterChange = (setter, value) => {
    setter(value);
    setCurrentPage(1);
  };

  const toggleActionMenu = (userId, buttonEl) => {
    if (openMenuId === userId) {
      setOpenMenuId(null);
      return;
    }

    const rect = buttonEl.getBoundingClientRect();
    const menuWidth = 180;
    const viewportPadding = 12;
    const maxLeft = window.innerWidth - menuWidth - viewportPadding;
    const nextLeft = Math.max(viewportPadding, Math.min(rect.right - menuWidth, maxLeft));

    setMenuPosition({
      top: rect.bottom + 6,
      left: nextLeft,
    });
    setOpenMenuId(userId);
  };

  const activeMenuUser = filteredUsers.find((u) => u.id === openMenuId) || null;
  const menuItemBaseStyle = {
    display: "block",
    width: "100%",
    textAlign: "left",
    border: "none",
    background: "transparent",
    padding: "8px 10px",
    borderRadius: 8,
    fontSize: 13,
    cursor: "pointer",
    marginBottom: 4,
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">User & Role Management</h2>
      </div>
      <p className="page-subtitle">
        View all users across the platform. Assign roles, reset passwords, and block or unblock access.
      </p>

      <div className="filters-row" style={{ marginTop: 16, marginBottom: 16 }}>
        <label style={{ marginRight: 8 }}>Role:</label>
        <select
          value={filterRole}
          onChange={(e) => handleFilterChange(setFilterRole, e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb" }}
        >
          <option value="">All roles</option>
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
          
        </select>
        <label style={{ marginLeft: 16, marginRight: 8 }}>Company:</label>
        <select
          value={filterCompany}
          onChange={(e) => handleFilterChange(setFilterCompany, e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb" }}
        >
          <option value="">All companies</option>
          {companies.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="card" style={{ marginTop: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="table-wrapper" style={{ overflowY: 'auto', overflowX: 'auto', maxHeight: 'calc(100vh - 320px)' }}>
          <table className="table" style={{ marginBottom: 0 }}>
            <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 5, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <tr>
                <th style={{ width: "20%" }}>User</th>
                <th style={{ width: "22%" }}>Email</th>
                <th style={{ width: "18%" }}>Company</th>
                <th style={{ width: "12%" }}>Role</th>
                <th style={{ width: "10%" }}>Status</th>
                <th style={{ width: "12%" }}>Permissions</th>
                <th style={{ width: "6%", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <strong>{user.username}</strong>
                </td>
                <td>{user.email}</td>
                <td>{user.company_name ?? "—"}</td>
                <td>{ROLE_LABELS[user.role] ?? user.role}</td>
                <td>
                  {!user.is_active ? (
                    <span style={{ color: "#b91c1c", fontWeight: 500 }}>Blocked</span>
                  ) : user.is_locked ? (
                    <span style={{ color: "#b45309", fontWeight: 500 }}>Locked</span>
                  ) : (
                    <span style={{ color: "#15803d", fontWeight: 500 }}>Active</span>
                  )}
                </td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={user.id === currentUser?.id || actionLoading === user.id}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: "1px solid #e5e7eb",
                      minWidth: 140,
                      width: "auto",
                      marginBottom: 0,
                    }}
                  >
                    {Object.entries(ROLE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </td>
                <td style={{ textAlign: "center" }}>
                  <button
                    type="button"
                    className="btn"
                    onClick={(e) => toggleActionMenu(user.id, e.currentTarget)}
                    disabled={actionLoading === user.id}
                    title="User actions"
                    aria-label="User actions"
                    style={{ padding: "6px 8px", fontSize: 18, lineHeight: 1, borderRadius: 6, minWidth: "auto" }}
                  >
                    ⋮
                  </button>
                </td>
              </tr>
            ))}
            {paginatedUsers.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "24px" }}>
                  <p className="muted-text">No users match the filters.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>

        {filteredUsers.length > 0 && (
          <div className="pagination" style={{ marginTop: 24 }}>
            <button
              className="page-btn"
              disabled={currentPageSafe === 1}
              onClick={() => setCurrentPage(currentPageSafe - 1)}
            >
              Previous
            </button>
            <div className="page-number-group">
              {pageNumbers.map((pg) => (
                <button
                  key={pg}
                  className={`page-btn ${pg === currentPageSafe ? "active" : ""}`}
                  onClick={() => setCurrentPage(pg)}
                >
                  {pg}
                </button>
              ))}
            </div>
            <span className="page-summary">Page {currentPageSafe} of {totalPages || 1}</span>
            <button
              className="page-btn"
              disabled={currentPageSafe >= totalPages}
              onClick={() => setCurrentPage(currentPageSafe + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {activeMenuUser && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 10 }}
            onClick={() => setOpenMenuId(null)}
            aria-hidden
          />
          <div
            style={{
              position: "fixed",
              top: menuPosition.top,
              left: menuPosition.left,
              width: 170,
              zIndex: 20,
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              padding: 6,
              boxShadow: "0 10px 24px rgba(15,23,42,0.14)",
            }}
          >
            <button
              type="button"
              style={menuItemBaseStyle}
              onClick={() => {
                setOpenMenuId(null);
                handleResetPassword(activeMenuUser);
              }}
              disabled={actionLoading === activeMenuUser.id}
            >
              Reset password
            </button>
            <button
              type="button"
              style={{
                ...menuItemBaseStyle,
                color: activeMenuUser.is_active ? "#b45309" : "#2563eb",
              }}
              onClick={() => {
                setOpenMenuId(null);
                handleBlockToggle(activeMenuUser);
              }}
              disabled={activeMenuUser.id === currentUser?.id || actionLoading === activeMenuUser.id}
            >
              {activeMenuUser.is_active ? "Block" : "Unblock"}
            </button>
            <button
              type="button"
              style={{
                ...menuItemBaseStyle,
                marginBottom: 0,
                background: "#ef4444",
                color: "#fff",
              }}
              onClick={() => {
                setOpenMenuId(null);
                handleDelete(activeMenuUser.id);
              }}
              disabled={activeMenuUser.id === currentUser?.id || actionLoading === activeMenuUser.id}
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}
