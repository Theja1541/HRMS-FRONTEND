import React, { useState, useEffect } from 'react';
import { assetReturnAPI } from '../../api/assets';
import '../../styles/assetManagement.css';

const AssetManagement = () => {
  const [assets, setAssets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    asset_name: '',
    asset_type: 'LAPTOP',
    serial_number: '',
    purchase_date: ''
  });

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await assetReturnAPI.getCompanyAssets();
      console.log('Assets response:', response.data);
      const data = response.data;
      if (Array.isArray(data)) {
        setAssets(data);
      } else if (data && data.results) {
        setAssets(data.results);
      } else {
        setAssets([]);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await assetReturnAPI.createCompanyAsset(formData);
      setShowModal(false);
      setFormData({ asset_name: '', asset_type: 'LAPTOP', serial_number: '', purchase_date: '' });
      await fetchAssets();
      alert('Asset added successfully!');
    } catch (error) {
      console.error('Error adding asset:', error);
      alert('Error: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this asset?')) return;
    try {
      await assetReturnAPI.deleteCompanyAsset(id);
      await fetchAssets();
      alert('Asset deleted successfully!');
    } catch (error) {
      console.error('Error deleting asset:', error);
      alert('Error: ' + (error.response?.data?.detail || error.message));
    }
  };

  return (
    <div className="asset-management-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Asset Management</h2>
          <p className="page-subtitle">Manage company assets inventory</p>
        </div>
        <button className="add-asset-btn" onClick={() => setShowModal(true)}>
          + Add Asset
        </button>
      </div>

      <div className="assets-grid">
        {loading && <p className="loading-text">Loading assets...</p>}
        {!loading && Array.isArray(assets) && assets.map(asset => (
          <div key={asset.id} className="asset-card">
            <div className="asset-icon">
              {asset.asset_type === 'LAPTOP' && '💻'}
              {asset.asset_type === 'MOBILE' && '📱'}
              {asset.asset_type === 'ID_CARD' && '🪪'}
              {asset.asset_type === 'MONITOR' && '🖥️'}
              {asset.asset_type === 'OTHER' && '📦'}
            </div>
            <h3>{asset.asset_name}</h3>
            <p className="asset-type">{asset.asset_type}</p>
            {asset.serial_number && <p className="asset-serial">SN: {asset.serial_number}</p>}
            {asset.purchase_date && <p className="asset-date">Purchased: {new Date(asset.purchase_date).toLocaleDateString()}</p>}
            <button className="delete-btn" onClick={() => handleDelete(asset.id)}>Delete</button>
          </div>
        ))}
        {!loading && (!Array.isArray(assets) || assets.length === 0) && <p className="no-data">No assets found. Add your first asset!</p>}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Asset</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Asset Name *</label>
                <input
                  type="text"
                  value={formData.asset_name}
                  onChange={(e) => setFormData({ ...formData, asset_name: e.target.value })}
                  placeholder="e.g., Dell Latitude 5420"
                  required
                />
              </div>
              <div className="form-group">
                <label>Asset Type *</label>
                <select
                  value={formData.asset_type}
                  onChange={(e) => setFormData({ ...formData, asset_type: e.target.value })}
                  required
                >
                  <option value="LAPTOP">Laptop</option>
                  <option value="MOBILE">Mobile</option>
                  <option value="ID_CARD">ID Card</option>
                  <option value="MONITOR">Monitor</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Serial Number</label>
                <input
                  type="text"
                  value={formData.serial_number}
                  onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                  placeholder="Optional"
                />
              </div>
              <div className="form-group">
                <label>Purchase Date</label>
                <input
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                />
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Adding...' : 'Add Asset'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetManagement;
