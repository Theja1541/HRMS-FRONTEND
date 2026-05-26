import { useState, useEffect } from "react";
import { getVendors, createVendor, updateVendor, deleteVendor } from "../../api/daybook";
import "../../styles/daybook.css";

export default function Vendors() {
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
    <div className="vendors-page">
      <div className="page-header">
        <h1>Vendors</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Add Vendor
        </button>
      </div>

      <table className="vendors-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Contact Person</th>
            <th>Phone</th>
            <th>Email</th>
            <th>GSTIN</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((vendor) => (
            <tr key={vendor.id}>
              <td>{vendor.name}</td>
              <td>{vendor.vendor_type}</td>
              <td>{vendor.contact_person || '-'}</td>
              <td>{vendor.phone || '-'}</td>
              <td>{vendor.email || '-'}</td>
              <td>{vendor.gstin || '-'}</td>
              <td>{vendor.is_active ? 'Active' : 'Inactive'}</td>
              <td>
                <button className="btn-edit" onClick={() => handleEdit(vendor)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingVendor ? "Edit Vendor" : "Add Vendor"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Type *</label>
                <select
                  value={formData.vendor_type}
                  onChange={(e) => setFormData({ ...formData, vendor_type: e.target.value })}
                  required
                >
                  <option value="SUPPLIER">Supplier</option>
                  <option value="CLIENT">Client</option>
                  <option value="SERVICE">Service Provider</option>
                </select>
              </div>

              <div className="form-group">
                <label>Contact Person</label>
                <input
                  type="text"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.gst_applicable}
                    onChange={(e) => setFormData({ ...formData, gst_applicable: e.target.checked })}
                  />
                  GST Applicable
                </label>
              </div>

              {formData.gst_applicable && (
                <div className="form-group">
                  <label>GSTIN *</label>
                  <input
                    type="text"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                    placeholder="Enter GST Number"
                    required
                  />
                </div>
              )}

              <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>Bank Details (Optional)</h3>

              <div className="form-group">
                <label>Bank Name</label>
                <input
                  type="text"
                  value={formData.bank_name}
                  onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                  placeholder="Enter bank name"
                />
              </div>

              <div className="form-group">
                <label>Account Number</label>
                <input
                  type="text"
                  value={formData.account_number}
                  onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                  placeholder="Enter account number"
                />
              </div>

              <div className="form-group">
                <label>IFSC Code</label>
                <input
                  type="text"
                  value={formData.ifsc_code}
                  onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value })}
                  placeholder="Enter IFSC code"
                />
              </div>

              <div className="form-group">
                <label>Account Holder Name</label>
                <input
                  type="text"
                  value={formData.account_holder_name}
                  onChange={(e) => setFormData({ ...formData, account_holder_name: e.target.value })}
                  placeholder="Enter account holder name"
                />
              </div>

              <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>UPI Details (Optional)</h3>

              <div className="form-group">
                <label>UPI ID</label>
                <input
                  type="text"
                  value={formData.upi_id}
                  onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                  placeholder="Enter UPI ID (e.g., user@paytm)"
                />
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  Active
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">Save</button>
                <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
