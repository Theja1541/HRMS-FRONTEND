import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../auth/AuthContext";
import "../../styles/employeeProfile.css";

export default function MyProfile() {
  const { user } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/employees/me/");
      setEmployee(res.data);
      setEditData({
        mobile: res.data.mobile || "",
        address: res.data.address || "",
        emergency_contact_name: res.data.emergency_contact_name || "",
        emergency_contact_number: res.data.emergency_contact_number || "",
        emergency_notes: res.data.emergency_notes || "",
      });
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      Object.keys(editData).forEach(key => {
        if (editData[key]) formData.append(key, editData[key]);
      });

      await api.put("/employees/me/", formData);
      await fetchProfile();
      setEditing(false);
      alert("Profile updated successfully");
    } catch (err) {
      alert("Failed to update profile");
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profile_photo", file);

    try {
      await api.put("/employees/me/", formData);
      await fetchProfile();
      alert("Photo updated successfully");
    } catch (err) {
      alert("Failed to upload photo");
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="profile-page">
        <div className="empty-state">Profile not found</div>
      </div>
    );
  }

  const salary = employee.salary || {};

  return (
    <div className="profile-page">

      {/* HEADER */}
      <div className="profile-header">
        <div className="profile-photo-section">
          <div className="profile-photo">
            {employee.profile_photo ? (
              <img src={employee.profile_photo} alt="Profile" />
            ) : (
              <div className="photo-placeholder">
                {employee.first_name?.[0]}{employee.last_name?.[0]}
              </div>
            )}
          </div>
          <label className="photo-upload-btn">
            📷 Change Photo
            <input type="file" accept="image/*" onChange={handlePhotoUpload} hidden />
          </label>
        </div>

        <div className="profile-info">
          <h1>{employee.first_name} {employee.last_name}</h1>
          <p className="employee-id">ID: {employee.employee_id}</p>
          <div className="profile-badges">
            <span className="badge">{employee.department}</span>
            <span className="badge">{employee.designation}</span>
          </div>
        </div>

        <div className="profile-actions">
          {!editing ? (
            <button className="btn-edit" onClick={() => setEditing(true)}>
              ✏️ Edit Profile
            </button>
          ) : (
            <>
              <button className="btn-save" onClick={handleSave}>
                ✅ Save
              </button>
              <button className="btn-cancel" onClick={() => setEditing(false)}>
                ❌ Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* SECTIONS GRID */}
      <div className="profile-grid">

        {/* PERSONAL INFO */}
        <div className="profile-section">
          <h3>👤 Personal Information</h3>
          <div className="info-grid">
            <InfoItem label="Email" value={employee.email} />
            <InfoItem 
              label="Mobile" 
              value={editing ? (
                <input 
                  type="text" 
                  value={editData.mobile} 
                  onChange={(e) => setEditData({...editData, mobile: e.target.value})}
                  className="edit-input"
                />
              ) : employee.mobile} 
            />
            <InfoItem label="Date of Birth" value={employee.date_of_birth} />
            <InfoItem label="Gender" value={employee.gender} />
            <InfoItem label="Blood Group" value={employee.blood_group} />
            <InfoItem label="Nationality" value={employee.nationality} />
          </div>
          <div className="info-full">
            <label>Address</label>
            {editing ? (
              <textarea 
                value={editData.address} 
                onChange={(e) => setEditData({...editData, address: e.target.value})}
                className="edit-textarea"
                rows="3"
              />
            ) : (
              <p>{employee.address || "Not provided"}</p>
            )}
          </div>
        </div>

        {/* JOB DETAILS */}
        <div className="profile-section">
          <h3>💼 Job Details</h3>
          <div className="info-grid">
            <InfoItem label="Department" value={employee.department} />
            <InfoItem label="Designation" value={employee.designation} />
            <InfoItem label="Employment Type" value={employee.employment_type} />
            <InfoItem label="Joining Date" value={employee.date_of_joining} />
            <InfoItem label="Work Location" value={employee.work_location} />
            <InfoItem label="Reporting Manager" value={employee.reporting_manager} />
          </div>
        </div>

        {/* SALARY */}
        <div className="profile-section">
          <h3>💰 Salary Structure</h3>
          <div className="salary-grid">
            <SalaryItem label="Basic" value={salary.basic} />
            <SalaryItem label="HRA" value={salary.hra} />
            <SalaryItem label="DA" value={salary.da} />
            <SalaryItem label="Conveyance" value={salary.conveyance} />
            <SalaryItem label="Medical" value={salary.medical} />
            <SalaryItem label="Special Allowance" value={salary.special_allowance} />
          </div>
          <div className="salary-summary">
            <div className="summary-item">
              <span>Gross Salary</span>
              <strong>₹{salary.gross_salary || 0}</strong>
            </div>
            <div className="summary-item">
              <span>Total Deductions</span>
              <strong>₹{salary.total_deductions || 0}</strong>
            </div>
            <div className="summary-item total">
              <span>Net Salary</span>
              <strong>₹{salary.net_salary || 0}</strong>
            </div>
            <div className="summary-item ctc">
              <span>CTC (Annual)</span>
              <strong>₹{salary.ctc || 0}</strong>
            </div>
          </div>
        </div>

        {/* BANK & COMPLIANCE */}
        <div className="profile-section">
          <h3>🏦 Bank & Compliance</h3>
          <div className="info-grid">
            <InfoItem label="Bank Name" value={employee.bank_name} />
            <InfoItem label="Account Number" value={employee.bank_account_number} />
            <InfoItem label="IFSC Code" value={employee.bank_ifsc} />
            <InfoItem label="PAN Number" value={employee.pan_number} />
            <InfoItem label="UAN Number" value={employee.uan_number} />
            <InfoItem label="ESI Number" value={employee.esi_number} />
          </div>
        </div>

        {/* DOCUMENTS */}
        <div className="profile-section">
          <h3>📄 Documents</h3>
          <div className="documents-list">
            <DocumentItem label="Resume" file={employee.resume} />
            <DocumentItem label="Offer Letter" file={employee.offer_letter} />
            <DocumentItem label="Aadhaar Card" file={employee.aadhaar_card} />
            <DocumentItem label="PAN Card" file={employee.pan_card} />
            <DocumentItem label="Education Certificate" file={employee.education_certificate} />
            <DocumentItem label="Experience Certificate" file={employee.experience_certificate} />
          </div>
        </div>

        {/* EMERGENCY CONTACT */}
        <div className="profile-section">
          <h3>🚨 Emergency Contact</h3>
          <div className="info-grid">
            <InfoItem 
              label="Contact Name" 
              value={editing ? (
                <input 
                  type="text" 
                  value={editData.emergency_contact_name} 
                  onChange={(e) => setEditData({...editData, emergency_contact_name: e.target.value})}
                  className="edit-input"
                />
              ) : employee.emergency_contact_name} 
            />
            <InfoItem 
              label="Contact Number" 
              value={editing ? (
                <input 
                  type="text" 
                  value={editData.emergency_contact_number} 
                  onChange={(e) => setEditData({...editData, emergency_contact_number: e.target.value})}
                  className="edit-input"
                />
              ) : employee.emergency_contact_number} 
            />
          </div>
          <div className="info-full">
            <label>Notes</label>
            {editing ? (
              <textarea 
                value={editData.emergency_notes} 
                onChange={(e) => setEditData({...editData, emergency_notes: e.target.value})}
                className="edit-textarea"
                rows="2"
              />
            ) : (
              <p>{employee.emergency_notes || "Not provided"}</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// Reusable Components
const InfoItem = ({ label, value }) => (
  <div className="info-item">
    <label>{label}</label>
    <p>{value || "Not provided"}</p>
  </div>
);

const SalaryItem = ({ label, value }) => (
  <div className="salary-item">
    <span>{label}</span>
    <strong>₹{value || 0}</strong>
  </div>
);

const DocumentItem = ({ label, file }) => (
  <div className="document-item">
    <span>{label}</span>
    {file ? (
      <a href={file} target="_blank" rel="noopener noreferrer" className="doc-link">
        📎 View
      </a>
    ) : (
      <span className="doc-empty">Not uploaded</span>
    )}
  </div>
);
