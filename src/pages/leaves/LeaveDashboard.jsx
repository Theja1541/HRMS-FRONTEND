import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "../../styles/leaves.css";

export default function LeaveDashboard() {
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [approvedCount, setApprovedCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingLeaves();
    fetchApprovedCount();
  }, []);

  const fetchPendingLeaves = async () => {
    try {
      console.log("Fetching from: /leaves/requests/?status=PENDING");
      const res = await api.get("/leaves/requests/?status=PENDING");
      console.log("API Response:", res.data);
      console.log("Number of leaves:", res.data.length);
      if (res.data && Array.isArray(res.data)) {
        setPendingLeaves(res.data);
      } else {
        console.error("Invalid response format:", res.data);
        setPendingLeaves([]);
      }
    } catch (err) {
      console.error("Error fetching pending leaves:", err);
      console.error("Status:", err.response?.status);
      console.error("Response:", err.response?.data);
      if (err.response?.status === 403) {
        toast.error("You don't have permission to view leave requests. Please login as HR/Admin.");
      } else {
        toast.error(err.response?.data?.error || err.response?.data?.detail || "Failed to load pending leaves");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedCount = async () => {
    try {
      const res = await api.get("/leaves/requests/?status=APPROVED");
      if (res.data && Array.isArray(res.data)) {
        setApprovedCount(res.data.length);
      }
    } catch (err) {
      console.error("Error fetching approved leaves:", err);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`/leaves/approve/${id}/`);
      toast.success("Leave Approved");
      setSelectedLeave(null);
      fetchPendingLeaves();
    } catch (err) {
      toast.error(err.response?.data?.error || "Approval failed");
    }
  };

  const handleReject = async (id) => {
    try {
      await api.post(`/leaves/reject/${id}/`);
      toast.success("Leave Rejected");
      setSelectedLeave(null);
      fetchPendingLeaves();
    } catch (err) {
      toast.error(err.response?.data?.error || "Rejection failed");
    }
  };

  console.log("Rendering LeaveDashboard with", pendingLeaves.length, "leaves");

  return (
    <div className="leaves-page">
      <div className="leaves-header" style={{ background: 'linear-gradient(135deg, #0f172a, #2563eb)' }}>
        <div>
          <h2>Leave Dashboard - Pending Requests</h2>
          <p>Review and approve leave requests</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="btn"
            onClick={() => navigate("/approvals")}
            style={{ background: '#16a34a', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <span>Employees on Leave: {approvedCount}</span>
          </button>
          <button
            className="btn primary"
            onClick={() => navigate("/approvals")}
          >
            View Approved Leaves
          </button>
        </div>
      </div>

      {loading ? (
        <div className="leave-empty">Loading...</div>
      ) : pendingLeaves.length === 0 ? (
        <div className="leave-empty">🎉 No pending leave requests</div>
      ) : (
        <div className="leave-table-card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Found {pendingLeaves.length} pending leave(s)</p>
          </div>
          <table className="leave-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Days</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingLeaves.map((leave) => (
                <tr key={leave.id}>
                  <td>{leave.employee_name || 'N/A'}</td>
                  <td>{leave.leave_type_name || 'N/A'}</td>
                  <td>{leave.start_date || 'N/A'}</td>
                  <td>{leave.end_date || 'N/A'}</td>
                  <td>{leave.days || leave.total_days || 'N/A'}</td>
                  <td>
                    <button
                      className="btn"
                      onClick={() => setSelectedLeave(leave)}
                      style={{ marginRight: '8px', background: '#6366f1', color: 'white' }}
                    >
                      View
                    </button>
                    <button
                      className="btn primary"
                      onClick={() => handleApprove(leave.id)}
                      style={{ marginRight: '8px' }}
                    >
                      Approve
                    </button>
                    <button
                      className="btn danger"
                      onClick={() => handleReject(leave.id)}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Leave Details Modal */}
      {selectedLeave && (
        <div className="leave-modal-overlay" onClick={() => setSelectedLeave(null)}>
          <div className="leave-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Leave Request Details</h3>
            <div className="leave-detail">
              <strong>Employee:</strong> {selectedLeave.employee_name}
            </div>
            <div className="leave-detail">
              <strong>Leave Type:</strong> {selectedLeave.leave_type_name}
            </div>
            <div className="leave-detail">
              <strong>From Date:</strong> {selectedLeave.start_date}
            </div>
            <div className="leave-detail">
              <strong>To Date:</strong> {selectedLeave.end_date}
            </div>
            <div className="leave-detail">
              <strong>Total Days:</strong> {selectedLeave.days || selectedLeave.total_days}
            </div>
            <div className="leave-detail">
              <strong>Reason:</strong> {selectedLeave.reason}
            </div>
            <div className="leave-detail">
              <strong>Applied On:</strong> {new Date(selectedLeave.applied_on).toLocaleString()}
            </div>
            <div className="modal-actions">
              <button className="modal-close" onClick={() => setSelectedLeave(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}