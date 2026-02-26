import { useEffect, useState } from "react";
import "../../styles/leaves.css";
import { getAllLeaveRequests } from "../../api/leaves";
import toast from "react-hot-toast";

export default function LeaveHistory() {
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
      toast.error("Failed to load leave history");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="leaves-header">
        <h2>Leave History</h2>
        <p>Past leave records</p>
      </div>

      <div className="leave-table-card">
        {loading ? (
          <div className="leave-empty">Loading...</div>
        ) : leaves.length === 0 ? (
          <div className="leave-empty">
            No leave records found
          </div>
        ) : (
          <table className="leave-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>Dates</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {leaves.map((l) => (
                <tr key={l.id}>
                  <td>{l.employee_name}</td>
                  <td>{l.leave_type_name}</td>
                  <td>
                    {l.start_date} → {l.end_date}
                  </td>
                  <td>
                    <span
                      className={`leave-status ${l.status.toLowerCase()}`}
                    >
                      {l.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}