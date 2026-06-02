import { useParams, useNavigate } from "react-router-dom";
import { useEmployees } from "../../context/EmployeesContext";
import { useState, useEffect } from "react";
import { formatINR } from "../../utils/currency";
import { yearlyAmount } from "../../utils/payrollCalculations";
import api from "../../api/axios";
import { getEmployeeById, patchEmployeeById } from "../../api/employees";
import SalaryTimeline from "../payroll/SalaryTimeline";
import "../../styles/employeeProfile.css";
import { useCompanyPermissions } from "../../hooks/useCompanyPermissions";

export default function EmployeeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { employees } = useEmployees();
  const { hasPermission } = useCompanyPermissions();
  const canAddRevision = hasPermission("payroll", "edit", "payroll-summary");

  const [employee, setEmployee] = useState(
    employees.find((e) => String(e.id) === String(id))
  );

  const [salaryHistory, setSalaryHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [deleted, setDeleted] = useState(false);

  /* ================= FETCH EMPLOYEE ================= */

  useEffect(() => {

    const fetchEmployee = async () => {
      try {

        setLoading(true);

        const res = await getEmployeeById(id);
        setEmployee(res.data);

      } catch (error) {
        console.error("Failed to load employee:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();

  }, [id]);

  /* ================= FETCH SALARY HISTORY ================= */

  useEffect(() => {

    const fetchSalaryHistory = async () => {

      try {

        const res = await api.get(
          `/payroll/salary-revisions/employee/${id}/`
        );

        setSalaryHistory(res.data);

      } catch (error) {
        console.error("Failed to load salary history", error);
      }

    };

    fetchSalaryHistory();

  }, [id]);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <p>Loading employee profile...</p>
      </div>
    );
  }
  if (!employee) return <p className="profile-empty">Employee not found</p>;

  const firstName = employee.first_name || "";
  const lastName = employee.last_name || "";
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "NA";
  const status = (employee.status || "Inactive").toLowerCase();

  const salary = employee.salary || {};
  const yearlyGross = salary.yearly_gross ?? yearlyAmount(salary.gross_salary);
  const yearlyNet = salary.yearly_net ?? yearlyAmount(salary.net_salary);
  const yearlyCTC = salary.yearly_ctc ?? yearlyAmount(salary.ctc);

  /* ================= PROFILE IMAGE ================= */

  const imageUrl =
    deleted
      ? null
      : previewImage ||
        (employee.profile_photo ? `${employee.profile_photo}` : null);

  const handleImageChange = async (e) => {

    const file = e.target.files[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setPreviewImage(localUrl);
    setDeleted(false);

    const formData = new FormData();
    formData.append("profile_photo", file);

    try {

      await patchEmployeeById(employee.id, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

    } catch (error) {
      console.error("Image upload failed:", error);
    }
  };

  const handleDeleteImage = async () => {

    try {

      await patchEmployeeById(employee.id, {
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
                {initials}
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

              <h2>
                {firstName} {lastName}
              </h2>

              <span
                className={`status-badge ${
                  status === "active" ? "active" : "inactive"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>

            </div>

            <p>Employee ID: {employee.employee_id}</p>
            <p className="profile-meta-line">{employee.designation || "-"} • {employee.department || "-"}</p>

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
        <Field label="Role" value={employee.designation || employee.role} />
        <Field label="Department" value={employee.department} />
        <Field label="Designation" value={employee.designation} />
        <Field label="Employment Type" value={employee.employment_type} />
        <Field label="Joining Date" value={employee.joining_date} />
        <Field label="Work Location" value={employee.work_location} />
        <Field label="Reporting Manager" value={employee.reporting_manager} />
      </Section>

      {/* SALARY SUMMARY */}

      <Section title="Salary Summary" variant="salary">

        <Field label="Monthly Gross" value={formatINR(salary.gross_salary || 0)} />
        <Field label="Monthly Net" value={formatINR(salary.net_salary || 0)} />
        <Field label="Monthly CTC" value={formatINR(salary.ctc || 0)} />

        <Field label="Yearly Gross" value={formatINR(yearlyGross)} />
        <Field label="Yearly Net" value={formatINR(yearlyNet)} />
        <Field label="Yearly CTC" value={formatINR(yearlyCTC)} />

      </Section>

      {/* SALARY HISTORY */}

      <div className="profile-section">

        <div className="section-header">

          <h3>Salary Growth Timeline</h3>

          {canAddRevision && (
            <button
              className="btn"
              onClick={() => navigate(`/employees/${employee.id}/salary-revision`)}
            >
              Add Salary Revision
            </button>
          )}

        </div>

        {!salaryHistory || salaryHistory.length === 0 ? (
          <p style={{ marginTop: 10 }}>No salary revisions found.</p>
        ) : (
          <SalaryTimeline employeeId={employee.id} />
        )}

      </div>

      {/* COMPLIANCE */}

      <Section title="Compliance & Bank Details">

        <Field label="Bank Name" value={employee.bank_name} />
        <Field label="Account Number" value={employee.account_number} />
        <Field label="IFSC" value={employee.ifsc} />
        <Field label="PAN" value={employee.pan} />

        <Field label="PF Applicable" value={employee.pf_applicable ? "Yes" : "No"} />
        {employee.pf_applicable && (
          <Field label="PF Number" value={employee.pf_number} />
        )}
        <Field label="UAN Number" value={employee.uan_number} />

        <Field label="ESI Applicable" value={employee.esi_applicable ? "Yes" : "No"} />

        {employee.esi_applicable && (
          <Field label="ESI Number" value={employee.esi_number} />
        )}

        <Field
          label="Professional Tax"
          value={employee.pt_applicable ? "Applicable" : "Not Applicable"}
        />

      </Section>

      <Section title="Emergency Details">
        <Field label="Emergency Contact Name" value={employee.emergency_name} />
        <Field label="Emergency Contact Number" value={employee.emergency_number} />
        <Field label="Notes" value={employee.notes} />
      </Section>

      {/* DOCUMENTS */}

      <div className="profile-section">

        <h3>Documents</h3>

        <div className="documents-grid">

          {renderDocument("Resume", employee.resume)}
          {renderDocument("Offer Letter", employee.offer_letter)}
          {renderDocument("Aadhar Card", employee.aadhar_card)}
          {renderDocument("PAN Card", employee.pan_card)}
          {renderDocument("Address Proof", employee.address_proof)}
          {renderDocument("Education Certificate", employee.education_cert)}
          {renderDocument("Experience Certificate", employee.experience_cert)}

        </div>

      </div>

    </div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

const Section = ({ title, children, variant = "" }) => (
  <div className={`profile-section ${variant}`}>
    <h3>{title}</h3>
    <div className="profile-grid">{children}</div>
  </div>
);

const Field = ({ label, value }) => (
  <div className="profile-field">
    <label>{label}</label>
    <p>{value || "-"}</p>
  </div>
);