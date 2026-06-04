import React, { useState, useEffect } from 'react';
import { submitResignation, getResignationRequests } from '../api/separationApi';
import toast from 'react-hot-toast';
import '../../../styles/separation.css';

export default function ResignationForm() {
  const [formData, setFormData] = useState({
    reason: '',
    detailed_explanation: '',
    notice_period_days: 30,
  });
  const [loading, setLoading] = useState(false);
  const [existingRequest, setExistingRequest] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    fetchMyRequest();
  }, []);

  const fetchMyRequest = async () => {
    try {
      const res = await getResignationRequests();
      const requests = res.data.results || res.data;
      if (requests.length > 0) {
        setExistingRequest(requests[0]);
      }
    } catch (error) {
      console.error("Failed to fetch my request", error);
    } finally {
      setPageLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const confirmSubmit = async () => {
    setLoading(true);
    try {
      const res = await submitResignation(formData);
      toast.success("Resignation submitted successfully.");
      setExistingRequest(res.data);
      setShowConfirmModal(false);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to submit resignation.");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <div className="separation-page"><p style={{color: '#64748b'}}>Loading...</p></div>;
  }

  return (
    <div className="separation-page relative">
      <div className="page-header">
        <h2>{existingRequest ? 'My Resignation Status' : 'Submit Resignation'}</h2>
        <p>
          {existingRequest 
            ? 'Track the progress of your separation workflow.' 
            : 'Initiate your separation process by providing the details below.'}
        </p>
      </div>

      <div className="resignation-layout">
        {existingRequest ? (
          <div className="form-card">
            <h3 style={{ marginTop: 0, borderBottom: '1px solid #e5e7eb', paddingBottom: '16px', color: '#1e293b' }}>Status Tracker</h3>
            
            <div className="info-grid mt-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Reason</div>
                <div style={{ color: '#0f172a', fontWeight: 500 }}>{existingRequest.reason}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Submitted On</div>
                <div style={{ color: '#0f172a', fontWeight: 500 }}>{new Date(existingRequest.submitted_on).toLocaleDateString()}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Notice Period</div>
                <div style={{ color: '#0f172a', fontWeight: 500 }}>{existingRequest.notice_period_days} Days</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Last Working Day</div>
                <div style={{ color: '#0f172a', fontWeight: 500 }}>{existingRequest.last_working_day || 'Pending confirmation'}</div>
              </div>
            </div>

            <div style={{ marginTop: '30px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center' }}>
              <strong style={{ color: '#334155', marginRight: '12px' }}>Current Status: </strong> 
              <span className="status-badge" style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '6px 12px', borderRadius: '999px', fontSize: '13px', fontWeight: 600 }}>
                {existingRequest.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        ) : (
          <div className="form-card">
            <form onSubmit={handleInitialSubmit}>
              <div className="form-group">
                <label>Reason for Resignation <span style={{color: '#ef4444'}}>*</span></label>
                <input
                  type="text"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="e.g. Better Opportunity, Relocation"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Detailed Explanation <span style={{color: '#ef4444'}}>*</span></label>
                <textarea
                  name="detailed_explanation"
                  value={formData.detailed_explanation}
                  onChange={handleChange}
                  placeholder="Please provide more details..."
                  rows={4}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Notice Period (Days) <span style={{color: '#ef4444'}}>*</span></label>
                <input
                  type="number"
                  name="notice_period_days"
                  value={formData.notice_period_days}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-actions" style={{ borderTop: '1px solid #e5e7eb', paddingTop: '24px', marginTop: '32px' }}>
                <button
                  type="submit"
                  className="btn primary"
                  disabled={loading}
                >
                  Proceed to Submit
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="info-sidebar">
          <div className="info-card" style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}>
            <h3 style={{ color: '#0369a1' }}>Separation Guidelines</h3>
            <ul style={{ color: '#0c4a6e' }}>
              <li style={{ marginBottom: '8px' }}>Notice period is mandatory as per company policy.</li>
              <li style={{ marginBottom: '8px' }}>You must return all company assets before your LWD.</li>
              <li>Final settlement will be processed within 45 days of LWD.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: '0' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
                <span style={{ fontSize: '24px' }}>⚠️</span> Confirm Resignation
              </h2>
            </div>
            
            <div className="modal-body">
              <p style={{ color: '#475569', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>
                Are you sure you want to submit your resignation? This action will formally initiate the separation workflow and notify your manager and HR.
              </p>
              
              <div style={{ marginTop: '20px', padding: '12px', background: '#fffbeb', borderLeft: '4px solid #f59e0b', borderRadius: '4px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#92400e' }}>
                  <strong>Note:</strong> Once submitted, your request cannot be undone from the portal. You will need to contact HR directly if you wish to withdraw it.
                </p>
              </div>
            </div>

            <div className="modal-footer" style={{ borderTop: 'none', background: 'white', paddingTop: '0' }}>
              <button 
                className="btn-modal btn-cancel" 
                onClick={() => setShowConfirmModal(false)}
                disabled={loading}
              >
                Go Back
              </button>
              <button 
                className="btn-modal btn-reject" 
                onClick={confirmSubmit}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Yes, Submit Resignation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
