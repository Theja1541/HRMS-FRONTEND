import { useEffect, useState } from "react";
import "../../styles/leaves.css";
import {
  exportLeavesToExcel,
  exportLeavesToPDF,
} from "../../utils/leaveExport";
import {
  getAllLeaveRequests,
  approveLeave,
  rejectLeave,
} from "../../api/leaves";
import toast from "react-hot-toast";
import { usePayroll } from "../../context/PayrollContext";


export default function LeaveApprovals() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isLocked } = usePayroll();

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const res = await getAllLeaveRequests();
      setLeaves(res.data);
    } catch (err) {
      toast.error("Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  };

  const pendingLeaves = leaves.filter(
    (l) => l.status === "PENDING"
  );

  const handleApprove = async (id) => {
    try {
      await approveLeave(id);
      toast.success("Leave Approved");
      fetchLeaves();
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Approval failed"
      );
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectLeave(id);
      toast.success("Leave Rejected");
      fetchLeaves();
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Rejection failed"
      );
    }
  };

  return (
    <div className="leaves-page">

      {/* HEADER */}
      <div className="leaves-header approvals">
        <div>
          <h2>Leave Approvals</h2>
          <p>Approve pending leave requests</p>
        </div>

        <div className="export-actions">
          <button
            className="btn"
            onClick={() =>
              exportLeavesToExcel(
                pendingLeaves,
                "Pending_Leaves"
              )
            }
          >
            Export Excel
          </button>

          <button
            className="btn"
            onClick={() =>
              exportLeavesToPDF(
                pendingLeaves,
                "Pending Leaves"
              )
            }
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="leave-empty">
          Loading...
        </div>
      ) : pendingLeaves.length === 0 ? (
        <div className="leave-empty">
          🎉 No pending leave requests
        </div>
      ) : (
        <div className="leave-table-card">
          <table className="leave-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Dates</th>
                <th>Type</th>
                <th>Reason</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {pendingLeaves.map((l) => (
                <tr key={l.id}>
                  <td>{l.employee_name}</td>
                  <td>
                    {l.start_date} → {l.end_date}
                  </td>
                  <td>{l.leave_type_name}</td>
                  <td>{l.reason}</td>
                  <td>
                    <button
                      className="btn primary"
                      onClick={() =>
                        handleApprove(l.id)
                      }
                    >
                      Approve
                    </button>

                    <button
                      className="btn danger"
                      style={{ marginLeft: 8 }}
                      onClick={() =>
                        handleReject(l.id)
                      }
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
    </div>
  );
}