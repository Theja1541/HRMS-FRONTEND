import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEmployees, getEmployeeDepartments, getEmployeeRoles } from "../../api/employees";
import { getCompany } from "../../api/companies";
import "../../styles/pages.css";

export default function CompanyEmployees() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  
  // Available filter options
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    getCompany(id)
      .then((res) => setCompany(res.data))
      .catch(() => setCompany(null));
      
    // Fetch unique roles and departments
    getEmployeeDepartments({ company_id: id })
      .then((res) => setDepartments(res.data.departments ? res.data.departments.map(d => typeof d === 'object' ? d.name : d) : []))
      .catch(() => {});
      
    getEmployeeRoles({ company_id: id })
      .then((res) => setRoles(res.data.roles ? res.data.roles.map(r => typeof r === 'object' ? r.name : r) : []))
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    setLoading(true);
    const params = {
      company_id: id,
      page: page,
    };
    if (search) params.search = search;
    if (department) params.department = department;
    if (role) params.role = role;

    getEmployees(params)
      .then((res) => {
        setEmployees(Array.isArray(res.data.results) ? res.data.results : []);
        setCount(res.data.count || 0);
      })
      .catch(() => {
        setEmployees([]);
        setCount(0);
      })
      .finally(() => setLoading(false));
  }, [id, page, search, department, role]);

  // Helper to generate avatar color based on hash of name
  const getAvatarColor = (name) => {
    const colors = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % colors.length);
    return colors[index];
  };

  // Helper to get initials
  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "EE";
  };

  const totalPages = Math.ceil(count / 10);

  return (
    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
      {/* Header Back & Info */}
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
              {company ? company.name : "Company Employees"}
            </h2>
            <span style={{
              background: "#e0e7ff",
              color: "#4f46e5",
              padding: "4px 12px",
              borderRadius: "9999px",
              fontSize: "13px",
              fontWeight: "600"
            }}>
              {count} {count === 1 ? "Employee" : "Employees"}
            </span>
          </div>
          {company && (
            <p className="page-subtitle" style={{ fontSize: "14px", marginTop: 4 }}>
              Company Code: <strong style={{ color: "#0f172a" }}>{company.company_code}</strong> {company.domain ? `| Domain: ${company.domain}` : ""}
            </p>
          )}
        </div>
      </div>

      {/* Modern Search & Filters Container */}
      <div className="card" style={{ padding: "16px", marginBottom: "16px", background: "#ffffff", border: "1px solid #f1f5f9" }}>
        <div style={{ 
          display: "flex", 
          flexWrap: "wrap", 
          gap: "12px", 
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          {/* Search Input */}
          <div style={{ flex: "1", minWidth: "260px", position: "relative" }}>
            <input
              type="text"
              placeholder="Search by name, email or employee ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{
                width: "100%",
                padding: "10px 12px 10px 36px",
                borderRadius: "10px",
                border: "1.5px solid #cbd5e1",
                fontSize: "14px",
                marginBottom: 0
              }}
            />
            {/* Search Icon */}
            <span style={{ 
              position: "absolute", 
              left: "12px", 
              top: "50%", 
              transform: "translateY(-50%)", 
              color: "#94a3b8",
              pointerEvents: "none"
            }}>
              🔍
            </span>
            {search && (
              <button 
                onClick={() => { setSearch(""); setPage(1); }}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  border: "none",
                  background: "transparent",
                  color: "#64748b",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Select Dropdowns */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>Dept:</span>
              <select
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  setPage(1);
                }}
                style={{
                  padding: "8px 12px",
                  borderRadius: "10px",
                  border: "1.5px solid #cbd5e1",
                  fontSize: "14px",
                  background: "#ffffff",
                  minWidth: "150px",
                  marginBottom: 0
                }}
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>Role:</span>
              <select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  setPage(1);
                }}
                style={{
                  padding: "8px 12px",
                  borderRadius: "10px",
                  border: "1.5px solid #cbd5e1",
                  fontSize: "14px",
                  background: "#ffffff",
                  minWidth: "150px",
                  marginBottom: 0
                }}
              >
                <option value="">All Designations</option>
                {roles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            
            {(search || department || role) && (
              <button
                type="button"
                className="btn"
                style={{
                  padding: "8px 14px",
                  borderRadius: "10px",
                  background: "#f1f5f9",
                  color: "#475569",
                  border: "none",
                  fontSize: "13px"
                }}
                onClick={() => {
                  setSearch("");
                  setDepartment("");
                  setRole("");
                  setPage(1);
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Card Container */}
      <div className="card" style={{ padding: 0, overflow: "hidden", border: "1px solid #f1f5f9", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px" }}>
            <div style={{
              width: "40px",
              height: "40px",
              border: "3px solid #f3f3f3",
              borderTop: "3px solid #4f46e5",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              marginBottom: "16px"
            }} />
            <p style={{ color: "#64748b", fontWeight: "500" }}>Loading premium employees list...</p>
          </div>
        ) : (
          <>
            <div className="table-wrapper" style={{ margin: 0, border: "none" }}>
              <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    <th style={{ padding: "16px 24px", color: "#475569", fontWeight: "600", fontSize: "12px", borderBottom: "1px solid #f1f5f9" }}>Employee</th>
                    <th style={{ padding: "16px 24px", color: "#475569", fontWeight: "600", fontSize: "12px", borderBottom: "1px solid #f1f5f9" }}>Employee ID</th>
                    <th style={{ padding: "16px 24px", color: "#475569", fontWeight: "600", fontSize: "12px", borderBottom: "1px solid #f1f5f9" }}>Email</th>
                    <th style={{ padding: "16px 24px", color: "#475569", fontWeight: "600", fontSize: "12px", borderBottom: "1px solid #f1f5f9" }}>Department</th>
                    <th style={{ padding: "16px 24px", color: "#475569", fontWeight: "600", fontSize: "12px", borderBottom: "1px solid #f1f5f9" }}>Designation</th>
                    <th style={{ padding: "16px 24px", color: "#475569", fontWeight: "600", fontSize: "12px", borderBottom: "1px solid #f1f5f9", textAlign: "center" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => {
                    const fullName = `${emp.first_name} ${emp.last_name}`;
                    const initials = getInitials(emp.first_name, emp.last_name);
                    const avatarBg = getAvatarColor(fullName);

                    return (
                      <tr key={emp.id} style={{ transition: "all 0.15s ease", borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "16px 24px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            {/* Avatar Initials */}
                            <div style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "50%",
                              background: avatarBg,
                              color: "#ffffff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: "600",
                              fontSize: "13px",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.08)"
                            }}>
                              {initials}
                            </div>
                            <div>
                              <div style={{ fontWeight: "600", color: "#0f172a", fontSize: "14px" }}>{fullName}</div>
                              <span style={{ fontSize: "12px", color: "#64748b" }}>Joined {emp.joining_date ? new Date(emp.joining_date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }) : "—"}</span>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "16px 24px" }}>
                          <span style={{
                            fontFamily: "monospace",
                            background: "#f1f5f9",
                            color: "#334155",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontWeight: "500"
                          }}>
                            {emp.employee_id ?? "—"}
                          </span>
                        </td>
                        <td style={{ padding: "16px 24px" }}>
                          {emp.email ? (
                            <a href={`mailto:${emp.email}`} style={{ color: "#2563eb", textDecoration: "none", fontSize: "14px", fontWeight: "500" }} className="hover-underline">
                              {emp.email}
                            </a>
                          ) : (
                            <span style={{ color: "#94a3b8" }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: "16px 24px" }}>
                          {emp.department ? (
                            <span style={{
                              background: "#f0fdf4",
                              color: "#166534",
                              padding: "4px 10px",
                              borderRadius: "8px",
                              fontSize: "12px",
                              fontWeight: "600",
                              border: "1px solid #dcfce7"
                            }}>
                              {emp.department}
                            </span>
                          ) : (
                            <span style={{ color: "#94a3b8" }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: "16px 24px" }}>
                          {emp.designation ? (
                            <span style={{
                              background: "#f8fafc",
                              color: "#475569",
                              padding: "4px 10px",
                              borderRadius: "8px",
                              fontSize: "12px",
                              fontWeight: "600",
                              border: "1px solid #e2e8f0"
                            }}>
                              {emp.designation}
                            </span>
                          ) : (
                            <span style={{ color: "#94a3b8" }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: "16px 24px", textAlign: "center" }}>
                          <span style={{
                            background: emp.is_active !== false ? "#dcfce7" : "#fee2e2",
                            color: emp.is_active !== false ? "#15803d" : "#b91c1c",
                            padding: "4px 12px",
                            borderRadius: "9999px",
                            fontSize: "12px",
                            fontWeight: "600",
                            display: "inline-block"
                          }}>
                            {emp.is_active !== false ? "Active" : "Deactivated"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {employees.length === 0 && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 24px" }}>
                <span style={{ fontSize: "40px", marginBottom: "8px" }}>👥</span>
                <h4 style={{ color: "#334155", fontSize: "16px", marginBottom: "4px" }}>No Employees Found</h4>
                <p className="muted-text" style={{ fontSize: "14px", textAlign: "center", maxWidth: "340px" }}>
                  {search || department || role 
                    ? "Try adjusting your filters or search terms to find matching employees." 
                    : "There are no employees registered in this company yet."}
                </p>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination" style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 24px",
                borderTop: "1px solid #f1f5f9",
                background: "#f8fafc",
                margin: 0
              }}>
                <span className="pagination-info" style={{ fontSize: "13px", color: "#64748b" }}>
                  Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({count} total employees)
                </span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      background: "#ffffff",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: page === 1 ? "#94a3b8" : "#475569"
                    }}
                  >
                    ← Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      className={page === p ? "active" : ""}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        border: "1px solid " + (page === p ? "#4f46e5" : "#cbd5e1"),
                        background: page === p ? "#4f46e5" : "#ffffff",
                        color: page === p ? "#ffffff" : "#475569",
                        fontWeight: "600",
                        fontSize: "13px",
                        cursor: "pointer"
                      }}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      background: "#ffffff",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: page === totalPages ? "#94a3b8" : "#475569"
                    }}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Custom Keyframes and Style overrides */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hover-underline:hover {
          text-decoration: underline !important;
        }
      `}</style>
    </div>
  );
}
