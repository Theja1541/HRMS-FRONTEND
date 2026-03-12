import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useEmployees } from "../../context/EmployeesContext";
import "../../styles/employees.css";

export default function Employees() {
  const navigate = useNavigate();

  const {
    employees,
    count,
    page,
    search,
    department,
    role,
    loading,
    setSearch,
    setDepartment,
    setRole,
    fetchEmployees,
    deactivateEmployee,
  } = useEmployees();

  const [showDeactivated, setShowDeactivated] = useState(false);
  const [deactivatedEmployees, setDeactivatedEmployees] = useState([]);
  const [loadingDeactivated, setLoadingDeactivated] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [roles, setRoles] = useState([]);
  const [newRole, setNewRole] = useState("");
  const [availableRoles, setAvailableRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [newDepartment, setNewDepartment] = useState("");
  const [availableDepartments, setAvailableDepartments] = useState([]);

  const totalPages = Math.ceil(count / 10);

  useEffect(() => {
    fetchEmployees(1, search, department, role);
  }, [search, department, role]);

  useEffect(() => {
    fetchAvailableRoles();
    fetchAvailableDepartments();
  }, []);

  const fetchAvailableRoles = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://127.0.0.1:8000/api/employees/roles/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setAvailableRoles(data.roles || []);
    } catch (err) {
      console.error('Failed to fetch available roles', err);
    }
  };

  const fetchAvailableDepartments = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://127.0.0.1:8000/api/employees/departments/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setAvailableDepartments(data.departments || []);
    } catch (err) {
      console.error('Failed to fetch available departments', err);
    }
  };

  const fetchDeactivatedEmployees = async () => {
    try {
      setLoadingDeactivated(true);
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://127.0.0.1:8000/api/employees/?is_active=false', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setDeactivatedEmployees(data.results || []);
      setShowDeactivated(true);
    } catch (err) {
      console.error('Failed to fetch deactivated employees', err);
    } finally {
      setLoadingDeactivated(false);
    }
  };

  const activateEmployee = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');

      await fetch(`http://127.0.0.1:8000/api/employees/${id}/activate/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      fetchDeactivatedEmployees();
      fetchEmployees(page, search, department, role);

    } catch (err) {
      console.error('Failed to activate employee', err);
    }
  };

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://127.0.0.1:8000/api/employees/roles/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setRoles(data.roles || []);
    } catch (err) {
      console.error('Failed to fetch roles', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://127.0.0.1:8000/api/employees/departments/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setDepartments(data.departments || []);
    } catch (err) {
      console.error('Failed to fetch departments', err);
    }
  };

  const addRole = async () => {
    if (!newRole.trim()) return;
    try {
      const token = localStorage.getItem('accessToken');
      await fetch('http://127.0.0.1:8000/api/employees/roles/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });
      setNewRole("");
      fetchRoles();
      fetchAvailableRoles();
    } catch (err) {
      console.error('Failed to add role', err);
    }
  };

  const addDepartment = async () => {
    if (!newDepartment.trim()) return;
    try {
      const token = localStorage.getItem('accessToken');
      await fetch('http://127.0.0.1:8000/api/employees/departments/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ department: newDepartment })
      });
      setNewDepartment("");
      fetchDepartments();
      fetchAvailableDepartments();
    } catch (err) {
      console.error('Failed to add department', err);
    }
  };

  const deleteRole = async (role) => {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`http://127.0.0.1:8000/api/employees/roles/${role}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchRoles();
      fetchAvailableRoles();
    } catch (err) {
      console.error('Failed to delete role', err);
    }
  };

  const deleteDepartment = async (dept) => {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`http://127.0.0.1:8000/api/employees/departments/${dept}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchDepartments();
      fetchAvailableDepartments();
    } catch (err) {
      console.error('Failed to delete department', err);
    }
  };

  return (
    <div className="employees-page">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Employees</h2>
          <p className="page-subtitle">Manage your workforce</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="settings-btn"
            onClick={() => {
              setShowSettings(true);
              fetchRoles();
              fetchDepartments();
            }}
          >
            ⚙️ Settings
          </button>
          <button
            className="add-employee-btn"
            onClick={() => navigate("/employees/add")}
          >
            + Add Employee
          </button>
        </div>
      </div>

      {/* SEARCH + FILTER */}
      <div className="filter-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Search by name, email, ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="filter-select"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          <option value="">All Departments</option>
          {availableDepartments.map((dept, index) => (
            <option key={index} value={dept}>{dept}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">All Roles</option>
          {availableRoles.map((r, index) => (
            <option key={index} value={r}>{r}</option>
          ))}
        </select>
      </div>


      {/* TABLE */}
      <div className="table-wrapper">
        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : employees.length === 0 ? (
          <div className="empty-state">No employees found</div>
        ) : (
          <table className="employees-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {employees.map((emp, index) => (
                <tr key={emp.id}>
                  <td><strong>{emp.employee_id}</strong></td>
                  <td><strong>{emp.full_name}</strong></td>
                  <td>{emp.email}</td>
                  <td>{emp.mobile}</td>
                  <td className="actions-cell">
                    <ActionMenu
                      onView={() => navigate(`/employees/${emp.id}`)}
                      onEdit={() => navigate(`/employees/edit/${emp.id}`)}
                      onDeactivate={() => {
                        if (window.confirm("Deactivate this employee?")) {
                          deactivateEmployee(emp.id);
                        }
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* PAGINATION */}
      <div className="pagination">
        <button
          disabled={page === 1}
          onClick={() => fetchEmployees(page - 1, search, department, role)}
        >
          Previous
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          oonClick={() => fetchEmployees(page + 1, search, department, role)}
        >
          Next
        </button>
      </div>

      {/* DEACTIVATED EMPLOYEES MODAL */}
      {showDeactivated && (
        <div className="modal-overlay" onClick={() => setShowDeactivated(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Deactivated Employees</h3>
              <button 
                onClick={() => setShowDeactivated(false)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>
            
            {loadingDeactivated ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
            ) : deactivatedEmployees.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No deactivated employees</div>
            ) : (
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                <table className="employees-table">
                  <thead>
                    <tr>
                      <th>Employee ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Department</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deactivatedEmployees.map((emp) => (
                      <tr key={emp.id}>
                        <td>{emp.employee_id}</td>
                        <td>{emp.full_name}</td>
                        <td>{emp.email}</td>
                        <td>{emp.department}</td>
                        <td>
                          <button
                            className="btn"
                            onClick={() => {
                              if (window.confirm('Activate this employee?')) {
                                activateEmployee(emp.id);
                              }
                            }}
                            style={{ background: '#16a34a', color: 'white', padding: '6px 16px', fontSize: '13px' }}
                          >
                            Activate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Employee Settings</h3>
              <button 
                onClick={() => setShowSettings(false)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            {/* Deactivated Employees Section */}
            <div style={{ marginBottom: '30px', padding: '20px', background: '#f8fafc', borderRadius: '8px' }}>
              <h4 style={{ marginBottom: '10px' }}>Deactivated Employees</h4>
              <button
                className="btn"
                onClick={() => {
                  setShowSettings(false);
                  fetchDeactivatedEmployees();
                }}
                style={{ background: '#f59e0b', color: 'white' }}
              >
                View Deactivated Employees
              </button>
            </div>

            {/* Roles Management Section */}
            <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px', marginBottom: '20px' }}>
              <h4 style={{ marginBottom: '15px' }}>Manage Roles</h4>
              
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <input
                  type="text"
                  placeholder="Enter new role name"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                />
                <button
                  className="btn primary"
                  onClick={addRole}
                  style={{ padding: '8px 16px' }}
                >
                  Add Role
                </button>
              </div>

              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {roles.length === 0 ? (
                  <p style={{ color: '#64748b', textAlign: 'center' }}>No custom roles added</p>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {roles.map((role, index) => (
                      <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'white', marginBottom: '8px', borderRadius: '6px' }}>
                        <span>{role}</span>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete role "${role}"?`)) {
                              deleteRole(role);
                            }
                          }}
                          style={{ background: '#ef4444', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Departments Management Section */}
            <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px' }}>
              <h4 style={{ marginBottom: '15px' }}>Manage Departments</h4>
              
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <input
                  type="text"
                  placeholder="Enter new department name"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                />
                <button
                  className="btn primary"
                  onClick={addDepartment}
                  style={{ padding: '8px 16px' }}
                >
                  Add Department
                </button>
              </div>

              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {departments.length === 0 ? (
                  <p style={{ color: '#64748b', textAlign: 'center' }}>No custom departments added</p>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {departments.map((dept, index) => (
                      <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'white', marginBottom: '8px', borderRadius: '6px' }}>
                        <span>{dept}</span>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete department "${dept}"?`)) {
                              deleteDepartment(dept);
                            }
                          }}
                          style={{ background: '#ef4444', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= ACTION MENU ================= */

function ActionMenu({ onView, onEdit, onDeactivate }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleAction = (e, action) => {
    e.stopPropagation();
    setOpen(false);
    action();
  };

  return (
    <div className="action-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className="action-trigger"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
      >
        ⋮
      </button>

      {open && (
        <div className="dropdown-menu">
          <button onClick={(e) => handleAction(e, onView)}>👁️ View</button>
          <button onClick={(e) => handleAction(e, onEdit)}>✏️ Edit</button>
          <button onClick={(e) => handleAction(e, onDeactivate)}>🚫 Deactivate</button>
        </div>
      )}
    </div>
  );
}