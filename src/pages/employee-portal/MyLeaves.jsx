import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import "../../styles/myLeaves.css";

export default function MyLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const fetchMyLeaves = async () => {
    try {
      const res = await api.get("/leaves/me/");
      setLeaves(res.data);
    } catch (err) {
      toast.error("Failed to fetch leaves");
    } finally {
      setLoading(false);
    }
  };

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

      {leaves.length === 0 ? (
        <div className="empty-state">
          <p>No leave requests found</p>
        </div>
      ) : (
        <div className="leaves-table-wrapper">
          <table className="leaves-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Status</th>
                <th>Reason</th>
              </tr>
            </thead>

            <tbody>
              {leaves.map((leave) => (
                <tr key={leave.id}>
                  <td>{leave.leave_type_name}</td>
                  <td>{leave.start_date}</td>
                  <td>{leave.end_date}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        leave.status
                          ? leave.status.toLowerCase()
                          : ""
                      }`}
                    >
                      {leave.status}
                    </span>
                  </td>
                  <td className="reason">{leave.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}