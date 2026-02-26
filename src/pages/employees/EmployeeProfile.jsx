import { useParams, useNavigate } from "react-router-dom";
import { useEmployees } from "../../context/EmployeesContext";
import { useState, useEffect } from "react";
import { useAuth } from "../../auth/AuthContext";
import api from "../../api/axios";
import "../../styles/employeeProfile.css";

export default function EmployeeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { employees } = useEmployees();
  const { authTokens } = useAuth();

  const [employee, setEmployee] = useState(
    employees.find((e) => String(e.id) === String(id))
  );

  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [deleted, setDeleted] = useState(false);

  /* ================= FETCH FULL EMPLOYEE ================= */

  useEffect(() => {
    const fetchFullEmployee = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/employees/${id}/`);
        setEmployee(res.data);
      } catch (error) {
        console.error("Failed to load employee:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!employee || !employee.basic_salary) {
      fetchFullEmployee();
    }
  }, [id]);

  if (loading) return <p style={{ padding: 24 }}>Loading...</p>;
  if (!employee) return <p style={{ padding: 24 }}>Employee not found</p>;

  const firstName = employee.first_name || "";
  const lastName = employee.last_name || "";
  const status = (employee.status || "Inactive").toLowerCase();

  /* ================= IMAGE URL ================= */

  const imageUrl =
    deleted
      ? null
      : previewImage ||
        (employee.profile_photo
          ? `${employee.profile_photo}`
          : null);

  /* ================= HANDLE IMAGE UPLOAD ================= */

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setPreviewImage(localUrl);
    setDeleted(false);

    const formData = new FormData();
    formData.append("profile_photo", file);

    try {
      await api.patch(`/employees/${employee.id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } catch (error) {
      console.error("Image upload failed:", error);
    }
  };

  /* ================= DELETE IMAGE ================= */

  const handleDeleteImage = async () => {
    try {
      await api.patch(`/employees/${employee.id}/`, {
        profile_photo: null,
      });

      setPreviewImage(null);
      setDeleted(true);
    } catch (error) {
      console.error("Image delete failed:", error);
    }
  };

  /* ================= DOCUMENT RENDER ================= */

  const renderDocument = (label, fileUrl) => {
    if (!fileUrl) return null;

    const fileName = fileUrl.split("/").pop();
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl);

    return (
      <div className="document-card">
        <div className="doc-header">
          <span className="doc-icon">{isImage ? "🖼" : "📎"}</span>
          <span className="doc-title">{label}</span>
        </div>

        {isImage ? (
          <img src={fileUrl} alt={label} className="doc-preview" />
        ) : (
          <p className="doc-filename">{fileName}</p>
        )}

        <div className="doc-actions">
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="doc-btn"
          >
            View
          </a>
        </div>
      </div>
    );
  };

  /* ================= UI ================= */

  return (
    <div className="profile-wrapper">

      {/* HEADER */}
      <div className="profile-header">
        <div className="profile-user">

          <div className="avatar-container">
            {imageUrl ? (
              <img src={imageUrl} alt="Profile" className="avatar-image" />
            ) : (
              <div className="avatar-circle">
                {firstName.charAt(0)}
                {lastName.charAt(0)}
              </div>
            )}

            <label className="avatar-upload">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                hidden
              />
              ✏
            </label>

            {imageUrl && (
              <button
                className="avatar-delete"
                onClick={handleDeleteImage}
                type="button"
              >
                🗑
              </button>
            )}
          </div>

          <div>
            <div className="name-row">
              <h2>{firstName} {lastName}</h2>
              <span
                className={`status-badge ${
                  status === "active" ? "active" : "inactive"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
            <p>Employee ID: {employee.employee_id}</p>
          </div>
        </div>

        <button className="btn" onClick={() => navigate("/employees")}>
          Back
        </button>
      </div>

      {/* PERSONAL */}
      <Section title="Personal Information">
        <Field label="Email" value={employee.email} />
        <Field label="Mobile" value={employee.mobile} />
        <Field label="Gender" value={employee.gender} />
        <Field label="Date of Birth" value={employee.dob} />
        <Field label="Address" value={employee.address} />
        <Field label="Blood Group" value={employee.blood_group} />
        <Field label="Nationality" value={employee.nationality} />
      </Section>

      {/* JOB */}
      <Section title="Job Details">
        <Field label="Department" value={employee.department} />
        <Field label="Designation" value={employee.designation} />
        <Field label="Employment Type" value={employee.employment_type} />
        <Field label="Joining Date" value={employee.joining_date} />
        <Field label="Work Location" value={employee.work_location} />
        <Field label="Reporting Manager" value={employee.reporting_manager} />
      </Section>

      {/* SALARY & COMPLIANCE */}
      <Section title="Salary & Compliance">
        <Field label="Basic Salary" value={employee.basic_salary} />
        <Field label="Allowances" value={employee.allowances} />
        <Field label="Deductions" value={employee.deductions} />
        <Field label="Bank Name" value={employee.bank_name} />
        <Field label="Account Number" value={employee.account_number} />
        <Field label="IFSC" value={employee.ifsc} />
        <Field label="PAN" value={employee.pan} />

        <Field label="PF Applicable" value={employee.pf_applicable ? "Yes" : "No"} />
        {employee.pf_applicable && (
          <Field label="UAN Number" value={employee.uan_number} />
        )}

        <Field label="ESI Applicable" value={employee.esi_applicable ? "Yes" : "No"} />
        {employee.esi_applicable && (
          <Field label="ESI Number" value={employee.esi_number} />
        )}

        <Field label="Professional Tax" value={employee.pt_applicable ? "Applicable" : "Not Applicable"} />
      </Section>

      {/* DOCUMENTS */}
      <div className="profile-section">
        <h3>Documents</h3>
        <div className="documents-grid">
          {renderDocument("Resume", employee.resume)}
          {renderDocument("Offer Letter", employee.offer_letter)}
          {renderDocument("ID Proof", employee.id_proof)}
          {renderDocument("Address Proof", employee.address_proof)}
          {renderDocument("Education Certificate", employee.education_cert)}
          {renderDocument("Experience Certificate", employee.experience_cert)}
        </div>
      </div>

    </div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

const Section = ({ title, children }) => (
  <div className="profile-section">
    <h3>{title}</h3>
    <div className="profile-grid">{children}</div>
  </div>
);

const Field = ({ label, value }) => (
  <div>
    <label>{label}</label>
    <p>{value || "-"}</p>
  </div>
);