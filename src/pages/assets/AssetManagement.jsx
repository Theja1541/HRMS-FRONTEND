import React, { useEffect, useState } from "react";
import { getAssets, createAsset, updateAsset, deleteAsset, getAssetCategories } from "../../api/assets";
import "../../styles/employees.css";

export default function AssetManagement() {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [formData, setFormData] = useState({
    asset_name: '', category: '', serial_number: '', asset_tag: '',
    brand: '', model: '', purchase_date: '', purchase_cost: '',
    vendor_name: '', warranty_expiry: '', status: 'AVAILABLE', notes: ''
  });

  useEffect(() => {
    fetchAssets();
    fetchCategories();
  }, []);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await getAssets();
      setData(res.data?.results || res.data || []);
    } catch (err) {
      alert("Failed to load assets");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await getAssetCategories();
      setCategories(res.data?.results || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = () => {
    setEditingAsset(null);
    setFormData({
      asset_name: '', category: '', serial_number: '', asset_tag: '',
      brand: '', model: '', purchase_date: '', purchase_cost: '',
      vendor_name: '', warranty_expiry: '', status: 'AVAILABLE', notes: ''
    });
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingAsset(record);
    setFormData({
      asset_name: record.asset_name || '',
      category: record.category || '',
      serial_number: record.serial_number || '',
      asset_tag: record.asset_tag || '',
      brand: record.brand || '',
      model: record.model || '',
      purchase_date: record.purchase_date || '',
      purchase_cost: record.purchase_cost || '',
      vendor_name: record.vendor_name || '',
      warranty_expiry: record.warranty_expiry || '',
      status: record.status || 'AVAILABLE',
      notes: record.notes || ''
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this asset?")) return;
    try {
      await deleteAsset(id);
      fetchAssets();
    } catch (err) {
      alert("Failed to delete asset. It might be assigned.");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.asset_name || !formData.category || !formData.serial_number || !formData.asset_tag) {
      alert("Please fill in all required fields (Name, Category, Serial Number, Asset Tag).");
      return;
    }
    
    // Convert empty strings to null for date fields
    const payload = {
      ...formData,
      purchase_date: formData.purchase_date || null,
      warranty_expiry: formData.warranty_expiry || null,
      purchase_cost: formData.purchase_cost || null
    };

    try {
      if (editingAsset) {
        await updateAsset(editingAsset.id, payload);
      } else {
        await createAsset(payload);
      }
      setIsModalVisible(false);
      fetchAssets();
    } catch (err) {
      alert(err.response?.data?.detail || "An error occurred");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      AVAILABLE: "#10b981",
      ASSIGNED: "#0ea5e9",
      MAINTENANCE: "#f59e0b",
      RETURNED: "#06b6d4",
      LOST: "#0f172a",
      DAMAGED: "#ef4444",
      RETIRED: "#64748b"
    };
    return colors[status] || "#64748b";
  };

  return (
    <div className="employees-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Company Assets</h2>
          <p className="page-subtitle">Manage all assets and inventory</p>
        </div>
        <div className="header-actions">
          <button className="add-employee-btn" onClick={handleAdd}>
            + Add Asset
          </button>
        </div>
      </div>

      <div className="table-wrapper" style={{ overflowX: 'auto' }}>
        {loading ? (
          <div className="empty-state">Loading assets...</div>
        ) : data.length === 0 ? (
          <div className="empty-state">No assets found</div>
        ) : (
          <table className="employees-table">
            <thead>
              <tr>
                <th>Asset Code</th>
                <th>Asset Name</th>
                <th>Category</th>
                <th>Serial Number</th>
                <th>Asset Tag</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((asset) => (
                <tr key={asset.id}>
                  <td><strong>{asset.asset_code}</strong></td>
                  <td>{asset.asset_name}</td>
                  <td>{asset.category_details?.name || '-'}</td>
                  <td>{asset.serial_number}</td>
                  <td>{asset.asset_tag}</td>
                  <td>
                    <span style={{ color: getStatusColor(asset.status), fontWeight: 'bold' }}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button className="action-btn action-btn-edit" onClick={() => handleEdit(asset)}>Edit</button>
                      <button className="action-btn action-btn-deactivate" onClick={() => handleDelete(asset.id)}>Delete</button>
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
          <div className="modal-card wide" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%' }}>
            <div className="modal-header">
              <h3>{editingAsset ? "Edit Asset" : "Add Asset"}</h3>
              <button className="modal-close" onClick={() => setIsModalVisible(false)}>×</button>
            </div>
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Asset Name *</label>
                  <input type="text" value={formData.asset_name} onChange={(e) => setFormData({ ...formData, asset_name: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Category *</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required>
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Serial Number *</label>
                  <input type="text" value={formData.serial_number} onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Asset Tag *</label>
                  <input type="text" value={formData.asset_tag} onChange={(e) => setFormData({ ...formData, asset_tag: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Brand</label>
                  <input type="text" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Model</label>
                  <input type="text" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Purchase Date</label>
                  <input type="date" value={formData.purchase_date} onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Purchase Cost ($)</label>
                  <input type="number" step="0.01" value={formData.purchase_cost} onChange={(e) => setFormData({ ...formData, purchase_cost: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Vendor Name</label>
                  <input type="text" value={formData.vendor_name} onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Warranty Expiry</label>
                  <input type="date" value={formData.warranty_expiry} onChange={(e) => setFormData({ ...formData, warranty_expiry: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Status *</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required>
                    <option value="AVAILABLE">Available</option>
                    <option value="ASSIGNED" disabled>Assigned</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="LOST">Lost</option>
                    <option value="DAMAGED">Damaged</option>
                    <option value="RETIRED">Retired</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Additional Notes</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} rows="3" />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn" onClick={() => setIsModalVisible(false)} style={{ background: '#f1f5f9', color: '#334155' }}>Cancel</button>
                <button type="submit" className="btn primary" style={{ background: '#0f766e', color: 'white' }}>Save Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
