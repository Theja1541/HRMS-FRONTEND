import { useEffect, useState } from "react";
import { getSalaryTimeline } from "../../api/payroll";
import "../../styles/payroll.css";

export default function SalaryTimeline({ employeeId }) {

  const [timeline, setTimeline] = useState([]);

  useEffect(() => {

    const fetchTimeline = async () => {
      try {

        const res = await getSalaryTimeline(employeeId);
        setTimeline(res.data);

      } catch (err) {

        console.error("Timeline load failed", err);

      }
    };

    if (employeeId) {
      fetchTimeline();
    }

  }, [employeeId]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });

  return (
    <div className="timeline-card">

      <h3>Salary Growth Timeline</h3>

      <div className="timeline">

        {timeline.map((rev, index) => {
          const prevRev = index > 0 ? timeline[index - 1] : null;
          const hasPrev = !!prevRev;

          return (
            <div key={rev.id} className="timeline-item">

              <div className="timeline-dot"></div>

              <div className="timeline-content" style={{ padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>

                <div className="timeline-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
                  <h4 style={{ margin: 0, color: "#1e293b", fontWeight: "700", fontSize: "14px" }}>
                    📅 {formatDate(rev.effective_from)}
                  </h4>
                  {rev.reason && (
                    <span className="reason-badge" style={{ background: "#e0e7ff", color: "#4f46e5", padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "600" }}>
                      🎯 {rev.reason}
                    </span>
                  )}
                </div>

                <div className="salary-comparison-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "16px", background: "#f8fafc", padding: "12px", borderRadius: "8px", marginBottom: "12px", border: "1px dashed #cbd5e1" }}>
                  <div>
                    <span style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: "600", display: "block", marginBottom: "4px" }}>Previous Salary</span>
                    <strong style={{ fontSize: "14px", color: "#64748b" }}>
                      {hasPrev ? formatCurrency(prevRev.gross_salary) : "N/A (Joined)"}
                    </strong>
                    {hasPrev && (
                      <span style={{ display: "block", fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                        CTC: {formatCurrency(prevRev.ctc)}
                      </span>
                    )}
                  </div>
                  <div>
                    <span style={{ fontSize: "10px", color: "#4f46e5", textTransform: "uppercase", fontWeight: "600", display: "block", marginBottom: "4px" }}>New Salary</span>
                    <strong style={{ fontSize: "15px", color: "#10b981" }}>
                      {formatCurrency(rev.gross_salary)}
                    </strong>
                    <span style={{ display: "block", fontSize: "11px", color: "#475569", marginTop: "2px" }}>
                      CTC: {formatCurrency(rev.ctc)}
                    </span>
                  </div>
                </div>

                {hasPrev && (
                  <div className="salary-revision-growth" style={{ fontSize: "12px", color: "#475569", marginBottom: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                    📈 Increment: <strong style={{ color: "#10b981" }}>
                      +{formatCurrency(rev.gross_salary - prevRev.gross_salary)}
                    </strong> (Monthly Gross)
                  </div>
                )}

                <div className="timeline-breakdown" style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "11px", color: "#64748b", borderTop: "1px solid #f1f5f9", paddingTop: "8px" }}>
                  <span>Basic: {formatCurrency(rev.basic)}</span>
                  {rev.hra > 0 && <span>HRA: {formatCurrency(rev.hra)}</span>}
                  {rev.da > 0 && <span>DA: {formatCurrency(rev.da)}</span>}
                  {rev.conveyance > 0 && <span>Conveyance: {formatCurrency(rev.conveyance)}</span>}
                  {rev.medical > 0 && <span>Medical: {formatCurrency(rev.medical)}</span>}
                  {rev.special_allowance > 0 && <span>Special: {formatCurrency(rev.special_allowance)}</span>}
                </div>
                
                {rev.notes && (
                  <div className="timeline-notes" style={{ marginTop: "10px", fontSize: "11px", color: "#64748b", fontStyle: "italic", background: "#fffbeb", padding: "6px 10px", borderRadius: "6px", borderLeft: "3px solid #f59e0b" }}>
                    📝 Notes: {rev.notes}
                  </div>
                )}

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}