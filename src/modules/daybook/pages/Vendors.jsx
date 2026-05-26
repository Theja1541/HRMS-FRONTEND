import React, { useEffect, useState } from "react";
import { getVendors, createVendor, updateVendor, deleteVendor } from "../services/daybookApi";
import "../../../styles/daybook.css";

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ name: "", vendor_type: "SUPPLIER", contact_person: "", phone: "", email: "" });
  const [search, setSearch] = useState("");
  const [vendorTypeFilter, setVendorTypeFilter] = useState("");

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await getVendors();
      const data = res.data;
      setVendors(Array.isArray(data) ? data : (data?.results || []));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVendors(); }, []);

  const handleOpen = (vendor = null) => {
    if (vendor) {
      setEditId(vendor.id);
      setFormData(vendor);
    } else {
      setEditId(null);
      setFormData({ name: "", vendor_type: "SUPPLIER", contact_person: "", phone: "", email: "" });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editId) await updateVendor(editId, formData);
      else await createVendor(formData);
      setShowModal(false);
      fetchVendors();
    } catch (err) {
      console.error(err);
      alert("Failed to save vendor.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this vendor?")) {
      try {
        await deleteVendor(id);
        fetchVendors();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(search.toLowerCase()) &&
    (vendorTypeFilter ? v.vendor_type === vendorTypeFilter : true)
  );

  return (
    <div className="daybook-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Vendors</h2>
          <p className="page-subtitle">Manage daybook vendors and clients</p>
        </div>
        <div className="header-actions">
          <button className="add-daybook-btn btn primary" onClick={() => handleOpen()}>
            + Add Vendor
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Search vendors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="filter-select"
          value={vendorTypeFilter}
          onChange={(e) => setVendorTypeFilter(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="SUPPLIER">Supplier</option>
          <option value="CLIENT">Client</option>
          <option value="SERVICE">Service Provider</option>
        </select>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div className="empty-state">Loading vendors...</div>
        ) : filteredVendors.length === 0 ? (
          <div className="empty-state">No vendors found.</div>
        ) : (
          <table className="daybook-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Contact Person</th>
                <th>Phone</th>
                <th>Email</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.map((vendor) => (
                <tr key={vendor.id}>
                  <td><strong>{vendor.name}</strong></td>
                  <td>
                    <span style={{
                      padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "600",
                      background: vendor.vendor_type === 'CLIENT' ? '#dbeafe' : vendor.vendor_type === 'SUPPLIER' ? '#fef3c7' : '#e0e7ff',
                      color: vendor.vendor_type === 'CLIENT' ? '#1d4ed8' : vendor.vendor_type === 'SUPPLIER' ? '#b45309' : '#4338ca'
                    }}>
                      {vendor.vendor_type}
                    </span>
                  </td>
                  <td>{vendor.contact_person || "-"}</td>
                  <td>{vendor.phone || "-"}</td>
                  <td>{vendor.email || "-"}</td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button className="action-btn action-btn-edit" onClick={() => handleOpen(vendor)}>Edit</button>
                      <button className="action-btn action-btn-deactivate" onClick={() => handleDelete(vendor.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px", width: "90%" }}>
            <div className="modal-header">
              <h3>{editId ? "Edit Vendor" : "Add Vendor"}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "600" }}>Name</label>
                <input required type="text" className="search-input" style={{ width: "100%" }} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "600" }}>Type</label>
                <select className="filter-select" style={{ width: "100%" }} value={formData.vendor_type} onChange={e => setFormData({...formData, vendor_type: e.target.value})}>
                  <option value="SUPPLIER">Supplier</option>
                  <option value="CLIENT">Client</option>
                  <option value="SERVICE">Service Provider</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "600" }}>Contact Person</label>
                <input type="text" className="search-input" style={{ width: "100%" }} value={formData.contact_person} onChange={e => setFormData({...formData, contact_person: e.target.value})} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "600" }}>Phone</label>
                <input type="text" className="search-input" style={{ width: "100%" }} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "600" }}>Email</label>
                <input type="email" className="search-input" style={{ width: "100%" }} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
