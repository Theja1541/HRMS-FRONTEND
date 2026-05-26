import React, { useState, useEffect } from 'react';
import { assetReturnAPI } from '../../api/assets';
import '../../styles/assetManagement.css';
import '../../styles/attendance.css';

const MyAssetReturns = () => {
  const [requests, setRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [availableAssets, setAvailableAssets] = useState([]);
  const [formData, setFormData] = useState({
    asset_type: 'LAPTOP',
    asset_name: '',
    serial_number: '',
    description: '',
    condition: 'GOOD',
    return_date: '',
    comments: ''
  });

  useEffect(() => {
    fetchMyRequests();
    fetchAvailableAssets();
  }, []);

  useEffect(() => {
    if (showForm) {
      fetchAvailableAssets();
    }
  }, [showForm]);

  const fetchMyRequests = async () => {
    if (fetching) return;
    setFetching(true);
    try {
      const response = await assetReturnAPI.getMyRequests();
      let data = [];
      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data && response.data.results) {
        data = response.data.results;
      }
      setRequests(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setFetching(false);
    }
  };

  const fetchAvailableAssets = async () => {
    try {
      const response = await assetReturnAPI.getCompanyAssets();
      setAvailableAssets(response.data || []);
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await assetReturnAPI.createReturnRequest(formData);
      alert('Asset return request submitted successfully!');
      setShowForm(false);
      setFormData({
        asset_type: 'LAPTOP',
        asset_name: '',
        serial_number: '',
        description: '',
        condition: 'GOOD',
        return_date: '',
        comments: ''
      });
      await fetchMyRequests();
    } catch (error) {
      console.error('Submit error:', error);
      alert('Error submitting request: ' + (error.response?.data?.detail || error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: 'badge-warning',
      APPROVED: 'badge-success',
      REJECTED: 'badge-danger'
    };
    return badges[status] || 'badge-secondary';
  };

  return (
    <div className="asset-management-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">My Asset Return Requests</h2>
          <p className="page-subtitle">Submit and track your asset return requests</p>
        </div>
        <div style={{display: 'flex', gap: '10px'}}>
          <button className="bulk-btn" onClick={fetchMyRequests} disabled={fetching}>
            🔄 {fetching ? 'Loading...' : 'Refresh'}
          </button>
          <button className="add-asset-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Request Return'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '600px'}}>
            <div className="modal-header">
              <h3>Submit Asset Return Request</h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
            <div className="form-row">
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
                <label>Select Asset (Optional)</label>
                <select
                  onChange={(e) => {
                    const asset = availableAssets.find(a => a.id === parseInt(e.target.value));
                    if (asset) {
                      setFormData({ 
                        ...formData, 
                        asset_type: asset.asset_type,
                        asset_name: asset.asset_name,
                        serial_number: asset.serial_number || ''
                      });
                    }
                  }}
                >
                  <option value="">-- Or select from available assets --</option>
                  {availableAssets.map(asset => (
                    <option key={asset.id} value={asset.id}>
                      {asset.asset_name} ({asset.asset_type}) {asset.serial_number ? `- ${asset.serial_number}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Asset Name / Model *</label>
                <input
                  type="text"
                  value={formData.asset_name}
                  onChange={(e) => setFormData({ ...formData, asset_name: e.target.value })}
                  placeholder="e.g., Dell Latitude 5420"
                  required
                />
              </div>
            </div>

            <div className="form-row">
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
                <label>Condition *</label>
                <select
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  required
                >
                  <option value="GOOD">Good</option>
                  <option value="DAMAGED">Damaged</option>
                  <option value="NOT_WORKING">Not Working</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Return Date *</label>
                <input
                  type="date"
                  value={formData.return_date}
                  onChange={(e) => setFormData({ ...formData, return_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Additional details about the asset"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Comments</label>
              <textarea
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                placeholder="Any additional comments"
                rows="3"
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
          </div>
        </div>
      )}

      <div className="table-wrapper">
        <h3 style={{padding: '20px 20px 0', margin: 0}}>Request History</h3>
        {fetching ? (
          <p className="no-data">Loading...</p>
        ) : requests.length === 0 ? (
          <p className="no-data">No asset return requests found.</p>
        ) : (
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Asset Type</th>
                <th>Asset Name</th>
                <th>Serial Number</th>
                <th>Condition</th>
                <th>Return Date</th>
                <th>Status</th>
                <th>Request Date</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td>{request.asset_type}</td>
                  <td>{request.asset_name}</td>
                  <td>{request.serial_number || '-'}</td>
                  <td>{request.condition}</td>
                  <td>{new Date(request.return_date).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td>{new Date(request.request_date).toLocaleDateString()}</td>
                  <td>{request.admin_remarks || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MyAssetReturns;
