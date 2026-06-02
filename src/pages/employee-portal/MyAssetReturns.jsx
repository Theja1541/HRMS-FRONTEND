import React, { useState, useEffect } from 'react';
import { getAssetAssignments, getAssets, getAssetRequests, createAssetRequest } from '../../api/assets';
import '../../styles/assetManagement.css';
import '../../styles/attendance.css';

const MyAssetReturns = () => {
  const [activeTab, setActiveTab] = useState('my-assets');
  const [myAssets, setMyAssets] = useState([]);
  const [availableAssets, setAvailableAssets] = useState([]);
  const [requests, setRequests] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // Return Modal State
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedAssetForReturn, setSelectedAssetForReturn] = useState(null);
  const [returnRemarks, setReturnRemarks] = useState('');

  // Allocation Modal State
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedAssetForRequest, setSelectedAssetForRequest] = useState(null);
  const [requestRemarks, setRequestRemarks] = useState('');

  useEffect(() => {
    fetchMyAssets();
    fetchAvailableAssets();
    fetchMyRequests();
  }, []);

  const fetchMyAssets = async () => {
    try {
      const response = await getAssetAssignments({ my_assignments: 'true', status: 'ACTIVE' });
      setMyAssets(response.data?.results || response.data || []);
    } catch (error) {
      console.error('Error fetching my assets:', error);
      setMyAssets([]);
    }
  };

  const fetchAvailableAssets = async () => {
    try {
      const response = await getAssets({ status: 'AVAILABLE' });
      const allAssets = response.data?.results || response.data || [];
      // Show only company assets that are NOT currently assigned
      setAvailableAssets(allAssets.filter(asset => asset.status !== 'ASSIGNED'));
    } catch (error) {
      console.error('Error fetching available assets:', error);
      setAvailableAssets([]);
    }
  };

  const fetchMyRequests = async () => {
    setFetching(true);
    try {
      const response = await getAssetRequests();
      let data = response.data?.results || response.data || [];
      setRequests(data);
    } catch (error) {
      console.error('Error fetching my requests:', error);
      setRequests([]);
    } finally {
      setFetching(false);
    }
  };

  const handleOpenReturnModal = (asset) => {
    setSelectedAssetForReturn(asset);
    setReturnRemarks('');
    setShowReturnModal(true);
  };

  const handleOpenRequestModal = (asset) => {
    setSelectedAssetForRequest(asset);
    setRequestRemarks('');
    setShowRequestModal(true);
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!window.confirm(`Are you sure you want to request a return for the asset "${selectedAssetForReturn.asset_name}"?`)) {
      return;
    }
    setLoading(true);
    try {
      await createAssetRequest({
        asset: selectedAssetForReturn.asset_details?.id || selectedAssetForReturn.asset,
        request_type: 'RETURN',
        employee_remarks: returnRemarks
      });
      alert('Asset return request submitted successfully!');
      setShowReturnModal(false);
      await fetchMyRequests();
    } catch (error) {
      console.error('Return request error:', error);
      alert('Error submitting return request: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!window.confirm(`Are you sure you want to request allocation for the asset "${selectedAssetForRequest.asset_name}"?`)) {
      return;
    }
    setLoading(true);
    try {
      await createAssetRequest({
        asset: selectedAssetForRequest.id,
        request_type: 'ALLOCATION',
        employee_remarks: requestRemarks
      });
      alert('Asset allocation request submitted successfully!');
      setShowRequestModal(false);
      await fetchMyRequests();
    } catch (error) {
      console.error('Allocation request error:', error);
      alert('Error submitting allocation request: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: 'badge-warning',
      APPROVED: 'badge-success',
      REJECTED: 'badge-danger',
      RETURNED: 'badge-secondary'
    };
    return badges[status] || 'badge-secondary';
  };

  const getAssetEmoji = (categoryName) => {
    if (!categoryName) return '📦';
    const name = categoryName.toLowerCase();
    if (name.includes('laptop') || name.includes('macbook') || name.includes('computer')) return '💻';
    if (name.includes('mobile') || name.includes('phone') || name.includes('smartphone')) return '📱';
    if (name.includes('monitor') || name.includes('display') || name.includes('screen')) return '🖥️';
    if (name.includes('id') || name.includes('badge') || name.includes('card')) return '🪪';
    if (name.includes('mouse')) return '🖱️';
    if (name.includes('keyboard')) return '⌨️';
    if (name.includes('headphone') || name.includes('headset') || name.includes('audio')) return '🎧';
    if (name.includes('tablet') || name.includes('ipad')) return '📱';
    return '📦';
  };

  return (
    <div className="asset-management-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Assets Portal</h2>
          <p className="page-subtitle">View your assets, request new ones, and manage returns</p>
        </div>
        <button 
          className="bulk-btn" 
          onClick={async () => {
            await fetchMyAssets();
            await fetchAvailableAssets();
            await fetchMyRequests();
          }}
        >
          🔄 Refresh Data
        </button>
      </div>

      {/* Modern HSL Styled Tabs */}
      <div className="tabs-container" style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', margin: '20px 0', gap: '15px' }}>
        <button 
          onClick={() => setActiveTab('my-assets')}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: 'none',
            fontSize: '15px',
            fontWeight: 'bold',
            color: activeTab === 'my-assets' ? '#0f766e' : '#64748b',
            borderBottom: activeTab === 'my-assets' ? '3px solid #0f766e' : '3px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          💻 My Assigned Assets
        </button>
        <button 
          onClick={() => setActiveTab('request-assets')}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: 'none',
            fontSize: '15px',
            fontWeight: 'bold',
            color: activeTab === 'request-assets' ? '#0f766e' : '#64748b',
            borderBottom: activeTab === 'request-assets' ? '3px solid #0f766e' : '3px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          ➕ Request New Assets
        </button>
        <button 
          onClick={() => setActiveTab('request-status')}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: 'none',
            fontSize: '15px',
            fontWeight: 'bold',
            color: activeTab === 'request-status' ? '#0f766e' : '#64748b',
            borderBottom: activeTab === 'request-status' ? '3px solid #0f766e' : '3px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          📜 Request Tracking & Status
        </button>
      </div>

      {/* Tab 1: My Assets */}
      {activeTab === 'my-assets' && (
        <div className="assets-grid" style={{ marginTop: '10px' }}>
          {myAssets.length === 0 ? (
            <p className="no-data" style={{ gridColumn: '1/-1' }}>No assets currently assigned to you.</p>
          ) : (
            myAssets.map(asset => (
              <div key={asset.id} className="asset-card" style={{ display: 'flex', flexDirection: 'column', minHeight: '300px' }}>
                <div style={{ width: '100%', height: '130px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {asset.image ? (
                    <img src={asset.image} alt={asset.asset_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '48px' }}>
                      {getAssetEmoji(asset.asset_details?.category_details?.name)}
                    </span>
                  )}
                </div>
                <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '15px', fontWeight: 'bold' }}>{asset.asset_details?.asset_name}</h3>
                  <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'capitalize', marginBottom: '8px' }}>
                    Type: {asset.asset_details?.category_details?.name}
                  </span>
                  
                  {asset.asset_details?.brand && <p style={{ margin: '0 0 6px 0', fontSize: '13px' }}>Brand: <strong>{asset.asset_details?.brand}</strong></p>}
                  {asset.asset_details?.model && <p style={{ margin: '0 0 6px 0', fontSize: '13px' }}>Model: <strong>{asset.asset_details?.model}</strong></p>}
                  {asset.asset_details?.serial_number && <p style={{ margin: '0 0 6px 0', fontSize: '13px' }}>SN: <strong>{asset.asset_details?.serial_number}</strong></p>}
                  
                  <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#0f766e' }}>
                      Assigned: {asset.assigned_date ? new Date(asset.assigned_date).toLocaleDateString() : '-'}
                    </span>
                    <button 
                      className="delete-btn" 
                      onClick={() => handleOpenReturnModal(asset)}
                      style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#ef4444' }}
                    >
                      ↩️ Request Return
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Request Assets */}
      {activeTab === 'request-assets' && (
        <div className="assets-grid" style={{ marginTop: '10px' }}>
          {availableAssets.length === 0 ? (
            <p className="no-data" style={{ gridColumn: '1/-1' }}>No company assets available to request at the moment.</p>
          ) : (
            availableAssets.map(asset => (
              <div key={asset.id} className="asset-card" style={{ display: 'flex', flexDirection: 'column', minHeight: '300px' }}>
                <div style={{ width: '100%', height: '130px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {asset.image ? (
                    <img src={asset.image} alt={asset.asset_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '48px' }}>
                      {getAssetEmoji(asset.category_details?.name)}
                    </span>
                  )}
                </div>
                <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '15px', fontWeight: 'bold' }}>{asset.asset_name}</h3>
                  <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'capitalize', marginBottom: '8px' }}>
                    Type: {asset.category_details?.name}
                  </span>
                  
                  {asset.brand && <p style={{ margin: '0 0 6px 0', fontSize: '13px' }}>Brand: <strong>{asset.brand}</strong></p>}
                  {asset.model && <p style={{ margin: '0 0 6px 0', fontSize: '13px' }}>Model: <strong>{asset.model}</strong></p>}
                  
                  <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#0f766e', fontWeight: 'bold' }}>Available</span>
                    <button 
                      className="add-asset-btn" 
                      onClick={() => handleOpenRequestModal(asset)}
                      style={{ padding: '6px 12px', fontSize: '12px', background: '#0f766e' }}
                    >
                      ➕ Request Allocation
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Request Status */}
      {activeTab === 'request-status' && (
        <div className="table-wrapper" style={{ marginTop: '10px' }}>
          {fetching ? (
            <p className="no-data">Loading requests...</p>
          ) : requests.length === 0 ? (
            <p className="no-data">No request logs found.</p>
          ) : (
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Asset Name</th>
                  <th>Type</th>
                  <th>Request Type</th>
                  <th>Request Date</th>
                  <th>Status</th>
                  <th>HR/Admin Remarks</th>
                  <th>Approval Date</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr key={req.id}>
                    <td>
                      <strong>{req.asset_details?.asset_name || 'Asset Deleted'}</strong>
                      {req.asset_details?.serial_number && <div style={{ fontSize: '11px', color: '#64748b' }}>SN: {req.asset_details.serial_number}</div>}
                    </td>
                    <td>{req.asset_details?.category_details?.name || '-'}</td>
                    <td>
                      <span className={`badge ${req.request_type === 'ALLOCATION' ? 'badge-success' : 'badge-warning'}`} style={{ backgroundColor: req.request_type === 'ALLOCATION' ? '#e0f2fe' : '#fef3c7', color: req.request_type === 'ALLOCATION' ? '#0369a1' : '#b45309', border: '1px solid', borderColor: req.request_type === 'ALLOCATION' ? '#bae6fd' : '#fde68a' }}>
                        {req.request_type === 'ALLOCATION' ? 'Allocation Request' : 'Return Request'}
                      </span>
                    </td>
                    <td>{new Date(req.request_date).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td>{req.admin_remarks || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No remarks</span>}</td>
                    <td>{req.approval_date ? new Date(req.approval_date).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Request Return Modal */}
      {showReturnModal && selectedAssetForReturn && (
        <div className="modal-overlay" onClick={() => setShowReturnModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Request Return: {selectedAssetForReturn.asset_details?.asset_name}</h3>
              <button className="modal-close" onClick={() => setShowReturnModal(false)}>×</button>
            </div>
            <form onSubmit={handleReturnSubmit}>
              <div className="form-group">
                <label>Reason for Returning Asset *</label>
                <textarea
                  value={returnRemarks}
                  onChange={(e) => setReturnRemarks(e.target.value)}
                  placeholder="e.g., Upgrading to a new model, no longer needed, or has software/hardware faults"
                  rows="4"
                  required
                />
              </div>
              <button type="submit" className="submit-btn" disabled={loading} style={{ width: '100%', marginTop: '10px' }}>
                {loading ? 'Submitting...' : 'Submit Return Request'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Request Allocation Modal */}
      {showRequestModal && selectedAssetForRequest && (
        <div className="modal-overlay" onClick={() => setShowRequestModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Request Asset Allocation: {selectedAssetForRequest.asset_name}</h3>
              <button className="modal-close" onClick={() => setShowRequestModal(false)}>×</button>
            </div>
            <form onSubmit={handleRequestSubmit}>
              <div className="form-group">
                <label>Reason for Requesting this Asset *</label>
                <textarea
                  value={requestRemarks}
                  onChange={(e) => setRequestRemarks(e.target.value)}
                  placeholder="Explain why you need this asset allocated to you (e.g., for mobile testing, client presentation, etc.)"
                  rows="4"
                  required
                />
              </div>
              <button type="submit" className="submit-btn" disabled={loading} style={{ width: '100%', marginTop: '10px' }}>
                {loading ? 'Submitting...' : 'Submit Allocation Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAssetReturns;
