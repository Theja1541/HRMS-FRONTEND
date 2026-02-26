import { useEffect, useState } from "react";
import "../../styles/leaves.css";
import {
  exportLeavesToExcel,
  exportLeavesToPDF,
} from "../../utils/leaveExport";
import { getAllLeaveRequests } from "../../api/leaves";
import { useEmployees } from "../../context/EmployeesContext";

export default function Leaves() {
  const { employees = [] } = useEmployees();
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
      console.error("Failed to fetch leaves", err);
    } finally {
      setLoading(false);
    }
  };

  const approved = leaves.filter(l => l.status === "APPROVED");
  const pending = leaves.filter(l => l.status === "PENDING");
  const rejected = leaves.filter(l => l.status === "REJECTED");

  return (
    <div className="leaves-dashboard">
      {/* HEADER */}
      <div className="leaves-header dashboard">
        <div>
          <h2>Leave Dashboard</h2>
          <p>Company-wide leave overview</p>
        </div>

        <div className="export-actions">
          <button
            className="btn primary"
            onClick={() =>
              exportLeavesToExcel(leaves, "All_Leaves")
            }
          >
            Export Excel
          </button>

          <button
            className="btn"
            onClick={() =>
              exportLeavesToPDF(leaves, "All Leaves")
            }
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="leaves-summary-grid">

        <div className="leave-card">
          <h3>{employees.length}</h3>
          <span>Total Employees</span>
        </div>

        <div className="leave-card approved">
          <h3>{approved.length}</h3>
          <span>Approved Leaves</span>
        </div>

        <div className="leave-card pending">
          <h3>{pending.length}</h3>
          <span>Pending Leaves</span>
        </div>

        <div className="leave-card rejected">
          <h3>{rejected.length}</h3>
          <span>Rejected Leaves</span>
        </div>

      </div>

      {loading && (
        <p style={{ marginTop: "20px" }}>Loading leave data...</p>
      )}
    </div>
  );
}