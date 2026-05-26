import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCompany } from "../../api/companies";
import api from "../../api/axios";
import "../../styles/pages.css";

export default function CompanyPayroll() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCompany(id)
      .then((res) => setCompany(res.data))
      .catch(() => setCompany(null));
  }, [id]);

  useEffect(() => {
    setLoading(true);
    api
      .get("/payroll/summary/", { params: { company_id: id } })
      .then((res) => setSummary(res.data))
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, [id]);

  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  return (
    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
      {/* Header with Back button */}
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div>
          <button
            type="button"
            className="btn"
            style={{ 
              marginBottom: 12, 
              background: "#ffffff", 
              border: "1px solid #cbd5e1",
              color: "#475569",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              padding: "6px 12px"
            }}
            onClick={() => navigate(`/super-admin/companies`)}
          >
            ← Back to Companies
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h2 className="page-title" style={{ fontSize: "28px", fontWeight: "700" }}>
              Payroll Dashboard {company ? `· ${company.name}` : ""}
            </h2>
          </div>
          {company && (
            <p className="page-subtitle" style={{ fontSize: "14px", marginTop: 4 }}>
              Company Code: <strong style={{ color: "#0f172a" }}>{company.company_code}</strong> {company.domain ? `| Domain: ${company.domain}` : ""}
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px" }}>
          <div style={{
            width: "40px",
            height: "40px",
            border: "3px solid #f3f3f3",
            borderTop: "3px solid #4f46e5",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            marginBottom: "16px"
          }} />
          <p style={{ color: "#64748b", fontWeight: "500" }}>Loading premium payroll metrics...</p>
        </div>
      ) : summary ? (
        <div>
          {/* Key Stat Cards Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "16px",
            marginBottom: "24px"
          }}>
            {/* Stat Card 1: Total CTC */}
            <div style={{
              background: "linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)",
              color: "#ffffff",
              borderRadius: "14px",
              padding: "20px",
              boxShadow: "0 10px 20px rgba(79, 70, 229, 0.15)",
              position: "relative",
              overflow: "hidden"
            }}>
              <div style={{ fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", opacity: 0.85 }}>Total Monthly CTC</div>
              <div style={{ fontSize: "26px", fontWeight: "800", marginTop: "8px", fontFamily: "Inter" }}>{formatCurrency(summary.total_monthly_ctc)}</div>
              <div style={{ fontSize: "12px", marginTop: "12px", opacity: 0.75 }}>Cost To Company (Gross + Employer PF/ESI contributions)</div>
              {/* Decorative Circle */}
              <div style={{ position: "absolute", right: "-20px", bottom: "-20px", width: "80px", height: "80px", borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
            </div>

            {/* Stat Card 2: Gross Pay */}
            <div style={{
              background: "linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)",
              color: "#ffffff",
              borderRadius: "14px",
              padding: "20px",
              boxShadow: "0 10px 20px rgba(14, 165, 233, 0.15)",
              position: "relative",
              overflow: "hidden"
            }}>
              <div style={{ fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", opacity: 0.85 }}>Total Monthly Gross</div>
              <div style={{ fontSize: "26px", fontWeight: "800", marginTop: "8px", fontFamily: "Inter" }}>{formatCurrency(summary.total_monthly_gross)}</div>
              <div style={{ fontSize: "12px", marginTop: "12px", opacity: 0.75 }}>Sum of Basic, HRA, and all Allowances before deductions</div>
              <div style={{ position: "absolute", right: "-20px", bottom: "-20px", width: "80px", height: "80px", borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
            </div>

            {/* Stat Card 3: Net Disbursed */}
            <div style={{
              background: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
              color: "#ffffff",
              borderRadius: "14px",
              padding: "20px",
              boxShadow: "0 10px 20px rgba(16, 185, 129, 0.15)",
              position: "relative",
              overflow: "hidden"
            }}>
              <div style={{ fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", opacity: 0.85 }}>Total Net Disbursed</div>
              <div style={{ fontSize: "26px", fontWeight: "800", marginTop: "8px", fontFamily: "Inter" }}>{formatCurrency(summary.total_net_pay)}</div>
              <div style={{ fontSize: "12px", marginTop: "12px", opacity: 0.75 }}>Take-home salary credited directly to employee accounts</div>
              <div style={{ position: "absolute", right: "-20px", bottom: "-20px", width: "80px", height: "80px", borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
            </div>

            {/* Stat Card 4: Total Employees */}
            <div style={{
              background: "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)",
              color: "#ffffff",
              borderRadius: "14px",
              padding: "20px",
              boxShadow: "0 10px 20px rgba(245, 158, 11, 0.15)",
              position: "relative",
              overflow: "hidden"
            }}>
              <div style={{ fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", opacity: 0.85 }}>Total Employees</div>
              <div style={{ fontSize: "26px", fontWeight: "800", marginTop: "8px", fontFamily: "Inter" }}>{summary.total_employees ?? 0}</div>
              <div style={{ fontSize: "12px", marginTop: "12px", opacity: 0.75 }}>Number of employees included in active payroll logs</div>
              <div style={{ position: "absolute", right: "-20px", bottom: "-20px", width: "80px", height: "80px", borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
            </div>
          </div>

          {/* Analytical Distribution Card */}
          <div className="card" style={{ padding: "24px", marginBottom: "24px", background: "#ffffff", border: "1px solid #f1f5f9" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", marginBottom: "16px" }}>Payroll Distribution & Averages</h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
              {/* Cost Distribution Progress Bars */}
              <div>
                <h4 style={{ fontSize: "14px", color: "#64748b", fontWeight: "600", marginBottom: "14px" }}>Salary Component Breakdown</h4>
                
                {/* Net Pay vs Gross Pay */}
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                    <span style={{ color: "#334155" }}>Net Pay Disbursed (Take-home)</span>
                    <span style={{ color: "#475569" }}>{summary.total_monthly_gross > 0 ? ((summary.total_net_pay / summary.total_monthly_gross) * 100).toFixed(1) + "%" : "0.0%"}</span>
                  </div>
                  <div style={{ height: "10px", width: "100%", background: "#f1f5f9", borderRadius: "9999px", overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: summary.total_monthly_gross > 0 ? `${(summary.total_net_pay / summary.total_monthly_gross) * 100}%` : "0%",
                      background: "#10b981",
                      borderRadius: "9999px",
                      transition: "width 1s ease"
                    }} />
                  </div>
                </div>

                {/* Deductions (statutory + other) */}
                <div style={{ marginBottom: "16px" }}>
                  {(() => {
                    const deductions = summary.total_monthly_gross - summary.total_net_pay;
                    const pct = summary.total_monthly_gross > 0 ? ((deductions / summary.total_monthly_gross) * 100).toFixed(1) : "0.0";
                    return (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                          <span style={{ color: "#334155" }}>Total Deductions (Taxes + PF + ESI)</span>
                          <span style={{ color: "#475569" }}>{pct}%</span>
                        </div>
                        <div style={{ height: "10px", width: "100%", background: "#f1f5f9", borderRadius: "9999px", overflow: "hidden" }}>
                          <div style={{
                            height: "100%",
                            width: `${pct}%`,
                            background: "#ef4444",
                            borderRadius: "9999px",
                            transition: "width 1s ease"
                          }} />
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Averages Section */}
              <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "18px", border: "1px solid #e2e8f0" }}>
                <h4 style={{ fontSize: "14px", color: "#334155", fontWeight: "700", marginBottom: "12px" }}>Averages per Employee</h4>
                
                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: "13.5px", color: "#475569", fontWeight: "500" }}>Average Monthly CTC</span>
                  <strong style={{ fontSize: "14px", color: "#4f46e5" }}>{formatCurrency(summary.average_monthly_ctc)}</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: "13.5px", color: "#475569", fontWeight: "500" }}>Average Monthly Gross</span>
                  <strong style={{ fontSize: "14px", color: "#0ea5e9" }}>{formatCurrency(summary.average_monthly_gross)}</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0" }}>
                  <span style={{ fontSize: "13.5px", color: "#475569", fontWeight: "500" }}>Estimated Average Net Pay</span>
                  <strong style={{ fontSize: "14px", color: "#10b981" }}>
                    {formatCurrency(summary.total_employees > 0 ? summary.total_net_pay / summary.total_employees : 0)}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed breakdown metrics table */}
          <div className="card" style={{ padding: 0, overflow: "hidden", border: "1px solid #f1f5f9" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a" }}>Payroll Metric Registry</h3>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  className="btn"
                  style={{ fontSize: "13px", padding: "6px 12px", background: "#f8fafc", border: "1px solid #cbd5e1" }}
                  onClick={() => alert("Excel Export capability is scoped to specific month closures.")}
                >
                  📥 Export XLSX
                </button>
              </div>
            </div>
            
            <div className="table-wrapper" style={{ margin: 0, border: "none" }}>
              <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    <th style={{ padding: "14px 24px", color: "#475569", fontWeight: "600", fontSize: "12px", borderBottom: "1px solid #f1f5f9" }}>Metric Description</th>
                    <th style={{ padding: "14px 24px", color: "#475569", fontWeight: "600", fontSize: "12px", borderBottom: "1px solid #f1f5f9" }}>Scope Type</th>
                    <th style={{ padding: "14px 24px", color: "#475569", fontWeight: "600", fontSize: "12px", borderBottom: "1px solid #f1f5f9", textAlign: "right" }}>Financial Value (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "14px 24px" }}>
                      <div style={{ fontWeight: "600", color: "#334155" }}>Total Monthly Cost To Company (CTC)</div>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>Accumulated total company liability including employer PF/ESI matches.</span>
                    </td>
                    <td style={{ padding: "14px 24px" }}><span style={{ background: "#eef2f6", color: "#475569", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "600" }}>Monthly Aggregate</span></td>
                    <td style={{ padding: "14px 24px", textAlign: "right", fontWeight: "700", color: "#334155" }}>{formatCurrency(summary.total_monthly_ctc)}</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "14px 24px" }}>
                      <div style={{ fontWeight: "600", color: "#334155" }}>Total Monthly Gross Pay</div>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>Total earnings payable before statutory taxes or deduction claims.</span>
                    </td>
                    <td style={{ padding: "14px 24px" }}><span style={{ background: "#eef2f6", color: "#475569", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "600" }}>Monthly Aggregate</span></td>
                    <td style={{ padding: "14px 24px", textAlign: "right", fontWeight: "700", color: "#334155" }}>{formatCurrency(summary.total_monthly_gross)}</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "14px 24px" }}>
                      <div style={{ fontWeight: "600", color: "#334155" }}>Total Monthly Net Pay Disbursed</div>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>Actual bank transfer credit amount payable directly to employees.</span>
                    </td>
                    <td style={{ padding: "14px 24px" }}><span style={{ background: "#eef2f6", color: "#475569", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "600" }}>Monthly Aggregate</span></td>
                    <td style={{ padding: "14px 24px", textAlign: "right", fontWeight: "700", color: "#10b981" }}>{formatCurrency(summary.total_net_pay)}</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "14px 24px" }}>
                      <div style={{ fontWeight: "600", color: "#334155" }}>Statutory Deductions & LOPs</div>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>Statutory holding values (PF, PT, TDS, ESI) and Loss-Of-Pay deductions.</span>
                    </td>
                    <td style={{ padding: "14px 24px" }}><span style={{ background: "#eef2f6", color: "#475569", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "600" }}>Calculated Difference</span></td>
                    <td style={{ padding: "14px 24px", textAlign: "right", fontWeight: "700", color: "#ef4444" }}>
                      {formatCurrency(summary.total_monthly_gross - summary.total_net_pay)}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "14px 24px" }}>
                      <div style={{ fontWeight: "600", color: "#334155" }}>Average Employee Cost (CTC)</div>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>Cost per active payroll head counted as total monthly CTC divided by active counts.</span>
                    </td>
                    <td style={{ padding: "14px 24px" }}><span style={{ background: "#eef2f6", color: "#475569", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "600" }}>Average per Capita</span></td>
                    <td style={{ padding: "14px 24px", textAlign: "right", fontWeight: "700", color: "#4f46e5" }}>{formatCurrency(summary.average_monthly_ctc)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "14px 24px" }}>
                      <div style={{ fontWeight: "600", color: "#334155" }}>Average Employee Gross Pay</div>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>Average gross salary value package structured across the scoped employee roster.</span>
                    </td>
                    <td style={{ padding: "14px 24px" }}><span style={{ background: "#eef2f6", color: "#475569", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "600" }}>Average per Capita</span></td>
                    <td style={{ padding: "14px 24px", textAlign: "right", fontWeight: "700", color: "#0ea5e9" }}>{formatCurrency(summary.average_monthly_gross)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 24px" }}>
          <span style={{ fontSize: "40px", marginBottom: "8px" }}>📊</span>
          <h4 style={{ color: "#334155", fontSize: "16px", marginBottom: "4px" }}>No Payroll Summaries Available</h4>
          <p className="muted-text" style={{ fontSize: "14px", textAlign: "center", maxWidth: "360px" }}>
            The payroll metrics registry couldn't be loaded or there are no generated payslip structures for this company.
          </p>
        </div>
      )}

      {/* Style Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
