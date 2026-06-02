import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function SalaryRevisionTable({ employeeId }) {
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevisions = async () => {
      try {
        setLoading(true);
        const res = await api.get(
          `/payroll/salary-revisions/employee/${employeeId}/`
        );
        // Sort newest first
        const sorted = (res.data || []).sort(
          (a, b) => new Date(b.effective_from) - new Date(a.effective_from)
        );
        setRevisions(sorted);
      } catch (err) {
        console.error("Failed to load salary revisions", err);
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) fetchRevisions();
  }, [employeeId]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric"
    });
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(value || 0);

  const safeNumber = (val) => parseFloat(val || 0);

  if (loading) {
    return (
      <div className="growth-revision-card" style={{ minHeight: "150px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: "14px", color: "var(--slate-muted)", fontWeight: 600 }}>Loading statement history...</span>
      </div>
    );
  }

  if (!revisions.length) {
    return null;
  }

  return (
    <div className="growth-revision-card">
      <h3>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ verticalAlign: "middle" }}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>
        Audit Log: Compensation Revisions
      </h3>

      <div className="growth-revision-table-wrapper">
        <table className="growth-revision-table">
          <thead>
            <tr>
              <th>Effective Date</th>
              <th>Previous Annual CTC</th>
              <th>Revised Annual CTC</th>
              <th>Net Adjustment</th>
              <th>Adjustment Reason</th>
            </tr>
          </thead>
          <tbody>
            {revisions.map((rev) => {
              const currentCtc = safeNumber(rev.ctc || rev.gross_salary);
              const prevCtc = safeNumber(rev.previous_ctc);
              const change = currentCtc - prevCtc;
              const changePercent = prevCtc > 0 ? (change / prevCtc) * 100 : 0;

              return (
                <tr key={rev.id}>
                  <td className="revision-date-cell">
                    {formatDate(rev.effective_from)}
                  </td>
                  <td>{formatCurrency(prevCtc)}</td>
                  <td className="revision-ctc-cell">{formatCurrency(currentCtc)}</td>
                  <td>
                    {change > 0 ? (
                      <span className="hike-badge positive">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" style={{ marginRight: "3px" }}>
                          <line x1="12" y1="19" x2="12" y2="5"></line>
                          <polyline points="5 12 12 5 19 12"></polyline>
                        </svg>
                        +{changePercent.toFixed(1)}% (+{formatCurrency(Math.abs(change))})
                      </span>
                    ) : change === 0 ? (
                      <span className="hike-badge neutral">No Change</span>
                    ) : (
                      <span className="hike-badge negative">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" style={{ marginRight: "3px" }}>
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <polyline points="19 12 12 19 5 12"></polyline>
                        </svg>
                        {changePercent.toFixed(1)}% ({formatCurrency(change)})
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="revision-reason-tag">
                      {rev.reason || "Scheduled Revision"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}