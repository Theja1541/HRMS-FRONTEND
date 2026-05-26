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

  const approvedLeaves = leaves.filter(
    (l) => l.status === "APPROVED"
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
          <h2>Leave Approvals - Approved Leaves</h2>
          <p>View all approved leave requests</p>
        </div>

        <div className="export-actions">
          <button
            className="btn"
            onClick={() =>
              exportLeavesToExcel(
                approvedLeaves,
                "Approved_Leaves"
              )
            }
          >
            Export Excel
          </button>

          <button
            className="btn"
            onClick={() =>
              exportLeavesToPDF(
                approvedLeaves,
                "Approved Leaves"
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
      ) : approvedLeaves.length === 0 ? (
        <div className="leave-empty">
          No approved leaves yet
        </div>
      ) : (
        <div className="leave-table-card">
          <table className="leave-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {approvedLeaves.map((l) => (
                <tr key={l.id}>
                  <td>{l.employee_name}</td>
                  <td>{l.leave_type_name}</td>
                  <td>{l.start_date}</td>
                  <td>{l.end_date}</td>
                  <td>{l.days}</td>
                  <td>{l.reason}</td>
                  <td>
                    <span className="status-badge approved">
                      Approved
                    </span>
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