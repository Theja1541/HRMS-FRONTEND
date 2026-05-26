import React, { useEffect, useState } from "react";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../services/daybookApi";
import "../../../styles/daybook.css";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ name: "", category_type: "EXPENSE", description: "" });
  const [search, setSearch] = useState("");

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await getCategories();
      const data = res.data;
      setCategories(Array.isArray(data) ? data : (data?.results || []));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleOpen = (category = null) => {
    if (category) {
      setEditId(category.id);
      setFormData(category);
    } else {
      setEditId(null);
      setFormData({ name: "", category_type: "EXPENSE", description: "" });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editId) await updateCategory(editId, formData);
      else await createCategory(formData);
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert("Failed to save category.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this category?")) {
      try {
        await deleteCategory(id);
        fetchCategories();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="daybook-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Categories</h2>
          <p className="page-subtitle">Manage daybook transaction categories</p>
        </div>
        <div className="header-actions">
          <button className="add-daybook-btn btn primary" onClick={() => handleOpen()}>
            + Add Category
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div className="empty-state">Loading categories...</div>
        ) : filteredCategories.length === 0 ? (
          <div className="empty-state">No categories found.</div>
        ) : (
          <table className="daybook-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Description</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category) => (
                <tr key={category.id}>
                  <td><strong>{category.name}</strong></td>
                  <td>
                    <span style={{
                      padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "600",
                      background: category.category_type === 'INCOME' ? '#dcfce7' : '#fee2e2',
                      color: category.category_type === 'INCOME' ? '#16a34a' : '#dc2626'
                    }}>
                      {category.category_type}
                    </span>
                  </td>
                  <td>{category.description || "-"}</td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button className="action-btn action-btn-edit" onClick={() => handleOpen(category)}>Edit</button>
                      <button className="action-btn action-btn-deactivate" onClick={() => handleDelete(category.id)}>Delete</button>
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
              <h3>{editId ? "Edit Category" : "Add Category"}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "600" }}>Name</label>
                <input required type="text" className="search-input" style={{ width: "100%" }} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "600" }}>Type</label>
                <select className="filter-select" style={{ width: "100%" }} value={formData.category_type} onChange={e => setFormData({...formData, category_type: e.target.value})}>
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "600" }}>Description</label>
                <textarea className="search-input" style={{ width: "100%", minHeight: "80px", resize: "vertical" }} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
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
