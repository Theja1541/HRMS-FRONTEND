import { useState, useEffect } from "react";
import { getVendors, createVendor, updateVendor, deleteVendor } from "../../../api/daybook";
import "../../../styles/daybook.css";
import "../../../styles/employees.css";
import { useCompanyPermissions } from "../../../hooks/useCompanyPermissions";

export default function Vendors() {
  const { hasPermission } = useCompanyPermissions();
  const canCreate = hasPermission("daybook", "create", "vendors");
  const canEdit = hasPermission("daybook", "edit", "vendors");

  const [vendors, setVendors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    vendor_type: "SUPPLIER",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
    gst_applicable: false,
    gstin: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    account_holder_name: "",
    upi_id: "",
    is_active: true
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await getVendors();
      setVendors(res.data.results || res.data);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVendor) {
        await updateVendor(editingVendor.id, formData);
      } else {
        await createVendor(formData);
      }
      fetchVendors();
      closeModal();
    } catch (error) {
      console.error("Error saving vendor:", error);
      alert("Failed to save vendor");
    }
  };

  const handleEdit = (vendor) => {
    setEditingVendor(vendor);
    setFormData(vendor);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingVendor(null);
    setFormData({
      name: "",
      vendor_type: "SUPPLIER",
      contact_person: "",
      phone: "",
      email: "",
      address: "",
      gst_applicable: false,
      gstin: "",
      bank_name: "",
      account_number: "",
      ifsc_code: "",
      account_holder_name: "",
      upi_id: "",
      is_active: true
    });
  };

  return (
    <div className="employees-page">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Vendors</h2>
          <p className="page-subtitle">Manage Day Book suppliers and clients</p>
        </div>
        <div className="header-actions">
          {canCreate && (
            <button className="add-employee-btn" onClick={() => setShowModal(true)}>
              + Add Vendor
            </button>
          )}
        </div>
      </div>

      {/* TABLE WRAPPER */}
      <div className="table-wrapper">
        <table className="employees-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Contact Person</th>
              <th>Phone</th>
              <th>Email</th>
              <th>GSTIN</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor) => (
              <tr key={vendor.id}>
                <td><strong>{vendor.name}</strong></td>
                <td>
                  <span className={`badge ${vendor.vendor_type === 'CLIENT' ? 'credit' : 'debit'}`}>
                    {vendor.vendor_type}
                  </span>
                </td>
                <td>{vendor.contact_person || '-'}</td>
                <td>{vendor.phone || '-'}</td>
                <td>{vendor.email || '-'}</td>
                <td>{vendor.gstin || '-'}</td>
                <td>
                  <span className={`badge ${vendor.is_active ? 'credit' : 'debit'}`}>
                    {vendor.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="actions-cell">
                  <div className="action-buttons">
                    {canEdit && (
                      <button className="action-btn action-btn-edit" onClick={() => handleEdit(vendor)}>Edit</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
            <div className="modal-header">
              <h3>{editingVendor ? "Edit Vendor" : "Add Vendor"}</h3>
              <button onClick={closeModal} className="modal-close">×</button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontWeight: 600, color: '#475569', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontWeight: 600, color: '#475569', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Type *</label>
                  <select
                    value={formData.vendor_type}
                    onChange={(e) => setFormData({ ...formData, vendor_type: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white' }}
                  >
                    <option value="SUPPLIER">Supplier</option>
                    <option value="CLIENT">Client</option>
                    <option value="SERVICE">Service Provider</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontWeight: 600, color: '#475569', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Contact Person</label>
                  <input
                    type="text"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontWeight: 600, color: '#475569', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontWeight: 600, color: '#475569', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontWeight: 600, color: '#475569', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows="2"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, color: '#475569', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={formData.gst_applicable}
                    onChange={(e) => setFormData({ ...formData, gst_applicable: e.target.checked })}
                    style={{ width: 'auto', margin: 0 }}
                  />
                  GST Applicable
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, color: '#475569', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    style={{ width: 'auto', margin: 0 }}
                  />
                  Active
                </label>
              </div>

              {formData.gst_applicable && (
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontWeight: 600, color: '#475569', fontSize: '13px', display: 'block', marginBottom: '6px' }}>GSTIN *</label>
                  <input
                    type="text"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                    placeholder="Enter GST Number"
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              )}

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginTop: '8px' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#1e293b', fontSize: '14px' }}>Bank & Payment Details (Optional)</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontWeight: 600, color: '#475569', fontSize: '11px', display: 'block', marginBottom: '4px' }}>Bank Name</label>
                    <input
                      type="text"
                      value={formData.bank_name}
                      onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontWeight: 600, color: '#475569', fontSize: '11px', display: 'block', marginBottom: '4px' }}>Account Number</label>
                    <input
                      type="text"
                      value={formData.account_number}
                      onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontWeight: 600, color: '#475569', fontSize: '11px', display: 'block', marginBottom: '4px' }}>IFSC Code</label>
                    <input
                      type="text"
                      value={formData.ifsc_code}
                      onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontWeight: 600, color: '#475569', fontSize: '11px', display: 'block', marginBottom: '4px' }}>Account Holder Name</label>
                    <input
                      type="text"
                      value={formData.account_holder_name}
                      onChange={(e) => setFormData({ ...formData, account_holder_name: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontWeight: 600, color: '#475569', fontSize: '11px', display: 'block', marginBottom: '4px' }}>UPI ID</label>
                  <input
                    type="text"
                    value={formData.upi_id}
                    onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                    placeholder="e.g. user@paytm"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div className="modal-actions" style={{ margin: 0, padding: '12px 0 0 0', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="submit" className="btn primary">Save</button>
                <button type="button" className="btn" onClick={closeModal} style={{ background: '#64748b', color: 'white' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
