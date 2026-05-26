import { useState, useEffect } from "react";
import api from "../../api/axios";
import "../../styles/leave-settings.css";

export default function LeaveSettings() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    annual_quota: 0,
    is_paid: true,
    accrual_type: "ANNUAL",
    accrual_start_month: 1,
    carry_forward: false,
    max_carry_forward: 0,
    encashable: false,
    requires_approval: true,
    allow_negative_balance: false,
  });

  useEffect(() => {
    fetchLeaveTypes();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingType) {
        await api.put(`/leaves/manage-types/${editingType.id}/`, formData);
        alert("Leave type updated successfully");
      } else {
        await api.post("/leaves/manage-types/", formData);
        alert("Leave type created successfully");
      }
      setShowModal(false);
      setEditingType(null);
      resetForm();
      fetchLeaveTypes();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to save leave type");
    }
  };

  const handleEdit = (type) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      annual_quota: type.annual_quota,
      is_paid: type.is_paid,
      accrual_type: type.accrual_type,
      accrual_start_month: type.accrual_start_month,
      carry_forward: type.carry_forward,
      max_carry_forward: type.max_carry_forward,
      encashable: type.encashable,
      requires_approval: type.requires_approval,
      allow_negative_balance: type.allow_negative_balance,
    });
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

  const resetForm = () => {
    setFormData({
      name: "",
      annual_quota: 0,
      is_paid: true,
      accrual_type: "ANNUAL",
      accrual_start_month: 1,
      carry_forward: false,
      max_carry_forward: 0,
      encashable: false,
      requires_approval: true,
      allow_negative_balance: false,
    });
  };

  const getAccrualLabel = (type) => {
    if (type === "ANNUAL") return "Annual (All at once)";
    if (type === "MONTHLY") return "Monthly Accrual";
    if (type === "QUARTERLY") return "Quarterly Accrual";
    return type;
  };

  return (
    <div className="leave-settings-page">
      <div className="page-header">
        <h2>Leave Type Management</h2>
        <button
          className="btn primary"
          onClick={() => {
            setEditingType(null);
            resetForm();
            setShowModal(true);
          }}
        >
          + Add Leave Type
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="leave-types-grid">
          {leaveTypes.map((type) => (
            <div
              key={type.id}
              className={`leave-type-card ${!type.is_active ? "inactive" : ""}`}
            >
              <div className="card-header">
                <h3>{type.name}</h3>
                {!type.is_active && <span className="badge inactive">Inactive</span>}
                {!type.is_paid && <span className="badge unpaid">Unpaid (LOP)</span>}
              </div>

              <div className="card-body">
                <div className="info-row">
                  <span className="label">Annual Quota:</span>
                  <span className="value">{type.annual_quota} days</span>
                </div>

                <div className="info-row">
                  <span className="label">Accrual Type:</span>
                  <span className="value">{getAccrualLabel(type.accrual_type)}</span>
                </div>

                <div className="info-row">
                  <span className="label">Paid Leave:</span>
                  <span className="value">{type.is_paid ? "Yes" : "No (LOP)"}</span>
                </div>

                <div className="info-row">
                  <span className="label">Carry Forward:</span>
                  <span className="value">
                    {type.carry_forward
                      ? `Yes (Max: ${type.max_carry_forward} days)`
                      : "No"}
                  </span>
                </div>

                <div className="info-row">
                  <span className="label">Encashable:</span>
                  <span className="value">{type.encashable ? "Yes" : "No"}</span>
                </div>

                <div className="info-row">
                  <span className="label">Requires Approval:</span>
                  <span className="value">{type.requires_approval ? "Yes" : "No"}</span>
                </div>

                <div className="info-row">
                  <span className="label">Allow Negative Balance:</span>
                  <span className="value">
                    {type.allow_negative_balance ? "Yes (becomes LOP)" : "No"}
                  </span>
                </div>
              </div>

              <div className="card-actions">
                <button className="btn secondary" onClick={() => handleEdit(type)}>
                  Edit
                </button>
                {type.is_active ? (
                  <button
                    className="btn danger"
                    onClick={() => handleDeactivate(type.id)}
                  >
                    Deactivate
                  </button>
                ) : (
                  <button
                    className="btn primary"
                    onClick={() => handleActivate(type.id)}
                  >
                    Activate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingType ? "Edit Leave Type" : "Create Leave Type"}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Leave Type Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Casual Leave, Sick Leave"
                />
              </div>

              <div className="form-group">
                <label>Annual Quota (days) *</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.annual_quota}
                  onChange={(e) =>
                    setFormData({ ...formData, annual_quota: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Accrual Type *</label>
                <select
                  value={formData.accrual_type}
                  onChange={(e) =>
                    setFormData({ ...formData, accrual_type: e.target.value })
                  }
                >
                  <option value="ANNUAL">Annual (All at once on Jan 1)</option>
                  <option value="MONTHLY">Monthly (Credited every month)</option>
                  <option value="QUARTERLY">Quarterly (Every 3 months)</option>
                </select>
                <small>
                  {formData.accrual_type === "MONTHLY" &&
                    `${(formData.annual_quota / 12).toFixed(2)} days per month`}
                  {formData.accrual_type === "QUARTERLY" &&
                    `${(formData.annual_quota / 4).toFixed(2)} days per quarter`}
                </small>
              </div>

              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.is_paid}
                    onChange={(e) =>
                      setFormData({ ...formData, is_paid: e.target.checked })
                    }
                  />
                  Paid Leave (Uncheck for LOP)
                </label>
                {!formData.is_paid && (
                  <small className="warning">
                    ⚠️ Unpaid leaves will result in salary deduction (LOP)
                  </small>
                )}
              </div>

              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.carry_forward}
                    onChange={(e) =>
                      setFormData({ ...formData, carry_forward: e.target.checked })
                    }
                  />
                  Allow Carry Forward
                </label>
              </div>

              {formData.carry_forward && (
                <div className="form-group">
                  <label>Max Carry Forward (days)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.max_carry_forward}
                    onChange={(e) =>
                      setFormData({ ...formData, max_carry_forward: e.target.value })
                    }
                  />
                </div>
              )}

              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.encashable}
                    onChange={(e) =>
                      setFormData({ ...formData, encashable: e.target.checked })
                    }
                  />
                  Encashable (Can be converted to cash)
                </label>
              </div>

              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.requires_approval}
                    onChange={(e) =>
                      setFormData({ ...formData, requires_approval: e.target.checked })
                    }
                  />
                  Requires Approval
                </label>
              </div>

              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.allow_negative_balance}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        allow_negative_balance: e.target.checked,
                      })
                    }
                  />
                  Allow Negative Balance (becomes LOP)
                </label>
                {formData.allow_negative_balance && (
                  <small className="warning">
                    ⚠️ Employees can take leave even if balance is 0. Excess will be
                    deducted as LOP.
                  </small>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  {editingType ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
