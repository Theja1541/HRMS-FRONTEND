import React, { useEffect, useState } from "react";
import { getAssetCategories, createAssetCategory, updateAssetCategory, deleteAssetCategory } from "../../api/assets";
import "../../styles/employees.css";

export default function AssetCategories() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', is_active: true });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await getAssetCategories();
      setData(res.data?.results || res.data || []);
    } catch (err) {
      alert("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', is_active: true });
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingCategory(record);
    setFormData({ name: record.name, description: record.description, is_active: record.is_active });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await deleteAssetCategory(id);
      fetchCategories();
    } catch (err) {
      alert("Failed to delete category");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Category name is required");
      return;
    }
    try {
      if (editingCategory) {
        await updateAssetCategory(editingCategory.id, formData);
      } else {
        await createAssetCategory(formData);
      }
      setIsModalVisible(false);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.detail || "An error occurred");
    }
  };

  return (
    <div className="employees-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Asset Categories</h2>
          <p className="page-subtitle">Manage types of assets in your organization</p>
        </div>
        <div className="header-actions">
          <button className="add-employee-btn" onClick={handleAdd}>
            + Add Category
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div className="empty-state">Loading categories...</div>
        ) : data.length === 0 ? (
          <div className="empty-state">No categories found</div>
        ) : (
          <table className="employees-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((cat) => (
                <tr key={cat.id}>
                  <td><strong>{cat.id}</strong></td>
                  <td>{cat.name}</td>
                  <td>{cat.description || <span style={{ color: '#94a3b8' }}>No description</span>}</td>
                  <td>
                    {cat.is_active ? (
                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>Active</span>
                    ) : (
                      <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Inactive</span>
                    )}
                  </td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button className="action-btn action-btn-edit" onClick={() => handleEdit(cat)}>Edit</button>
                      <button className="action-btn action-btn-deactivate" onClick={() => handleDelete(cat.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalVisible && (
        <div className="modal-overlay" onClick={() => setIsModalVisible(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>{editingCategory ? "Edit Category" : "Add Category"}</h3>
              <button className="modal-close" onClick={() => setIsModalVisible(false)}>×</button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Category Name *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  rows="3"
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input 
                  type="checkbox" 
                  id="cat-active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <label htmlFor="cat-active" style={{ fontWeight: 'bold', cursor: 'pointer' }}>Is Active</label>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn" onClick={() => setIsModalVisible(false)} style={{ background: '#f1f5f9', color: '#334155' }}>Cancel</button>
                <button type="submit" className="btn primary" style={{ background: '#0f766e', color: 'white' }}>Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
