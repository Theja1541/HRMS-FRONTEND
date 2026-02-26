import { useEffect, useState } from "react";
import api from "../../api/axios";
import "../../styles/superadmin.css";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/accounts/all-users/");
      setUsers(res.data);
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
    try {
      await api.patch(`/accounts/update-role/${id}/`, {
        role: newRole,
      });
      fetchUsers();
    } catch {
      alert("Failed to update role");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      await api.delete(`/accounts/delete-user/${id}/`);
      fetchUsers();
    } catch {
      alert("Failed to delete user");
    }
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <div>
      <h2>Manage Users</h2>

      <table className="super-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Change Role</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>

              <td>
                <select
                  defaultValue={user.role}
                  onChange={(e) =>
                    handleRoleChange(user.id, e.target.value)
                  }
                >
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="ADMIN">Admin</option>
                  <option value="HR">HR</option>
                  <option value="EMPLOYEE">Employee</option>
                </select>
              </td>

              <td>
                <button
                  className="danger-btn"
                  onClick={() => handleDelete(user.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
