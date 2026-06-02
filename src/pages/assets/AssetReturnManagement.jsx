import React, { useEffect, useState } from "react";
import { getAssetAssignments, returnAsset, getAssetRequests, approveAssetRequest, rejectAssetRequest } from "../../api/assets";
import "../../styles/employees.css";

export default function AssetReturnManagement() {
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' or 'returns'
  
  // State for Returns
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [isReturnModalVisible, setIsReturnModalVisible] = useState(false);
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [returnFormData, setReturnFormData] = useState({ condition: 'GOOD', remarks: '' });
  
  // State for Requests
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [isRequestModalVisible, setIsRequestModalVisible] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);
  const [requestAction, setRequestAction] = useState('approve');
  const [requestRemarks, setRequestRemarks] = useState('');

  useEffect(() => {
    if (activeTab === 'returns') fetchAssignments();
    if (activeTab === 'requests') fetchRequests();
  }, [activeTab]);

  const fetchAssignments = async () => {
    try {
      setLoadingAssignments(true);
      const res = await getAssetAssignments({ status: "ACTIVE" });
      const filtered = (res.data?.results || res.data || []).filter(a => a.status === "ACTIVE");
      setAssignments(filtered);
    } catch (err) {
      alert("Failed to load active assignments");
    } finally {
      setLoadingAssignments(false);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoadingRequests(true);
      const res = await getAssetRequests({ status: 'PENDING' });
      setRequests(res.data?.results || res.data || []);
    } catch (err) {
      alert("Failed to load asset requests");
    } finally {
      setLoadingRequests(false);
    }
  };

  // Return Handlers
  const handleReturn = (record) => {
    setActiveAssignment(record);
    setReturnFormData({ condition: 'GOOD', remarks: '' });
    setIsReturnModalVisible(true);
  };

  const handleSaveReturn = async (e) => {
    e.preventDefault();
    if (!returnFormData.condition) {
      alert("Please select a return condition.");
      return;
    }
    
    try {
      const payload = {
        assignment: activeAssignment.id,
        condition: returnFormData.condition,
        remarks: returnFormData.remarks,
        returned_by: activeAssignment.employee
      };
      await returnAsset(payload);
      setIsReturnModalVisible(false);
      fetchAssignments();
    } catch (err) {
      alert(err.response?.data?.detail || "An error occurred");
    }
  };

  // Request Handlers
  const handleRequestAction = (request, action) => {
    setActiveRequest(request);
    setRequestAction(action);
    setRequestRemarks('');
    setIsRequestModalVisible(true);
  };

  const handleSaveRequest = async (e) => {
    e.preventDefault();
    try {
      if (requestAction === 'approve') {
        await approveAssetRequest(activeRequest.id, { remarks: requestRemarks });
      } else {
        await rejectAssetRequest(activeRequest.id, { remarks: requestRemarks });
      }
      setIsRequestModalVisible(false);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.detail || "An error occurred processing request");
    }
  };

  return (
    <div className="employees-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Asset Requests & Returns</h2>
          <p className="page-subtitle">Manage employee requests and asset returns</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
        <button 
          onClick={() => setActiveTab('requests')}
          style={{ 
            background: 'none', 
            border: 'none', 
            fontSize: '16px', 
            fontWeight: activeTab === 'requests' ? 'bold' : 'normal',
            color: activeTab === 'requests' ? '#0f766e' : '#64748b',
            cursor: 'pointer',
            borderBottom: activeTab === 'requests' ? '2px solid #0f766e' : 'none',
            paddingBottom: '10px',
            marginBottom: '-11px'
          }}
        >
          Pending Requests
        </button>
        <button 
          onClick={() => setActiveTab('returns')}
          style={{ 
            background: 'none', 
            border: 'none', 
            fontSize: '16px', 
            fontWeight: activeTab === 'returns' ? 'bold' : 'normal',
            color: activeTab === 'returns' ? '#0f766e' : '#64748b',
            cursor: 'pointer',
            borderBottom: activeTab === 'returns' ? '2px solid #0f766e' : 'none',
            paddingBottom: '10px',
            marginBottom: '-11px'
          }}
        >
          Revoke Assets (Take Back)
        </button>
      </div>

      {activeTab === 'requests' && (
        <div className="table-wrapper">
          {loadingRequests ? (
            <div className="empty-state">Loading pending requests...</div>
          ) : requests.length === 0 ? (
            <div className="empty-state">No pending requests</div>
          ) : (
            <table className="employees-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Category/Asset</th>
                  <th>Reason</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td><strong>#{request.id}</strong></td>
                    <td>{request.employee_details?.full_name}</td>
                    <td>
                      <span style={{ 
                        color: request.request_type === 'ALLOCATION' ? '#8b5cf6' : '#f59e0b',
                        fontWeight: 'bold' 
                      }}>
                        {request.request_type}
                      </span>
                    </td>
                    <td>
                      {request.request_type === 'ALLOCATION' 
                        ? request.category_details?.name 
                        : request.asset_details?.asset_name}
                    </td>
                    <td>{request.employee_remarks}</td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button className="action-btn" style={{ color: '#10b981', border: '1px solid #10b981' }} onClick={() => handleRequestAction(request, 'approve')}>Approve</button>
                        <button className="action-btn" style={{ color: '#ef4444', border: '1px solid #ef4444' }} onClick={() => handleRequestAction(request, 'reject')}>Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'returns' && (
        <div className="table-wrapper">
          {loadingAssignments ? (
            <div className="empty-state">Loading active assignments...</div>
          ) : assignments.length === 0 ? (
            <div className="empty-state">No active assignments to return</div>
          ) : (
            <table className="employees-table">
              <thead>
                <tr>
                  <th>Asset Code</th>
                  <th>Asset Name</th>
                  <th>Employee</th>
                  <th>Assigned Date</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td><strong>{assignment.asset_details?.asset_code}</strong></td>
                    <td>{assignment.asset_details?.asset_name}</td>
                    <td>{assignment.employee_details?.full_name}</td>
                    <td>{assignment.assigned_date ? new Date(assignment.assigned_date).toLocaleDateString() : '-'}</td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button className="action-btn action-btn-edit" onClick={() => handleReturn(assignment)}>
                          Take Back Asset
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Return Modal */}
      {isReturnModalVisible && (
        <div className="modal-overlay" onClick={() => setIsReturnModalVisible(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Take Back Asset: {activeAssignment?.asset_details?.asset_name}</h3>
              <button className="modal-close" onClick={() => setIsReturnModalVisible(false)}>×</button>
            </div>
            <form onSubmit={handleSaveReturn} style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Return Condition *</label>
                <select 
                  value={returnFormData.condition}
                  onChange={(e) => setReturnFormData({ ...returnFormData, condition: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  required
                >
                  <option value="GOOD">Good</option>
                  <option value="NEEDS_REPAIR">Needs Repair</option>
                  <option value="DAMAGED">Damaged</option>
                  <option value="LOST">Lost</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Remarks</label>
                <textarea 
                  value={returnFormData.remarks}
                  onChange={(e) => setReturnFormData({ ...returnFormData, remarks: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  rows="4"
                  placeholder="Enter any notes about the return condition..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn" onClick={() => setIsReturnModalVisible(false)} style={{ background: '#f1f5f9', color: '#334155' }}>Cancel</button>
                <button type="submit" className="btn primary" style={{ background: '#0f766e', color: 'white' }}>Confirm Return</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Action Modal */}
      {isRequestModalVisible && (
        <div className="modal-overlay" onClick={() => setIsRequestModalVisible(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>{requestAction === 'approve' ? 'Approve' : 'Reject'} Request</h3>
              <button className="modal-close" onClick={() => setIsRequestModalVisible(false)}>×</button>
            </div>
            <form onSubmit={handleSaveRequest} style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '20px' }}>
              <div>
                <p>Are you sure you want to {requestAction} this {activeRequest?.request_type.toLowerCase()} request for <strong>{activeRequest?.employee_details?.full_name}</strong>?</p>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Admin Remarks (Optional)</label>
                <textarea 
                  value={requestRemarks}
                  onChange={(e) => setRequestRemarks(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  rows="3"
                  placeholder="Enter your remarks here..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn" onClick={() => setIsRequestModalVisible(false)} style={{ background: '#f1f5f9', color: '#334155' }}>Cancel</button>
                <button 
                  type="submit" 
                  className="btn primary" 
                  style={{ 
                    background: requestAction === 'approve' ? '#10b981' : '#ef4444', 
                    color: 'white' 
                  }}
                >
                  Confirm {requestAction === 'approve' ? 'Approval' : 'Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
