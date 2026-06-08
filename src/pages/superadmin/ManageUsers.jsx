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
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterRole, filterCompany, itemsPerPage]);

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
    if (!window.confirm(`Are you sure you want to change this user's role to ${ROLE_LABELS[newRole] ?? newRole}?`)) return;
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

  // removed early return to prevent layout thrashing

  return (
    <div className="manage-users-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">User & Role Management</h2>
          <p className="page-subtitle">
            View all users across the platform. Assign roles, reset passwords, and block or unblock access.
          </p>
        </div>
      </div>

      <div className="filters-row" style={{ marginTop: 16, marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 200px' }}>
          <label style={{ margin: 0 }}>Role:</label>
          <select
            value={filterRole}
            onChange={(e) => handleFilterChange(setFilterRole, e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb", flex: 1, minWidth: 0 }}
          >
            <option value="">All roles</option>
            {Object.entries(ROLE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 200px' }}>
          <label style={{ margin: 0 }}>Company:</label>
          <select
            value={filterCompany}
            onChange={(e) => handleFilterChange(setFilterCompany, e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb", flex: 1, minWidth: 0 }}
          >
            <option value="">All companies</option>
            {companies.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card" style={{ marginTop: 24, display: 'flex', flexDirection: 'column', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', background: '#fff', border: '1px solid #f1f5f9', padding: 0 }}>
        <div className="responsive-table-container" style={{ width: '100%', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'left' }}>
            <thead style={{ background: 'linear-gradient(90deg, #f8fafc, #f1f5f9)', borderBottom: '2px solid #e2e8f0' }}>
              <tr>
                <th style={{ width: "20%", padding: "16px 24px", color: "#475569", fontWeight: "600", fontSize: "14px", textTransform: 'uppercase', letterSpacing: '0.05em' }}>User</th>
                <th style={{ width: "22%", padding: "16px", color: "#475569", fontWeight: "600", fontSize: "14px", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</th>
                <th style={{ width: "18%", padding: "16px", color: "#475569", fontWeight: "600", fontSize: "14px", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company</th>
                <th style={{ width: "12%", padding: "16px", color: "#475569", fontWeight: "600", fontSize: "14px", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
                <th style={{ width: "10%", padding: "16px", color: "#475569", fontWeight: "600", fontSize: "14px", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ width: "12%", padding: "16px", color: "#475569", fontWeight: "600", fontSize: "14px", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Permissions</th>
                <th style={{ width: "6%", padding: "16px 24px", textAlign: "center", color: "#475569", fontWeight: "600", fontSize: "14px", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "48px 24px", color: "#94a3b8" }}>Loading users...</td>
                </tr>
              ) : paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
              <tr 
                key={user.id} 
                style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 2px 4px rgba(37,99,235,0.2)' }}>
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <strong style={{ color: '#1e293b', fontSize: '15px' }}>{user.username}</strong>
                  </div>
                </td>
                <td style={{ padding: "16px", color: '#475569' }}>{user.email}</td>
                <td style={{ padding: "16px", color: '#475569', fontWeight: '500' }}>{user.company_name ?? "—"}</td>
                <td style={{ padding: "16px", color: '#475569' }}>
                  <span style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap' }}>
                    {ROLE_LABELS[user.role] ?? user.role}
                  </span>
                </td>
                <td style={{ padding: "16px" }}>
                  {!user.is_active ? (
                    <span style={{ background: "#fef2f2", color: "#dc2626", padding: "6px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#dc2626' }}></span> Blocked
                    </span>
                  ) : user.is_locked ? (
                    <span style={{ background: "#fffbeb", color: "#d97706", padding: "6px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#d97706' }}></span> Locked
                    </span>
                  ) : (
                    <span style={{ background: "#f0fdf4", color: "#16a34a", padding: "6px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }}></span> Active
                    </span>
                  )}
                </td>
                <td style={{ padding: "16px" }}>
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
                <td style={{ padding: "16px 24px", textAlign: "center" }}>
                  <button
                    type="button"
                    onClick={(e) => toggleActionMenu(user.id, e.currentTarget)}
                    disabled={actionLoading === user.id}
                    title="User actions"
                    aria-label="User actions"
                    style={{ 
                      padding: "8px", 
                      fontSize: 18, 
                      lineHeight: 1, 
                      borderRadius: '8px', 
                      background: 'transparent', 
                      border: 'none', 
                      cursor: 'pointer', 
                      color: '#64748b',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
                      >
                        ⋮
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "48px 24px" }}>
                    <div style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '8px' }}>No users match the filters.</div>
                    <div style={{ color: '#cbd5e1', fontSize: '14px' }}>Try adjusting your search criteria</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredUsers.length > 0 && (
          <div className="attendance-pagination-container" style={{ margin: 0, borderTop: '1px solid #e2e8f0', borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
            <div className="pagination-left">
              <span>Show</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="items-per-page-select"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>entries per page</span>
            </div>

            <div className="pagination-right">
              <button
                className="page-btn"
                disabled={currentPageSafe === 1}
                onClick={() => setCurrentPage(currentPageSafe - 1)}
              >
                Previous
              </button>
              <div className="page-number-group" style={{ display: 'flex', gap: '4px' }}>
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
              <span className="page-summary">Page {currentPageSafe} of {totalPages}</span>
              <button
                className="page-btn"
                disabled={currentPageSafe >= totalPages}
                onClick={() => setCurrentPage(currentPageSafe + 1)}
              >
                Next
              </button>
            </div>
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
