import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import "../../styles/myLeaves.css";

export default function MyLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [viewModal, setViewModal] = useState(null);
  const [cancelModal, setCancelModal] = useState(null);

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const fetchMyLeaves = async () => {
    try {
      const [leavesRes, balancesRes] = await Promise.allSettled([
        api.get("/leaves/me/"),
        api.get("/leaves/my-balance/"),
      ]);

      if (leavesRes.status === "fulfilled") {
        setLeaves(leavesRes.value.data || []);
      } else {
        setLeaves([]);
        toast.error("Failed to fetch leave requests");
      }

      if (balancesRes.status === "fulfilled") {
        setBalances(balancesRes.value.data || []);
      } else {
        setBalances([]);
        toast.error("Failed to fetch leave balances");
      }
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

  const getDocumentUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `http://127.0.0.1:8000${url}`;
  };

  const filteredLeaves =
    filter === "ALL"
      ? leaves
      : leaves.filter((leave) => leave.status === filter);

  const requestSummary = {
    total: leaves.length,
    pending: leaves.filter((l) => l.status === "PENDING").length,
    approved: leaves.filter((l) => l.status === "APPROVED").length,
    rejected: leaves.filter((l) => l.status === "REJECTED").length,
    cancelled: leaves.filter((l) => l.status === "CANCELLED").length,
  };

  const balanceSummary = {
    leaveTypes: balances.length,
    allocated: balances.reduce(
      (total, item) => total + Number(item.total_allocated || 0),
      0
    ),
    used: balances.reduce((total, item) => total + Number(item.used || 0), 0),
    remaining: balances.reduce(
      (total, item) => total + Number(item.remaining || 0),
      0
    ),
  };

  const kpiCards = [
    {
      label: "Leave Types",
      value: balanceSummary.leaveTypes,
      className: "kpi-blue",
    },
    {
      label: "Allocated",
      value: balanceSummary.allocated,
      className: "kpi-green",
    },
    {
      label: "Used",
      value: balanceSummary.used,
      className: "kpi-amber",
    },
    {
      label: "Remaining",
      value: balanceSummary.remaining,
      className: "kpi-indigo",
    },
    {
      label: "Requests",
      value: requestSummary.total,
      className: "kpi-rose",
    },
  ];

  if (loading) {
    return <p style={{ padding: 20 }}>Loading leaves...</p>;
  }

  return (
    <div className="my-leaves-page">
      <div className="page-header">
        <div>
          <h2 style={{ color: "white" }}>My Leaves</h2>
          <p style={{ color: "white" }}>Track your leave requests</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {kpiCards.map((card) => (
          <div key={card.label} className={`kpi-card ${card.className}`}>
            <span className="kpi-label">{card.label}</span>
            <span className="kpi-value">{card.value}</span>
          </div>
        ))}
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
                      <div className="leave-action-buttons">
                        <button
                          type="button"
                          className="table-action-btn action-view"
                          onClick={() => setViewModal(leave)}
                        >
                          View
                        </button>
                        {(leave.status === "PENDING" ||
                          leave.status === "APPROVED") && (
                          <button
                            type="button"
                            className="table-action-btn action-cancel"
                            onClick={() => setCancelModal(leave.id)}
                          >
                            Cancel
                          </button>
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
            <div className="modal-body" style={{ padding: '0 24px 24px 24px' }}>
              
              {/* Header Section */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center', paddingTop: '10px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#2563eb', fontWeight: 'bold' }}>
                  {viewModal.employee_name ? viewModal.employee_name.charAt(0) : 'E'}
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '18px', color: '#0f172a' }}>{viewModal.employee_name}</h4>
                  <p style={{ margin: '0', fontSize: '13px', color: '#64748b' }}>Leave Application Details</p>
                </div>
              </div>

              {/* Status and Type Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                  <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>Leave Type</p>
                  <p style={{ margin: '0', fontSize: '15px', color: '#0f172a', fontWeight: '600' }}>{viewModal.leave_type_name}</p>
                </div>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                  <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>Current Status</p>
                  <span className={`status-badge ${viewModal.status?.toLowerCase()}`} style={{ display: 'inline-flex', padding: '4px 10px', fontSize: '12px' }}>
                    {viewModal.status === "PENDING" && "🟡 Pending Review"}
                    {viewModal.status === "APPROVED" && "🟢 Approved"}
                    {viewModal.status === "REJECTED" && "🔴 Rejected"}
                    {viewModal.status === "CANCELLED" && "⚫ Cancelled"}
                  </span>
                </div>
              </div>

              {/* Date Information */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Start Date</p>
                  <p style={{ margin: '0', fontSize: '14px', color: '#1e293b', fontWeight: '500' }}>
                    {new Date(viewModal.start_date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div style={{ width: '1px', background: '#e2e8f0', margin: '0 16px' }}></div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>End Date</p>
                  <p style={{ margin: '0', fontSize: '14px', color: '#1e293b', fontWeight: '500' }}>
                    {new Date(viewModal.end_date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div style={{ width: '1px', background: '#e2e8f0', margin: '0 16px' }}></div>
                <div style={{ flex: '0 0 auto' }}>
                  <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Duration</p>
                  <p style={{ margin: '0', fontSize: '14px', color: '#2563eb', fontWeight: '600' }}>
                    {calculateDays(viewModal.start_date, viewModal.end_date)} day(s)
                  </p>
                </div>
              </div>

              {/* Reason */}
              <div style={{ marginBottom: '24px' }}>
                <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#334155', fontWeight: '600' }}>Reason for Leave</p>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', fontSize: '14px', color: '#475569', lineHeight: '1.6', border: '1px solid #f1f5f9' }}>
                  {viewModal.reason || "No reason provided."}
                </div>
              </div>

              {/* Document */}
              {viewModal.document && (
                <div style={{ marginBottom: '24px', padding: '16px', border: '1px dashed #cbd5e1', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fcfcfc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                      📎
                    </div>
                    <div>
                      <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>Supporting Document</p>
                      <p style={{ margin: '0', fontSize: '12px', color: '#64748b' }}>Attachment provided</p>
                    </div>
                  </div>
                  <a href={getDocumentUrl(viewModal.document)} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 16px', background: '#eff6ff', color: '#2563eb', textDecoration: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', transition: 'background 0.2s' }} onMouseOver={(e) => e.target.style.background = '#dbeafe'} onMouseOut={(e) => e.target.style.background = '#eff6ff'}>
                    View File
                  </a>
                </div>
              )}
              
              {/* Footer */}
              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #e2e8f0', textAlign: 'right' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Submitted on {new Date(viewModal.applied_on).toLocaleString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
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