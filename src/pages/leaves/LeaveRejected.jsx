import { useEffect, useState } from "react";
import "../../styles/leaves.css";
import {
  exportLeavesToExcel,
  exportLeavesToPDF,
} from "../../utils/leaveExport";
import { getAllLeaveRequests } from "../../api/leaves";
import toast from "react-hot-toast";

export default function LeaveRejected() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const res = await getAllLeaveRequests();
      setLeaves(res.data);
    } catch (err) {
      toast.error("Failed to load rejected leaves");
    } finally {
      setLoading(false);
    }
  };

  const rejectedLeaves = leaves.filter(
    (l) => l.status === "REJECTED"
  );

  return (
    <div className="leaves-page">
      {/* HEADER */}
      <div className="leaves-header rejected">
        <div>
          <h2>Rejected Leaves</h2>
          <p>Rejected leave history</p>
        </div>

        <div className="export-actions">
          <button
            className="btn"
            onClick={() =>
              exportLeavesToExcel(
                rejectedLeaves,
                "Rejected_Leaves"
              )
            }
          >
            Export Excel
          </button>

          <button
            className="btn"
            onClick={() =>
              exportLeavesToPDF(
                rejectedLeaves,
                "Rejected Leaves"
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
      ) : rejectedLeaves.length === 0 ? (
        <div className="leave-empty">
          No rejected leave records
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
              </tr>
            </thead>

            <tbody>
              {rejectedLeaves.map((l) => (
                <tr key={l.id}>
                  <td>{l.employee_name}</td>
                  <td>
                    {l.start_date} → {l.end_date}
                  </td>
                  <td>{l.leave_type_name}</td>
                  <td>{l.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}