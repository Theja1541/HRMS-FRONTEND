import { useState, useEffect } from "react";
import api from "../../api/axios";import Select from "react-select";
import "../../styles/leave-settings.css";
import { useCompanyPermissions } from "../../hooks/useCompanyPermissions";

export default function LeaveSettings() {
  const { hasPermission } = useCompanyPermissions();
  const canEdit = hasPermission("leave", "edit", "leave-settings");

  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  
  // Available options for applicability rules
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [designationOptions, setDesignationOptions] = useState([]);
  
  const employmentTypeOptions = [
    { value: "Full-time", label: "Full-time" },
    { value: "Part-time", label: "Part-time" },
    { value: "Contract", label: "Contract" },
    { value: "Intern", label: "Intern" }
  ];

  const genderOptions = [
    { value: "ALL", label: "All" },
    { value: "MALE", label: "Male" },
    { value: "FEMALE", label: "Female" }
  ];

  const initialFormData = {
    name: "",
    code: "",
    annual_quota: 0,
    accrual_type: "ANNUAL",
    accrual_start_month: 1,
    is_paid: true,
    is_system_leave: false,
    
    // Usage Restrictions
    max_consecutive_days: "",
    advance_notice_days: 0,
    allowed_during_probation: true,
    allow_negative_balance: false,
    
    // Balance Rules
    carry_forward: false,
    max_carry_forward: 0,
    encashable: false,
    prorate_for_new_joiners: true,
    
    // Calculation
    include_weekends: false,
    include_holidays: false,
    
    // Documents
    document_required: false,
    document_required_after_days: 0,
    
    // Applicability
    applicable_gender: "ALL",
    applicable_employment_types: [],
    applicable_departments: [],
    applicable_designations: [],
    
    // Approval
    requires_approval: true,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    fetchLeaveTypes();
    fetchOptions();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      const res = await api.get("/leaves/manage-types/");
      setLeaveTypes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const deptRes = await api.get("/employees/departments/");
      if (deptRes.data && deptRes.data.departments) {
        setDepartmentOptions(deptRes.data.departments.map(d => ({ value: d, label: d })));
      }
      const roleRes = await api.get("/employees/roles/");
      if (roleRes.data && roleRes.data.roles) {
        setDesignationOptions(roleRes.data.roles.map(r => ({ value: r, label: r })));
      }
    } catch (err) {
      console.error("Failed to fetch options", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare payload
      const payload = { ...formData };
      if (!payload.max_consecutive_days) payload.max_consecutive_days = null;
      if (!payload.carry_forward) payload.max_carry_forward = 0;
      if (!payload.document_required) payload.document_required_after_days = 0;
      
      if (editingType) {
        await api.put(`/leaves/manage-types/${editingType.id}/`, payload);
        alert("Leave type updated successfully");
      } else {
        await api.post("/leaves/manage-types/", payload);
        alert("Leave type created successfully");
      }
      setShowModal(false);
      setEditingType(null);
      setFormData(initialFormData);
      setActiveTab("basic");
      fetchLeaveTypes();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to save leave type");
    }
  };

  const handleEdit = (type) => {
    setEditingType(type);
    setFormData({
      name: type.name || "",
      code: type.code || "",
      annual_quota: type.annual_quota || 0,
      accrual_type: type.accrual_type || "ANNUAL",
      accrual_start_month: type.accrual_start_month || 1,
      is_paid: type.is_paid ?? true,
      is_system_leave: type.is_system_leave ?? false,
      max_consecutive_days: type.max_consecutive_days || "",
      advance_notice_days: type.advance_notice_days || 0,
      allowed_during_probation: type.allowed_during_probation ?? true,
      allow_negative_balance: type.allow_negative_balance ?? false,
      carry_forward: type.carry_forward ?? false,
      max_carry_forward: type.max_carry_forward || 0,
      encashable: type.encashable ?? false,
      prorate_for_new_joiners: type.prorate_for_new_joiners ?? true,
      include_weekends: type.include_weekends ?? false,
      include_holidays: type.include_holidays ?? false,
      document_required: type.document_required ?? false,
      document_required_after_days: type.document_required_after_days || 0,
      applicable_gender: type.applicable_gender || "ALL",
      applicable_employment_types: type.applicable_employment_types || [],
      applicable_departments: type.applicable_departments || [],
      applicable_designations: type.applicable_designations || [],
      requires_approval: type.requires_approval ?? true,
    });
    setActiveTab("basic");
    setShowModal(true);
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm("Deactivate this leave type?")) return;
    try {
      await api.delete(`/leaves/manage-types/${id}/`);
      alert("Leave type deactivated");
      fetchLeaveTypes();
    } catch (err) {
      alert("Failed to deactivate");
    }
  };

  const handleActivate = async (id) => {
    if (!window.confirm("Activate this leave type?")) return;
    try {
      await api.put(`/leaves/manage-types/${id}/`, { is_active: true });
      alert("Leave type activated");
      fetchLeaveTypes();
    } catch (err) {
      alert("Failed to activate");
    }
  };

  const getAccrualLabel = (type) => {
    if (type === "ANNUAL") return "Annual";
    if (type === "MONTHLY") return "Monthly";
    if (type === "QUARTERLY") return "Quarterly";
    return type;
  };

  const renderTabs = () => (
    <div className="settings-tabs">
      <button type="button" className={`tab-btn ${activeTab === 'basic' ? 'active' : ''}`} onClick={() => setActiveTab('basic')}>Basic Info</button>
      <button type="button" className={`tab-btn ${activeTab === 'usage' ? 'active' : ''}`} onClick={() => setActiveTab('usage')}>Usage</button>
      <button type="button" className={`tab-btn ${activeTab === 'balance' ? 'active' : ''}`} onClick={() => setActiveTab('balance')}>Balance Rules</button>
      <button type="button" className={`tab-btn ${activeTab === 'calculation' ? 'active' : ''}`} onClick={() => setActiveTab('calculation')}>Calculation</button>
      <button type="button" className={`tab-btn ${activeTab === 'document' ? 'active' : ''}`} onClick={() => setActiveTab('document')}>Documents</button>
      <button type="button" className={`tab-btn ${activeTab === 'applicability' ? 'active' : ''}`} onClick={() => setActiveTab('applicability')}>Applicability</button>
      <button type="button" className={`tab-btn ${activeTab === 'approval' ? 'active' : ''}`} onClick={() => setActiveTab('approval')}>Approval</button>
    </div>
  );

  return (
    <div className="leave-settings-page">
      <div className="page-header">
        <h2>Enterprise Leave Settings</h2>
        {canEdit && (
          <button className="btn primary" onClick={() => { setEditingType(null); setFormData(initialFormData); setActiveTab("basic"); setShowModal(true); }}>
            + Add Leave Type
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="leave-types-grid">
          {leaveTypes.map((type) => (
            <div key={type.id} className={`leave-type-card ${!type.is_active ? "inactive" : ""}`}>
              <div className="card-header">
                <div>
                  <h3>{type.name}</h3>
                  <span className="code-badge">{type.code}</span>
                </div>
                <div className="status-badges">
                  {!type.is_active && <span className="badge inactive">Inactive</span>}
                  {type.is_system_leave && <span className="badge system">System</span>}
                </div>
              </div>

              <div className="card-body">
                <div className="info-row">
                  <span className="label">Quota & Accrual:</span>
                  <span className="value">{type.annual_quota} days ({getAccrualLabel(type.accrual_type)})</span>
                </div>
                <div className="info-row">
                  <span className="label">Type:</span>
                  <span className="value">{type.is_paid ? "Paid Leave" : "Unpaid (LOP)"}</span>
                </div>
                <div className="info-row">
                  <span className="label">Max Consecutive:</span>
                  <span className="value">{type.max_consecutive_days ? `${type.max_consecutive_days} days` : "No Limit"}</span>
                </div>
                <div className="info-row">
                  <span className="label">Advance Notice:</span>
                  <span className="value">{type.advance_notice_days > 0 ? `${type.advance_notice_days} days` : "None"}</span>
                </div>
                <div className="info-row">
                  <span className="label">Carry Forward:</span>
                  <span className="value">{type.carry_forward ? `Yes (Max: ${type.max_carry_forward})` : "No"}</span>
                </div>
                <div className="info-row">
                  <span className="label">Documents:</span>
                  <span className="value">{type.document_required ? `Required after ${type.document_required_after_days} days` : "Not Required"}</span>
                </div>
                <div className="info-row">
                  <span className="label">Probation:</span>
                  <span className="value">{type.allowed_during_probation ? "Allowed" : "Not Allowed"}</span>
                </div>
                <div className="info-row">
                  <span className="label">Applicability:</span>
                  <span className="value">
                    {type.applicable_gender !== "ALL" ? `Gender: ${type.applicable_gender} ` : ""}
                    {type.applicable_departments?.length ? `${type.applicable_departments.length} Depts ` : "All Depts "}
                  </span>
                </div>
              </div>

              {canEdit && (
                <div className="card-actions">
                  <button className="btn secondary" onClick={() => handleEdit(type)}>Edit</button>
                  {type.is_active ? (
                    <button className="btn danger" onClick={() => handleDeactivate(type.id)}>Deactivate</button>
                  ) : (
                    <button className="btn primary" onClick={() => handleActivate(type.id)}>Activate</button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content enterprise-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingType ? "Edit Leave Policy" : "Create Leave Policy"}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              {renderTabs()}
              
              <div className="tab-content">
                {activeTab === 'basic' && (
                  <div className="section fade-in">
                    <div className="form-group">
                      <label>Leave Type Name *</label>
                      <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>Leave Code *</label>
                      <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} required />
                    </div>
                    <div className="form-group">
                      <label>Annual Quota (days) *</label>
                      <input type="number" step="0.5" value={formData.annual_quota} onChange={(e) => setFormData({ ...formData, annual_quota: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>Accrual Type *</label>
                      <select value={formData.accrual_type} onChange={(e) => setFormData({ ...formData, accrual_type: e.target.value })}>
                        <option value="ANNUAL">Annual</option>
                        <option value="MONTHLY">Monthly</option>
                        <option value="QUARTERLY">Quarterly</option>
                      </select>
                    </div>
                    <div className="form-group checkbox">
                      <label>
                        <input type="checkbox" checked={formData.is_paid} onChange={(e) => setFormData({ ...formData, is_paid: e.target.checked })} />
                        Paid Leave (Uncheck for LOP)
                      </label>
                    </div>
                  </div>
                )}

                {activeTab === 'usage' && (
                  <div className="section fade-in">
                    <div className="form-group">
                      <label>Maximum Consecutive Days (Leave empty for no limit)</label>
                      <input type="number" min="1" value={formData.max_consecutive_days} onChange={(e) => setFormData({ ...formData, max_consecutive_days: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Advance Notice Days</label>
                      <input type="number" min="0" value={formData.advance_notice_days} onChange={(e) => setFormData({ ...formData, advance_notice_days: e.target.value })} />
                    </div>
                    <div className="form-group checkbox">
                      <label>
                        <input type="checkbox" checked={formData.allowed_during_probation} onChange={(e) => setFormData({ ...formData, allowed_during_probation: e.target.checked })} />
                        Allow During Probation
                      </label>
                    </div>
                    <div className="form-group checkbox">
                      <label>
                        <input type="checkbox" checked={formData.allow_negative_balance} onChange={(e) => setFormData({ ...formData, allow_negative_balance: e.target.checked })} />
                        Allow Negative Balance (becomes LOP)
                      </label>
                    </div>
                  </div>
                )}

                {activeTab === 'balance' && (
                  <div className="section fade-in">
                    <div className="form-group checkbox">
                      <label>
                        <input type="checkbox" checked={formData.carry_forward} onChange={(e) => setFormData({ ...formData, carry_forward: e.target.checked })} />
                        Carry Forward Remaining Balance
                      </label>
                    </div>
                    {formData.carry_forward && (
                      <div className="form-group">
                        <label>Max Carry Forward (days)</label>
                        <input type="number" step="0.5" value={formData.max_carry_forward} onChange={(e) => setFormData({ ...formData, max_carry_forward: e.target.value })} />
                      </div>
                    )}
                    <div className="form-group checkbox">
                      <label>
                        <input type="checkbox" checked={formData.encashable} onChange={(e) => setFormData({ ...formData, encashable: e.target.checked })} />
                        Encashable
                      </label>
                    </div>
                    <div className="form-group checkbox">
                      <label>
                        <input type="checkbox" checked={formData.prorate_for_new_joiners} onChange={(e) => setFormData({ ...formData, prorate_for_new_joiners: e.target.checked })} />
                        Prorate for New Joiners
                      </label>
                    </div>
                  </div>
                )}

                {activeTab === 'calculation' && (
                  <div className="section fade-in">
                    <div className="form-group checkbox">
                      <label>
                        <input type="checkbox" checked={formData.include_weekends} onChange={(e) => setFormData({ ...formData, include_weekends: e.target.checked })} />
                        Count Weekends as Leave Days
                      </label>
                    </div>
                    <div className="form-group checkbox">
                      <label>
                        <input type="checkbox" checked={formData.include_holidays} onChange={(e) => setFormData({ ...formData, include_holidays: e.target.checked })} />
                        Count Holidays as Leave Days
                      </label>
                    </div>
                  </div>
                )}

                {activeTab === 'document' && (
                  <div className="section fade-in">
                    <div className="form-group checkbox">
                      <label>
                        <input type="checkbox" checked={formData.document_required} onChange={(e) => setFormData({ ...formData, document_required: e.target.checked })} />
                        Require Supporting Document
                      </label>
                    </div>
                    {formData.document_required && (
                      <div className="form-group">
                        <label>Require document if leave exceeds (days)</label>
                        <input type="number" min="0" value={formData.document_required_after_days} onChange={(e) => setFormData({ ...formData, document_required_after_days: e.target.value })} />
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'applicability' && (
                  <div className="section fade-in">
                    <div className="form-group">
                      <label>Applicable Gender</label>
                      <select value={formData.applicable_gender} onChange={(e) => setFormData({ ...formData, applicable_gender: e.target.value })}>
                        {genderOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Applicable Employment Types</label>
                      <Select 
                        isMulti 
                        options={employmentTypeOptions}
                        value={employmentTypeOptions.filter(o => formData.applicable_employment_types.includes(o.value))}
                        onChange={(selected) => setFormData({ ...formData, applicable_employment_types: selected.map(s => s.value) })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Applicable Departments</label>
                      <Select 
                        isMulti 
                        options={departmentOptions}
                        value={departmentOptions.filter(o => formData.applicable_departments.includes(o.value))}
                        onChange={(selected) => setFormData({ ...formData, applicable_departments: selected.map(s => s.value) })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Applicable Designations</label>
                      <Select 
                        isMulti 
                        options={designationOptions}
                        value={designationOptions.filter(o => formData.applicable_designations.includes(o.value))}
                        onChange={(selected) => setFormData({ ...formData, applicable_designations: selected.map(s => s.value) })}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'approval' && (
                  <div className="section fade-in">
                    <div className="form-group checkbox">
                      <label>
                        <input type="checkbox" checked={formData.requires_approval} onChange={(e) => setFormData({ ...formData, requires_approval: e.target.checked })} />
                        Requires Manager/HR Approval
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  {editingType ? "Update Policy" : "Create Policy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
