import { useState, useEffect } from "react";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../../../api/daybook";
import "../../../styles/daybook.css";
import "../../../styles/employees.css";
import { useCompanyPermissions } from "../../../hooks/useCompanyPermissions";

export default function Categories() {
  const { hasPermission } = useCompanyPermissions();
  const canCreate = hasPermission("daybook", "create", "categories");
  const canEdit = hasPermission("daybook", "edit", "categories");

  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category_type: "EXPENSE",
    description: "",
    is_active: true
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data.results || res.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
      } else {
        await createCategory(formData);
      }
      fetchCategories();
      closeModal();
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Failed to save category");
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData(category);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: "",
      category_type: "EXPENSE",
      description: "",
      is_active: true
    });
  };

  return (
    <div className="employees-page">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Categories</h2>
          <p className="page-subtitle">Manage ledger income and expense categories</p>
        </div>
        <div className="header-actions">
          {canCreate && (
            <button className="add-employee-btn" onClick={() => setShowModal(true)}>
              + Add Category
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
              <th>Description</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td><strong>{category.name}</strong></td>
                <td>
                  <span className={`badge ${category.category_type.toLowerCase() === 'income' ? 'credit' : 'debit'}`}>
                    {category.category_type}
                  </span>
                </td>
                <td>{category.description || '-'}</td>
                <td>
                  <span className={`badge ${category.is_active ? 'credit' : 'debit'}`}>
                    {category.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="actions-cell">
                  <div className="action-buttons">
                    {canEdit && (
                      <button className="action-btn action-btn-edit" onClick={() => handleEdit(category)}>Edit</button>
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
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', width: '90%' }}>
            <div className="modal-header">
              <h3>{editingCategory ? "Edit Category" : "Add Category"}</h3>
              <button onClick={closeModal} className="modal-close">×</button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                  value={formData.category_type}
                  onChange={(e) => setFormData({ ...formData, category_type: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white' }}
                >
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontWeight: 600, color: '#475569', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
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

