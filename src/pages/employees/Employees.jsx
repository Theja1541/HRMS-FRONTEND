import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEmployees } from "../../context/EmployeesContext";
import {
  activateEmployeeById,
  addEmployeeDepartment,
  addEmployeeRole,
  deleteEmployeeDepartment,
  deleteEmployeeRole,
  getEmployeeDepartments,
  getEmployees,
  getEmployeeRoles,
} from "../../api/employees";
import "../../styles/employees.css";
import { useCompanyPermissions } from "../../hooks/useCompanyPermissions";

export default function Employees() {
  const navigate = useNavigate();
  const { hasPermission } = useCompanyPermissions();
  const canCreate = hasPermission("employees", "create");
  const canEdit = hasPermission("employees", "edit");
  const canDelete = hasPermission("employees", "delete");

  const {
    employees,
    count,
    page,
    search,
    department,
    role,
    pageSize,
    loading,
    setSearch,
    setDepartment,
    setRole,
    setPageSize,
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

  const totalPages = Number.isFinite(Math.ceil((count || 0) / (pageSize || 10))) ? Math.ceil((count || 0) / (pageSize || 10)) : 0;
  const pageNumbers = Array.from({ length: Math.min(totalPages || 0, 5) }, (_, idx) => {
    const start = Math.max(1, (page || 1) - 2);
    return start + idx <= totalPages ? start + idx : null;
  }).filter(Boolean);

  const getInitials = (emp) => {
    if (!emp) return "NA";
    const fullName = (emp.full_name || "").trim();
    if (!fullName) return "NA";
    const parts = fullName.split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  };

  useEffect(() => {
    fetchEmployees(1, search, department, role, pageSize);
  }, [search, department, role, pageSize]);

  useEffect(() => {
    fetchAvailableRoles();
    fetchAvailableDepartments();
  }, []);

  const fetchAvailableRoles = async () => {
    try {
      const res = await getEmployeeRoles();
      setAvailableRoles(res.data.roles || []);
    } catch (err) {
      console.error('Failed to fetch available roles', err);
    }
  };

  const fetchAvailableDepartments = async () => {
    try {
      const res = await getEmployeeDepartments();
      setAvailableDepartments(res.data.departments || []);
    } catch (err) {
      console.error('Failed to fetch available departments', err);
    }
  };

  const fetchDeactivatedEmployees = async () => {
    try {
      setLoadingDeactivated(true);
      const res = await getEmployees({ is_active: false });
      setDeactivatedEmployees(res.data.results || []);
      setShowDeactivated(true);
    } catch (err) {
      console.error('Failed to fetch deactivated employees', err);
    } finally {
      setLoadingDeactivated(false);
    }
  };

  const activateEmployee = async (id) => {
    try {
      await activateEmployeeById(id);
      fetchDeactivatedEmployees();
      fetchEmployees(page, search, department, role, pageSize);

    } catch (err) {
      console.error('Failed to activate employee', err);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await getEmployeeRoles();
      setRoles(res.data.roles || []);
    } catch (err) {
      console.error('Failed to fetch roles', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await getEmployeeDepartments();
      setDepartments(res.data.departments || []);
    } catch (err) {
      console.error('Failed to fetch departments', err);
    }
  };

  const addRole = async () => {
    if (!newRole.trim()) return;
    try {
      await addEmployeeRole(newRole);
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
      await addEmployeeDepartment(newDepartment);
      setNewDepartment("");
      fetchDepartments();
      fetchAvailableDepartments();
    } catch (err) {
      console.error('Failed to add department', err);
    }
  };

  const deleteRole = async (role) => {
    try {
      await deleteEmployeeRole(role);
      fetchRoles();
      fetchAvailableRoles();
    } catch (err) {
      console.error('Failed to delete role', err);
    }
  };

  const deleteDepartment = async (dept) => {
    try {
      await deleteEmployeeDepartment(dept);
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
        <div className="header-actions">
          {canEdit && (
            <button
              className="settings-btn"
              onClick={() => {
                setShowSettings(true);
                fetchRoles();
                fetchDepartments();
              }}
            >
              ⚙️ Manage Roles & Depts
            </button>
          )}
          <button
            className="deactivated-btn"
            onClick={() => {
              setShowSettings(false);
              fetchDeactivatedEmployees();
            }}
          >
            View Deactivated
          </button>
          {canCreate && (
            <button
              className="add-employee-btn"
              onClick={() => navigate("/employees/add")}
            >
              + Add Employee
            </button>
          )}
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
          {Array.isArray(availableDepartments) && availableDepartments.map((dept, index) => (
            <option key={index} value={dept}>{dept}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">All Roles</option>
          {Array.isArray(availableRoles) && availableRoles.map((r, index) => (
            <option key={index} value={r}>{r}</option>
          ))}
        </select>
        
        <select
          className="filter-select"
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
        >
          <option value={10}>10 entries</option>
          <option value={20}>20 entries</option>
          <option value={50}>50 entries</option>
          <option value={100}>100 entries</option>
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
                <th>Employee</th>
                <th>Email</th>
                <th>Mobile</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {employees.map((emp) => {
                if (!emp) return null;
                return (
                  <tr key={emp.id}>
                    <td><strong>{emp.employee_id}</strong></td>
                    <td>
                      <div className="employee-cell">
                        {emp.profile_photo ? (
                          <img src={emp.profile_photo} alt={emp.full_name} className="employee-avatar-img" />
                        ) : (
                          <span className="employee-avatar">{getInitials(emp)}</span>
                        )}
                        <div className="employee-meta">
                          <strong>{emp.full_name}</strong>
                          <span className="employee-meta-sub">{emp.department || "N/A"}</span>
                        </div>
                      </div>
                    </td>
                    <td>{emp.email}</td>
                    <td>{emp.mobile}</td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="action-btn action-btn-view"
                          onClick={() => navigate(`/employees/${emp.id}`)}
                          title="View profile"
                        >
                          View
                        </button>
                        {canEdit && (
                          <button
                            type="button"
                            className="action-btn action-btn-edit"
                            onClick={() => navigate(`/employees/edit/${emp.id}`)}
                            title="Edit employee"
                          >
                            Edit
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            className="action-btn action-btn-deactivate"
                            onClick={() => {
                              if (window.confirm("Deactivate this employee?")) {
                                deactivateEmployee(emp.id);
                              }
                            }}
                            title="Deactivate employee"
                          >
                            Deactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* PAGINATION */}
      {count > 0 && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={page === 1}
            onClick={() => fetchEmployees(page - 1, search, department, role, pageSize)}
          >
            Previous
          </button>
          <div className="page-number-group">
            {Array.isArray(pageNumbers) && pageNumbers.map((pg) => (
              <button
                key={pg}
                className={`page-btn ${pg === page ? "active" : ""}`}
                onClick={() => fetchEmployees(pg, search, department, role, pageSize)}
              >
                {pg}
              </button>
            ))}
          </div>
          <span className="page-summary">Page {page} of {totalPages || 1}</span>
          <button
            className="page-btn"
            disabled={page >= totalPages}
            onClick={() => fetchEmployees(page + 1, search, department, role, pageSize)}
          >
            Next
          </button>
        </div>
      )}

      {/* DEACTIVATED EMPLOYEES MODAL */}
      {showDeactivated && (
        <div className="modal-overlay" onClick={() => setShowDeactivated(false)}>
          <div className="modal-card wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Deactivated Employees</h3>
              <button 
                onClick={() => setShowDeactivated(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            {loadingDeactivated ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
            ) : deactivatedEmployees.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No deactivated employees</div>
            ) : (
              <div className="modal-table-scroll">
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
                    {Array.isArray(deactivatedEmployees) && deactivatedEmployees.map((emp) => (
                      <tr key={emp.id}>
                        <td>{emp.employee_id}</td>
                        <td>{emp.full_name}</td>
                        <td>{emp.email}</td>
                        <td>{emp.department}</td>
                        <td>
                          {canEdit && (
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
                          )}
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
            <div className="modal-header">
              <h3>Manage Roles & Departments</h3>
              <button 
                onClick={() => setShowSettings(false)}
                className="modal-close"
              >
                ×
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
                    {Array.isArray(roles) && roles.map((role, index) => (
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
                    {Array.isArray(departments) && departments.map((dept, index) => (
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
