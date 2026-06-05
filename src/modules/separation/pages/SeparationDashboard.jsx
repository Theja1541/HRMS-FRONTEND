import React, { useEffect, useState } from 'react';
import { getResignationRequests, approveResignation } from '../api/separationApi';
import toast from 'react-hot-toast';
import '../../../styles/separation.css';
import AssetClearanceCard from '../components/AssetClearanceCard';

export default function SeparationDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await getResignationRequests();
      setRequests(res.data.results || res.data);
    } catch (error) {
      console.error("Failed to fetch requests", error);
      toast.error("Failed to load separation requests.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'SUBMITTED':
      case 'MANAGER_APPROVED':
        return 'submitted';
      case 'HR_APPROVED':
        return 'approved';
      case 'RELIEVED':
        return 'relieved';
      case 'REJECTED':
        return 'rejected';
      default:
        return '';
    }
  };

  const handleAction = async (actionType) => {
    if (!selectedRequest) return;
    setProcessing(true);
    try {
      await approveResignation(selectedRequest.id, {
        action: actionType,
        stage: 'HR', // Hardcoded as HR for dashboard for now
        remarks: remarks
      });
      toast.success(`Request ${actionType.toLowerCase()} successfully.`);
      setSelectedRequest(null);
      setRemarks('');
      fetchRequests();
    } catch (error) {
      toast.error("Failed to process action.");
    } finally {
      setProcessing(false);
    }
  };

  const pendingCount = requests.filter(r => r.status === 'SUBMITTED' || r.status === 'MANAGER_APPROVED').length;
  const relievedCount = requests.filter(r => r.status === 'RELIEVED').length;

  return (
    <div className="separation-page relative">
      <div className="page-header">
        <h2>Separation Dashboard</h2>
        <p>Monitor employee resignations and settlements.</p>
      </div>
      
      <div className="dashboard-cards">
        <div className="stat-card">
          <h3>Total Requests</h3>
          <p className="value">{requests.length}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Approvals</h3>
          <p className="value">{pendingCount}</p>
        </div>
        <div className="stat-card">
          <h3>Relieved</h3>
          <p className="value">{relievedCount}</p>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h3>Recent Resignations</h3>
        </div>
        
        <div className="table-responsive">
          {loading ? (
            <p style={{ padding: '20px', color: '#6b7280' }}>Loading...</p>
          ) : (
            <table className="separation-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>LWD</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{req.employee_name}</div>
                    </td>
                    <td>{req.department}</td>
                    <td>{req.last_working_day || 'Pending'}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(req.status)}`}>
                        {req.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn-view"
                        onClick={() => setSelectedRequest(req)}
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: '#6b7280', padding: '30px' }}>
                      No separation requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* REVIEW MODAL */}
      {selectedRequest && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Review Resignation</h2>
              <button className="modal-close" onClick={() => setSelectedRequest(null)}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="modal-info-panel">
                <div className="info-item">
                  <span className="info-label">Employee</span>
                  <span className="info-value">{selectedRequest.employee_name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Department</span>
                  <span className="info-value">{selectedRequest.department}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Notice Period</span>
                  <span className="info-value">{selectedRequest.notice_period_days} Days</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Status</span>
                  <span className={`status-badge ${getStatusBadgeClass(selectedRequest.status)}`}>
                    {selectedRequest.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              
              <div className="modal-section">
                <label className="section-label">Reason for Resignation</label>
                <div className="section-content text-box">
                  {selectedRequest.reason}
                </div>
              </div>

              <div className="modal-section">
                <label className="section-label">Detailed Explanation</label>
                <div className="section-content text-box whitespace-pre-wrap">
                  {selectedRequest.detailed_explanation}
                </div>
              </div>

              <div className="modal-section">
                <label className="section-label">HR Remarks</label>
                <textarea 
                  className="modal-textarea"
                  rows="3"
                  placeholder="Enter remarks for approval/rejection..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>

              {selectedRequest.status === 'HR_APPROVED' && (
                <div className="modal-section" style={{ marginTop: '2rem' }}>
                  <AssetClearanceCard 
                    resignationId={selectedRequest.id} 
                    employeeId={selectedRequest.employee} 
                  />
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button 
                className="btn-modal btn-cancel" 
                onClick={() => setSelectedRequest(null)}
                disabled={processing}
              >
                Cancel
              </button>
              <div className="modal-actions">
                <button 
                  className="btn-modal btn-reject" 
                  onClick={() => handleAction('REJECTED')}
                  disabled={processing}
                >
                  Reject Request
                </button>
                {selectedRequest.status !== 'HR_APPROVED' && selectedRequest.status !== 'RELIEVED' && (
                  <button 
                    className="btn-modal btn-approve" 
                    onClick={() => handleAction('APPROVED')}
                    disabled={processing}
                  >
                    Approve Request
                  </button>
                )}
                {selectedRequest.status === 'HR_APPROVED' && (
                  <button 
                    className="btn-modal" 
                    style={{ background: '#2563eb', color: 'white' }}
                    onClick={() => handleAction('RELIEVED')}
                    disabled={processing}
                  >
                    Mark as Relieved
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
