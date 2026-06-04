import React, { useEffect, useState } from "react";
import {
  addEmployeeDepartment,
  addEmployeeRole,
  editEmployeeDepartment,
  editEmployeeRole,
  getEmployeeDepartments,
  getEmployeeRoles,
} from "../../api/employees";
import "../../styles/employees.css";

export default function RolesAndDepartments() {
  const [activeTab, setActiveTab] = useState("roles"); // "roles" or "departments"
  
  // States for Roles
  const [roles, setRoles] = useState([]);
  const [roleSearch, setRoleSearch] = useState("");
  
  // States for Departments
  const [departments, setDepartments] = useState([]);
  const [deptSearch, setDeptSearch] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "addRole", "editRole", "addDept", "editDept"
  const [currentEntity, setCurrentEntity] = useState(null); // the role/dept being edited
  const [formData, setFormData] = useState({ name: "", description: "" });

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

  useEffect(() => {
    fetchRoles();
    fetchDepartments();
  }, []);

  const openModal = (type, entity = null) => {
    setModalType(type);
    setCurrentEntity(entity);
    if (entity) {
      setFormData({ name: entity.name || "", description: entity.description || "" });
    } else {
      setFormData({ name: "", description: "" });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType("");
    setCurrentEntity(null);
    setFormData({ name: "", description: "" });
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      if (modalType === "addRole") {
        await addEmployeeRole({ role: formData.name.trim(), description: formData.description.trim() });
        fetchRoles();
      } else if (modalType === "editRole") {
        await editEmployeeRole(currentEntity.id, { name: formData.name.trim(), description: formData.description.trim() });
        fetchRoles();
      } else if (modalType === "addDept") {
        await addEmployeeDepartment({ department: formData.name.trim(), description: formData.description.trim() });
        fetchDepartments();
      } else if (modalType === "editDept") {
        await editEmployeeDepartment(currentEntity.id, { name: formData.name.trim(), description: formData.description.trim() });
        fetchDepartments();
      }
      closeModal();
    } catch (err) {
      console.error('Failed to save', err);
    }
  };

  const toggleRoleStatus = async (role) => {
    try {
      await editEmployeeRole(role.id, { is_active: !role.is_active });
      setRoles(roles.map(r => r.id === role.id ? { ...r, is_active: !r.is_active } : r));
    } catch (err) {
      console.error('Failed to toggle role', err);
    }
  };

  const toggleDepartmentStatus = async (dept) => {
    try {
      await editEmployeeDepartment(dept.id, { is_active: !dept.is_active });
      setDepartments(departments.map(d => d.id === dept.id ? { ...d, is_active: !d.is_active } : d));
    } catch (err) {
      console.error('Failed to toggle department', err);
    }
  };

  const filteredRoles = roles.filter(r => r.name?.toLowerCase().includes(roleSearch.toLowerCase()));
  const filteredDepartments = departments.filter(d => d.name?.toLowerCase().includes(deptSearch.toLowerCase()));

  return (
    <div className="employees-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Roles & Departments</h2>
          <p className="page-subtitle">Manage company roles and departments</p>
        </div>
      </div>

      <div className="card" style={{ padding: '0' }}>
        <div className="custom-tabs">
          <button 
            className={`tab-btn ${activeTab === 'roles' ? 'active' : ''}`}
            onClick={() => setActiveTab('roles')}
          >
            Manage Roles
          </button>
          <button 
            className={`tab-btn ${activeTab === 'departments' ? 'active' : ''}`}
            onClick={() => setActiveTab('departments')}
          >
            Manage Departments
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {activeTab === 'roles' && (
            <div className="tab-pane">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ flex: 1, maxWidth: '300px' }}>
                  <input
                    type="text"
                    placeholder="Search roles..."
                    value={roleSearch}
                    onChange={(e) => setRoleSearch(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <button className="btn primary" onClick={() => openModal('addRole')} style={{ whiteSpace: 'nowrap' }}>
                    + Add Role
                  </button>
                </div>
              </div>

              <div className="table-wrapper" style={{ marginTop: '0', boxShadow: 'none', border: '1px solid #e5e7eb' }}>
                <table className="table employees-table">
                  <thead>
                    <tr>
                      <th>Role Name</th>
                      <th>Description</th>
                      <th style={{ width: '200px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRoles.length === 0 ? (
                      <tr>
                        <td colSpan="3" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                          No roles found
                        </td>
                      </tr>
                    ) : (
                      filteredRoles.map((role) => (
                        <tr key={role.id}>
                          <td style={{ fontWeight: 500 }}>{role.name}</td>
                          <td style={{ color: '#64748b' }}>{role.description || '—'}</td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                              <button 
                                onClick={() => openModal('editRole', role)}
                                style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
                              >
                                Edit
                              </button>
                              <label className="toggle-switch">
                                <input 
                                  type="checkbox" 
                                  checked={role.is_active} 
                                  onChange={() => toggleRoleStatus(role)}
                                />
                                <span className="slider round"></span>
                              </label>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'departments' && (
            <div className="tab-pane">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ flex: 1, maxWidth: '300px' }}>
                  <input
                    type="text"
                    placeholder="Search departments..."
                    value={deptSearch}
                    onChange={(e) => setDeptSearch(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <button className="btn primary" onClick={() => openModal('addDept')} style={{ whiteSpace: 'nowrap' }}>
                    + Add Department
                  </button>
                </div>
              </div>

              <div className="table-wrapper" style={{ marginTop: '0', boxShadow: 'none', border: '1px solid #e5e7eb' }}>
                <table className="table employees-table">
                  <thead>
                    <tr>
                      <th>Department Name</th>
                      <th>Description</th>
                      <th style={{ width: '200px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDepartments.length === 0 ? (
                      <tr>
                        <td colSpan="3" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                          No departments found
                        </td>
                      </tr>
                    ) : (
                      filteredDepartments.map((dept) => (
                        <tr key={dept.id}>
                          <td style={{ fontWeight: 500 }}>{dept.name}</td>
                          <td style={{ color: '#64748b' }}>{dept.description || '—'}</td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                              <button 
                                onClick={() => openModal('editDept', dept)}
                                style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
                              >
                                Edit
                              </button>
                              <label className="toggle-switch">
                                <input 
                                  type="checkbox" 
                                  checked={dept.is_active} 
                                  onChange={() => toggleDepartmentStatus(dept)}
                                />
                                <span className="slider round"></span>
                              </label>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '1.25rem', fontWeight: 600 }}>
              {modalType === 'addRole' && 'Add New Role'}
              {modalType === 'editRole' && 'Edit Role'}
              {modalType === 'addDept' && 'Add New Department'}
              {modalType === 'editDept' && 'Edit Department'}
            </h3>
            <form onSubmit={handleModalSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#334155' }}>
                  {(modalType.includes('Role') ? 'Role' : 'Department')} Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  placeholder={`Enter ${(modalType.includes('Role') ? 'role' : 'department')} name`}
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#334155' }}>
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', minHeight: '80px', resize: 'vertical' }}
                  placeholder="Enter description"
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
