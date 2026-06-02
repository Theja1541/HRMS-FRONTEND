import React, { useEffect, useState } from "react";
import { getAssetMaintenances, createAssetMaintenance, updateAssetMaintenance, getAssets } from "../../api/assets";
import "../../styles/employees.css";

export default function AssetMaintenance() {
  const [data, setData] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  
  const [formData, setFormData] = useState({
    asset: '',
    maintenance_type: '',
    service_vendor: '',
    service_date: '',
    cost: '',
    status: 'OPEN',
    remarks: ''
  });

  useEffect(() => {
    fetchMaintenances();
    fetchAssets();
  }, []);

  const fetchMaintenances = async () => {
    try {
      setLoading(true);
      const res = await getAssetMaintenances();
      setData(res.data?.results || res.data || []);
    } catch (err) {
      alert("Failed to load maintenance records");
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async () => {
    try {
      const res = await getAssets();
      setAssets(res.data?.results || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = () => {
    setEditingRecord(null);
    setFormData({
      asset: '',
      maintenance_type: '',
      service_vendor: '',
      service_date: new Date().toISOString().split('T')[0],
      cost: '',
      status: 'OPEN',
      remarks: ''
    });
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      asset: record.asset || '',
      maintenance_type: record.maintenance_type || '',
      service_vendor: record.service_vendor || '',
      service_date: record.service_date || '',
      cost: record.cost || '',
      status: record.status || 'OPEN',
      remarks: record.remarks || ''
    });
    setIsModalVisible(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.asset || !formData.maintenance_type || !formData.status) {
      alert("Please fill in required fields (Asset, Maintenance Type, Status).");
      return;
    }

    const payload = {
      ...formData,
      service_date: formData.service_date || null,
      cost: formData.cost || null
    };

    try {
      if (editingRecord) {
        await updateAssetMaintenance(editingRecord.id, payload);
      } else {
        await createAssetMaintenance(payload);
      }
      setIsModalVisible(false);
      fetchMaintenances();
    } catch (err) {
      alert(err.response?.data?.detail || "An error occurred");
    }
  };

  const getStatusColor = (status) => {
    const colors = { OPEN: "#ef4444", IN_PROGRESS: "#f59e0b", COMPLETED: "#10b981" };
    return colors[status] || "#64748b";
  };

  return (
    <div className="employees-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Asset Maintenance</h2>
          <p className="page-subtitle">Track repairs and maintenance records</p>
        </div>
        <div className="header-actions">
          <button className="add-employee-btn" onClick={handleAdd}>
            + Log Maintenance
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div className="empty-state">Loading maintenance records...</div>
        ) : data.length === 0 ? (
          <div className="empty-state">No maintenance records found</div>
        ) : (
          <table className="employees-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Asset</th>
                <th>Type</th>
                <th>Vendor</th>
                <th>Service Date</th>
                <th>Cost</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((record) => (
                <tr key={record.id}>
                  <td><strong>{record.id}</strong></td>
                  <td>{record.asset_details?.asset_name}</td>
                  <td>{record.maintenance_type}</td>
                  <td>{record.service_vendor || '-'}</td>
                  <td>{record.service_date ? new Date(record.service_date).toLocaleDateString() : '-'}</td>
                  <td>{record.cost ? `$${record.cost}` : '-'}</td>
                  <td>
                    <span style={{ color: getStatusColor(record.status), fontWeight: 'bold' }}>
                      {record.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button className="action-btn action-btn-edit" onClick={() => handleEdit(record)}>Edit</button>
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
              <h3>{editingRecord ? "Edit Maintenance" : "Log Maintenance"}</h3>
              <button className="modal-close" onClick={() => setIsModalVisible(false)}>×</button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Asset *</label>
                <select 
                  value={formData.asset}
                  onChange={(e) => setFormData({ ...formData, asset: e.target.value })}
                  disabled={!!editingRecord}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: editingRecord ? '#f1f5f9' : 'white' }}
                  required
                >
                  <option value="">Select Asset</option>
                  {assets.map(ast => (
                    <option key={ast.id} value={ast.id}>{ast.asset_code} - {ast.asset_name}</option>
                  ))}
                  {editingRecord && (
                    <option key={editingRecord.asset} value={editingRecord.asset}>
                      {editingRecord.asset_details?.asset_code} - {editingRecord.asset_details?.asset_name}
                    </option>
                  )}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Maintenance Type *</label>
                <input 
                  type="text"
                  value={formData.maintenance_type}
                  onChange={(e) => setFormData({ ...formData, maintenance_type: e.target.value })}
                  placeholder="e.g. Screen Replacement, Annual Service"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Service Vendor</label>
                  <input 
                    type="text"
                    value={formData.service_vendor}
                    onChange={(e) => setFormData({ ...formData, service_vendor: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Cost ($)</label>
                  <input 
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Service Date</label>
                  <input 
                    type="date"
                    value={formData.service_date}
                    onChange={(e) => setFormData({ ...formData, service_date: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Status *</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    required
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
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
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn" onClick={() => setIsModalVisible(false)} style={{ background: '#f1f5f9', color: '#334155' }}>Cancel</button>
                <button type="submit" className="btn primary" style={{ background: '#0f766e', color: 'white' }}>Save Maintenance</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
