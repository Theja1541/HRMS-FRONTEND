import { useEffect, useState } from "react";
import api from "../../api/axios";

import SalaryTimeline from "../../components/payroll/SalaryTimeline";
import SalaryGrowthChart from "../../components/payroll/SalaryGrowthChart";
import SalaryRevisionTable from "../../components/payroll/SalaryRevisionTable";
import "../../styles/salaryTimeline.css";

export default function SalaryGrowthTimeline() {
  const [employeeId, setEmployeeId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const res = await api.get("/payroll/my-summary/");
        setEmployeeId(res.data.employee_id);
      } catch (err) {
        console.error("Failed to load employee details", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="salary-growth-container" style={{ padding: "40px" }}>
        <div className="salary-loading">
          <div className="salary-spinner"></div>
          <p>Loading career statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="salary-growth-container">
      {/* HEADER HERO */}
      <div className="page-header">
        <div>
          <h2>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle" }}>
              <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
              <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
            </svg>
            Compensation Career Pathway
          </h2>
          <p>View your salary growth milestones, promotional revisions, and visual trajectory</p>
        </div>
      </div>

      {employeeId ? (
        /* RESPONSIVE TWO-COLUMN COLLABORATIVE GRID */
        <div 
          style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", 
            gap: "30px", 
            alignItems: "start" 
          }}
          className="salary-growth-grid"
        >
          {/* LEFT: THE VERTICAL MILESTONE TREE */}
          <div className="grid-left-pane">
            <SalaryTimeline employeeId={employeeId} />
          </div>

          {/* RIGHT: CHART ANALYTICS & AUDIT HISTORIES */}
          <div className="grid-right-pane" style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
            <SalaryGrowthChart employeeId={employeeId} />
            <SalaryRevisionTable employeeId={employeeId} />
          </div>
        </div>
      ) : (
        <div className="salary-empty" style={{ margin: "40px 0" }}>
          <div className="empty-icon">📭</div>
          <h3>No Growth Details Found</h3>
          <p>Your active employment record has no logged salary revisions yet.</p>
        </div>
      )}
    </div>
  );
}