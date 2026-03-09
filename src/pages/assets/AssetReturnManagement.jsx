import React, { useState, useEffect } from 'react';
import { assetReturnAPI } from '../../api/assets';
import '../../styles/assetReturn.css';
import '../../styles/attendance.css';

const AssetReturnManagement = () => {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    if (fetching) return;
    setFetching(true);
    try {
      const response = await assetReturnAPI.getAllRequests();
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

  const handleApprove = async (requestId) => {
    if (!window.confirm('Are you sure you want to approve this request?')) return;
    
    setLoading(true);
    try {
      await assetReturnAPI.approveRequest(requestId, remarks);
      alert('Request approved successfully!');
      setShowModal(false);
      setRemarks('');
      setSelectedRequest(null);
      await fetchRequests();
    } catch (error) {
      console.error('Approve error:', error);
      alert('Error approving request: ' + (error.response?.data?.detail || error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (requestId) => {
    if (!window.confirm('Are you sure you want to reject this request?')) return;
    
    setLoading(true);
    try {
      await assetReturnAPI.rejectRequest(requestId, remarks);
      alert('Request rejected successfully!');
      setShowModal(false);
      setRemarks('');
      setSelectedRequest(null);
      await fetchRequests();
    } catch (error) {
      console.error('Reject error:', error);
      alert('Error rejecting request: ' + (error.response?.data?.detail || error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const openModal = (request) => {
    setSelectedRequest(request);
    setRemarks('');
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: 'badge-warning',
      APPROVED: 'badge-success',
      REJECTED: 'badge-danger'
    };
    return badges[status] || 'badge-secondary';
  };

  const filteredRequests = requests.filter(req => {
    if (filter === 'ALL') return true;
    return req.status === filter;
  });

  return (
    <div className="attendance-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Asset Return Management</h2>
          <p className="page-subtitle">Review and manage employee asset return requests</p>
        </div>
        <button className="bulk-btn" onClick={fetchRequests} disabled={fetching}>
          🔄 {fetching ? 'Loading...' : 'Refresh'}
        </button>
      </div>
      <div className="bulk-action-bar">
        <div className="filter-buttons" style={{display: 'flex', gap: '10px'}}>
          <button 
            className={filter === 'ALL' ? 'btn-filter active' : 'btn-filter'}
            onClick={() => setFilter('ALL')}
            style={{padding: '8px 16px', borderRadius: '8px', border: 'none', background: filter === 'ALL' ? '#2563eb' : '#f1f5f9', color: filter === 'ALL' ? 'white' : '#0f172a', cursor: 'pointer', fontSize: '13px', fontWeight: '500'}}
          >
            All ({requests.length})
          </button>
          <button 
            className={filter === 'PENDING' ? 'btn-filter active' : 'btn-filter'}
            onClick={() => setFilter('PENDING')}
            style={{padding: '8px 16px', borderRadius: '8px', border: 'none', background: filter === 'PENDING' ? '#2563eb' : '#f1f5f9', color: filter === 'PENDING' ? 'white' : '#0f172a', cursor: 'pointer', fontSize: '13px', fontWeight: '500'}}
          >
            Pending ({requests.filter(r => r.status === 'PENDING').length})
          </button>
          <button 
            className={filter === 'APPROVED' ? 'btn-filter active' : 'btn-filter'}
            onClick={() => setFilter('APPROVED')}
            style={{padding: '8px 16px', borderRadius: '8px', border: 'none', background: filter === 'APPROVED' ? '#2563eb' : '#f1f5f9', color: filter === 'APPROVED' ? 'white' : '#0f172a', cursor: 'pointer', fontSize: '13px', fontWeight: '500'}}
          >
            Approved ({requests.filter(r => r.status === 'APPROVED').length})
          </button>
          <button 
            className={filter === 'REJECTED' ? 'btn-filter active' : 'btn-filter'}
            onClick={() => setFilter('REJECTED')}
            style={{padding: '8px 16px', borderRadius: '8px', border: 'none', background: filter === 'REJECTED' ? '#2563eb' : '#f1f5f9', color: filter === 'REJECTED' ? 'white' : '#0f172a', cursor: 'pointer', fontSize: '13px', fontWeight: '500'}}
          >
            Rejected ({requests.filter(r => r.status === 'REJECTED').length})
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        {fetching ? (
          <p className="no-data">Loading...</p>
        ) : filteredRequests.length === 0 ? (
          <p className="no-data">No asset return requests found.</p>
        ) : (
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Asset Type</th>
                <th>Asset Name</th>
                <th>Serial Number</th>
                <th>Condition</th>
                <th>Return Date</th>
                <th>Status</th>
                <th>Request Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request.id}>
                  <td>{request.employee_name}</td>
                  <td>{request.department}</td>
                  <td>{request.asset_type}</td>
                  <td>{request.asset_name}</td>
                  <td>{request.serial_number || '-'}</td>
                  <td>
                    <span className={`condition-badge condition-${request.condition.toLowerCase()}`}>
                      {request.condition}
                    </span>
                  </td>
                  <td>{new Date(request.return_date).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td>{new Date(request.request_date).toLocaleDateString()}</td>
                  <td>
                    {request.status === 'PENDING' ? (
                      <button 
                        className="btn-action"
                        onClick={() => openModal(request)}
                      >
                        Review
                      </button>
                    ) : (
                      <button 
                        className="btn-view"
                        onClick={() => openModal(request)}
                      >
                        View
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Asset Return Request Details</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">Employee:</span>
                <span className="detail-value">{selectedRequest.employee_name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Department:</span>
                <span className="detail-value">{selectedRequest.department}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Asset Type:</span>
                <span className="detail-value">{selectedRequest.asset_type}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Asset Name:</span>
                <span className="detail-value">{selectedRequest.asset_name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Serial Number:</span>
                <span className="detail-value">{selectedRequest.serial_number || '-'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Condition:</span>
                <span className="detail-value">{selectedRequest.condition}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Return Date:</span>
                <span className="detail-value">{new Date(selectedRequest.return_date).toLocaleDateString()}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Description:</span>
                <span className="detail-value">{selectedRequest.description || '-'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Comments:</span>
                <span className="detail-value">{selectedRequest.comments || '-'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className={`badge ${getStatusBadge(selectedRequest.status)}`}>
                  {selectedRequest.status}
                </span>
              </div>
              
              {selectedRequest.admin_remarks && (
                <div className="detail-row">
                  <span className="detail-label">Admin Remarks:</span>
                  <span className="detail-value">{selectedRequest.admin_remarks}</span>
                </div>
              )}

              {selectedRequest.status === 'PENDING' && (
                <>
                  <div className="form-group">
                    <label>Remarks</label>
                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Add your remarks here..."
                      rows="3"
                    />
                  </div>

                  <div className="modal-actions">
                    <button 
                      className="btn-approve"
                      onClick={() => handleApprove(selectedRequest.id)}
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'Approve'}
                    </button>
                    <button 
                      className="btn-reject"
                      onClick={() => handleReject(selectedRequest.id)}
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'Reject'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetReturnManagement;
