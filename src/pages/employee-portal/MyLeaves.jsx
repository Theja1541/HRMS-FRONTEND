import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import useInView from "../../hooks/useInView";
import useCountUp from "../../hooks/useCountUp";
import "../../styles/myLeaves.css";

export default function MyLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [viewModal, setViewModal] = useState(null);
  const [cancelModal, setCancelModal] = useState(null);
  const [actionDropdown, setActionDropdown] = useState(null);

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.action-dropdown-wrapper')) {
        setActionDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchMyLeaves = async () => {
    try {
      const res = await api.get("/leaves/me/");
      setLeaves(res.data);
    } catch {
      toast.error("Failed to fetch leaves");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelConfirm = async () => {
    try {
      await api.post(`/leaves/cancel/${cancelModal}/`);
      toast.success("Leave cancelled successfully");
      setCancelModal(null);
      fetchMyLeaves();
    } catch {
      toast.error("Failed to cancel leave");
    }
  };

  const calculateDays = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    return (e - s) / (1000 * 60 * 60 * 24) + 1;
  };

  const filteredLeaves =
    filter === "ALL"
      ? leaves
      : leaves.filter((leave) => leave.status === filter);

  const summary = {
    total: leaves.length,
    pending: leaves.filter((l) => l.status === "PENDING").length,
    approved: leaves.filter((l) => l.status === "APPROVED").length,
    rejected: leaves.filter((l) => l.status === "REJECTED").length,
    cancelled: leaves.filter((l) => l.status === "CANCELLED").length,
  };

  const [summaryRef, isVisible] = useInView();

  const animatedTotal = useCountUp(isVisible ? summary.total : 0);
  const animatedPending = useCountUp(isVisible ? summary.pending : 0);
  const animatedApproved = useCountUp(isVisible ? summary.approved : 0);
  const animatedRejected = useCountUp(isVisible ? summary.rejected : 0);
  const animatedCancelled = useCountUp(isVisible ? summary.cancelled : 0);

  if (loading) {
    return <p style={{ padding: 20 }}>Loading leaves...</p>;
  }

  return (
    <div className="my-leaves-page">
      <div className="page-header">
        <div>
          <h2>My Leaves</h2>
          <p>Track your leave requests</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="leave-summary" ref={summaryRef}>
        <div
          className={`summary-card ${isVisible ? "show" : ""}`}
          style={{ transitionDelay: "0ms" }}
        >
          Total <br /> {animatedTotal}
        </div>

        <div
          className={`summary-card pending ${isVisible ? "show" : ""}`}
          style={{ transitionDelay: "100ms" }}
        >
          Pending <br /> {animatedPending}
        </div>

        <div
          className={`summary-card approved ${isVisible ? "show" : ""}`}
          style={{ transitionDelay: "200ms" }}
        >
          Approved <br /> {animatedApproved}
        </div>

        <div
          className={`summary-card rejected ${isVisible ? "show" : ""}`}
          style={{ transitionDelay: "300ms" }}
        >
          Rejected <br /> {animatedRejected}
        </div>

        <div
          className={`summary-card cancelled ${isVisible ? "show" : ""}`}
          style={{ transitionDelay: "400ms" }}
        >
          Cancelled <br /> {animatedCancelled}
        </div>
      </div>

      {leaves.length === 0 ? (
        <div className="empty-state">
          <p>No leave requests found</p>
        </div>
      ) : (
        <>
          {/* Filter Buttons */}
          <div className="leave-filters">
            {["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"].map(
              (status) => (
                <button
                  key={status}
                  className={filter === status ? "active" : ""}
                  onClick={() => setFilter(status)}
                >
                  {status}
                </button>
              )
            )}
          </div>

          {/* Table */}
          <div className="leaves-table-wrapper">
            <table className="leaves-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Days</th>
                  <th>Status</th>
                  <th>Reason</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredLeaves.map((leave) => (
                  <tr key={leave.id}>
                    <td>{leave.leave_type_name}</td>
                    <td>
                      {new Date(leave.start_date).toLocaleDateString()}
                    </td>
                    <td>
                      {new Date(leave.end_date).toLocaleDateString()}
                    </td>
                    <td>
                      {calculateDays(
                        leave.start_date,
                        leave.end_date
                      )}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${leave.status?.toLowerCase()}`}
                      >
                        {leave.status === "PENDING" && "🟡 Pending"}
                        {leave.status === "APPROVED" && "🟢 Approved"}
                        {leave.status === "REJECTED" && "🔴 Rejected"}
                        {leave.status === "CANCELLED" && "⚫ Cancelled"}
                      </span>
                    </td>
                    <td className="reason">{leave.reason}</td>
                    <td className="action-cell">
                      <div className="action-dropdown-wrapper">
                        <button
                          className="action-btn"
                          onClick={() => setActionDropdown(actionDropdown === leave.id ? null : leave.id)}
                        >
                          ⋮
                        </button>
                        {actionDropdown === leave.id && (
                          <div className="action-dropdown">
                            <button onClick={() => { setViewModal(leave); setActionDropdown(null); }}>👁️ View</button>
                            {(leave.status === "PENDING" || leave.status === "APPROVED") && (
                              <button onClick={() => { setCancelModal(leave.id); setActionDropdown(null); }}>❌ Cancel</button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* View Modal */}
      {viewModal && (
        <div className="modal-overlay" onClick={() => setViewModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Leave Details</h3>
              <button className="close-btn" onClick={() => setViewModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="label">Employee Name:</span>
                <span className="value">{viewModal.employee_name}</span>
              </div>
              <div className="detail-row">
                <span className="label">Leave Type:</span>
                <span className="value">{viewModal.leave_type_name}</span>
              </div>
              <div className="detail-row">
                <span className="label">Start Date:</span>
                <span className="value">{new Date(viewModal.start_date).toLocaleDateString()}</span>
              </div>
              <div className="detail-row">
                <span className="label">End Date:</span>
                <span className="value">{new Date(viewModal.end_date).toLocaleDateString()}</span>
              </div>
              <div className="detail-row">
                <span className="label">Number of Days:</span>
                <span className="value">{calculateDays(viewModal.start_date, viewModal.end_date)}</span>
              </div>
              <div className="detail-row">
                <span className="label">Reason:</span>
                <span className="value">{viewModal.reason}</span>
              </div>
              <div className="detail-row">
                <span className="label">Status:</span>
                <span className={`status-badge ${viewModal.status?.toLowerCase()}`}>
                  {viewModal.status === "PENDING" && "🟡 Pending"}
                  {viewModal.status === "APPROVED" && "🟢 Approved"}
                  {viewModal.status === "REJECTED" && "🔴 Rejected"}
                  {viewModal.status === "CANCELLED" && "⚫ Cancelled"}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Applied Date:</span>
                <span className="value">{new Date(viewModal.applied_on).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModal && (
        <div className="modal-overlay" onClick={() => setCancelModal(null)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cancel Leave</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to cancel this leave?</p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setCancelModal(null)}>No</button>
              <button className="btn-danger" onClick={handleCancelConfirm}>Yes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}