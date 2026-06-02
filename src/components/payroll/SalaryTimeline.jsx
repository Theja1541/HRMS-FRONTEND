import { useEffect, useState, useMemo } from "react";
import { getSalaryTimeline } from "../../api/payroll";
import "../../styles/salaryTimeline.css";

export default function SalaryTimeline({ employeeId }) {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        setLoading(true);
        const res = await getSalaryTimeline(employeeId);
        // Ensure sorted by date descending (newest on top)
        const sorted = (res.data || []).sort(
          (a, b) => new Date(b.effective_from) - new Date(a.effective_from)
        );
        setTimeline(sorted);
      } catch (err) {
        console.error("Timeline load failed", err);
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) fetchTimeline();
  }, [employeeId]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount || 0);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short"
    });

  const safeNumber = (value) => parseFloat(value || 0);

  /* Calculate hike stats chronologically */
  const timelineWithHike = useMemo(() => {
    return timeline.map((rev, index) => {
      // Since timeline is sorted newest-to-oldest, index + 1 is the previous chronological revision
      const prevRev = timeline[index + 1];
      const currentGross = safeNumber(rev.gross_salary || rev.ctc);
      const prevGross = prevRev ? safeNumber(prevRev.gross_salary || prevRev.ctc) : 0;
      
      let hikePct = 0;
      if (prevGross > 0) {
        hikePct = ((currentGross - prevGross) / prevGross) * 100;
      }

      return {
        ...rev,
        hikePercentage: hikePct,
        hasPrev: !!prevRev
      };
    });
  }, [timeline]);

  if (loading) {
    return (
      <div className="growth-timeline-card" style={{ minHeight: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: "14px", color: "var(--slate-muted)", fontWeight: 600 }}>Loading timeline trajectory...</span>
      </div>
    );
  }

  if (!timeline.length) {
    return (
      <div className="growth-timeline-card" style={{ padding: "40px", textAlign: "center" }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--slate-muted)", opacity: 0.5, marginBottom: "12px" }}>
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <h3>No Salary Trajectory Discovered</h3>
        <p style={{ color: "var(--slate-muted)", fontSize: "14px" }}>Your career pay progression details will appear here once processed.</p>
      </div>
    );
  }

  return (
    <div className="growth-timeline-card">
      <h3>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ verticalAlign: "middle" }}>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        Compensation Progression Tree
      </h3>

      <div className="growth-timeline-tree">
        {timelineWithHike.map((rev) => (
          <div key={rev.id} className="growth-timeline-item">
            <div className="growth-timeline-dot"></div>
            
            <div className="growth-timeline-content">
              <div className="growth-timeline-content-header">
                <span className="growth-timeline-date">
                  {formatDate(rev.effective_from)}
                </span>
                
                {rev.hasPrev && rev.hikePercentage > 0 && (
                  <span className="growth-timeline-increment-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <line x1="12" y1="19" x2="12" y2="5"></line>
                      <polyline points="5 12 12 5 19 12"></polyline>
                    </svg>
                    +{rev.hikePercentage.toFixed(1)}% Hike
                  </span>
                )}
                
                {!rev.hasPrev && (
                  <span className="growth-timeline-increment-badge" style={{ backgroundColor: "var(--color-indigo-light)", color: "var(--color-indigo)", borderColor: "rgba(99, 102, 241, 0.25)" }}>
                    Base Compensation
                  </span>
                )}
              </div>

              <div>
                <span className="growth-timeline-salary-label">Gross Salary (Annual Equivalent)</span>
                <div className="growth-timeline-salary">
                  {formatCurrency(rev.gross_salary || rev.ctc)}
                </div>
              </div>

              <div className="growth-timeline-breakdown">
                <div className="growth-timeline-breakdown-item">
                  <span>Basic Pay</span>
                  <span>{formatCurrency(rev.basic)}</span>
                </div>
                <div className="growth-timeline-breakdown-item">
                  <span>HRA</span>
                  <span>{formatCurrency(rev.hra)}</span>
                </div>
                <div className="growth-timeline-breakdown-item">
                  <span>DA</span>
                  <span>{formatCurrency(rev.da)}</span>
                </div>
                {rev.reason && (
                  <div className="growth-timeline-breakdown-item" style={{ gridColumn: "span 2", background: "var(--color-indigo-light)" }}>
                    <span>Increment Reason</span>
                    <span style={{ color: "var(--color-indigo-dark)", fontWeight: 700 }}>{rev.reason}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}