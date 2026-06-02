import React, { useEffect, useState } from "react";
import { getAssetAssignments, assignAsset, updateAssetAssignment, getAssets } from "../../api/assets";
import { getEmployees } from "../../api/employees";
import "../../styles/employees.css";

export default function AssignAssets() {
  const [data, setData] = useState([]);
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [employeeSearch, setEmployeeSearch] = useState('');
  
  const [formData, setFormData] = useState({
    employee: '',
    asset: '',
    expected_return_date: '',
    remarks: '',
    status: 'ACTIVE'
  });

  useEffect(() => {
    fetchAssignments();
    fetchDropdownData();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await getAssetAssignments();
      setData(res.data?.results || res.data || []);
    } catch (err) {
      alert("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const assetRes = await getAssets({ status: "AVAILABLE" });
      setAssets(assetRes.data?.results || assetRes.data || []);
    } catch (err) {
      console.error("Failed to load available assets", err);
    }
    
    try {
      const empRes = await getEmployees();
      setEmployees(empRes.data?.results || empRes.data || []);
    } catch (err) {
      console.error("Failed to load employees", err);
    }
  };

  const handleAdd = () => {
    setEditingAssignment(null);
    setFormData({
      employee: '',
      asset: '',
      expected_return_date: '',
      remarks: '',
      status: 'ACTIVE'
    });
    setEmployeeSearch('');
    setIsModalVisible(true);
    // Refresh available assets before opening modal
    getAssets({ status: "AVAILABLE" }).then(res => {
      setAssets(res.data?.results || res.data || []);
    });
  };

  const handleEdit = (record) => {
    setEditingAssignment(record);
    setFormData({
      employee: record.employee || '',
      asset: record.asset || '',
      expected_return_date: record.expected_return_date || '',
      remarks: record.remarks || '',
      status: record.status || 'ACTIVE'
    });
    setEmployeeSearch('');
    setIsModalVisible(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.employee || !formData.asset) {
      alert("Please select both an employee and an asset.");
      return;
    }
    
    const payload = {
      ...formData,
      expected_return_date: formData.expected_return_date || null
    };

    try {
      if (editingAssignment) {
        await updateAssetAssignment(editingAssignment.id, payload);
      } else {
        await assignAsset(payload);
      }
      setIsModalVisible(false);
      fetchAssignments();
    } catch (err) {
      alert(err.response?.data?.detail || "An error occurred");
    }
  };

  return (
    <div className="employees-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Asset Assignments</h2>
          <p className="page-subtitle">Allocate assets to employees</p>
        </div>
        <div className="header-actions">
          <button className="add-employee-btn" onClick={handleAdd}>
            + Assign Asset
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div className="empty-state">Loading assignments...</div>
        ) : data.length === 0 ? (
          <div className="empty-state">No asset assignments found</div>
        ) : (
          <table className="employees-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Asset</th>
                <th>Employee</th>
                <th>Assigned Date</th>
                <th>Expected Return</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((assignment) => (
                <tr key={assignment.id}>
                  <td><strong>{assignment.id}</strong></td>
                  <td>{assignment.asset_details?.asset_name}</td>
                  <td>
                    {assignment.employee_details?.employee_id && <strong>{assignment.employee_details.employee_id}</strong>}
                    {assignment.employee_details?.employee_id ? ' - ' : ''}
                    {assignment.employee_details?.full_name || `${assignment.employee_details?.first_name || ''} ${assignment.employee_details?.last_name || ''}`}
                  </td>
                  <td>{assignment.assigned_date ? new Date(assignment.assigned_date).toLocaleDateString() : '-'}</td>
                  <td>{assignment.expected_return_date ? new Date(assignment.expected_return_date).toLocaleDateString() : '-'}</td>
                  <td>
                    {assignment.status === 'ACTIVE' ? (
                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>Active</span>
                    ) : (
                      <span style={{ color: '#64748b', fontWeight: 'bold' }}>{assignment.status}</span>
                    )}
                  </td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button className="action-btn action-btn-edit" onClick={() => handleEdit(assignment)}>Edit</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalVisible && (
        <div className="modal-overlay" onClick={() => setIsModalVisible(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>{editingAssignment ? "Edit Assignment" : "Assign Asset"}</h3>
              <button className="modal-close" onClick={() => setIsModalVisible(false)}>×</button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Employee *</label>
                {!editingAssignment && (
                  <input
                    type="text"
                    placeholder="Search employee by ID or Name..."
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '10px' }}
                  />
                )}
                <select 
                  value={formData.employee}
                  onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                  disabled={!!editingAssignment}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: editingAssignment ? '#f1f5f9' : 'white' }}
                  required
                >
                  <option value="">Select Employee</option>
                  {employees
                    .filter(emp => {
                      if (!employeeSearch) return true;
                      const searchLower = employeeSearch.toLowerCase();
                      const idMatch = emp.employee_id?.toLowerCase().includes(searchLower);
                      const nameMatch = `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchLower);
                      return idMatch || nameMatch;
                    })
                    .map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.employee_id ? `${emp.employee_id} - ` : ''}{emp.first_name} {emp.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Asset *</label>
                <select 
                  value={formData.asset}
                  onChange={(e) => setFormData({ ...formData, asset: e.target.value })}
                  disabled={!!editingAssignment}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: editingAssignment ? '#f1f5f9' : 'white' }}
                  required
                >
                  <option value="">Select Asset (Available Only)</option>
                  {assets.map(ast => (
                    <option key={ast.id} value={ast.id}>{ast.asset_code} - {ast.asset_name}</option>
                  ))}
                  {editingAssignment && (
                    <option key={editingAssignment.asset} value={editingAssignment.asset}>
                      {editingAssignment.asset_details?.asset_code} - {editingAssignment.asset_details?.asset_name}
                    </option>
                  )}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Expected Return Date</label>
                <input 
                  type="date"
                  value={formData.expected_return_date}
                  onChange={(e) => setFormData({ ...formData, expected_return_date: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Remarks</label>
                <textarea 
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  rows="3"
                />
              </div>

              {editingAssignment && (
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Status *</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    required
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="RETURNED">Returned</option>
                  </select>
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn" onClick={() => setIsModalVisible(false)} style={{ background: '#f1f5f9', color: '#334155' }}>Cancel</button>
                <button type="submit" className="btn primary" style={{ background: '#0f766e', color: 'white' }}>Save Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
