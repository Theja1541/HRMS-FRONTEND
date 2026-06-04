import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEmployees } from "../../context/EmployeesContext";
import { checkEmployeeId, getEmployeeDepartments, getEmployeeRoles, addEmployeeRole, addEmployeeDepartment } from "../../api/employees";
import { formatINR } from "../../utils/currency";
import {
  buildCalculatedSalaryPayload,
  calculatePayroll,
  toAmount,
  yearlyAmount,
} from "../../utils/payrollCalculations";
import "../../styles/addEmployee.css";

const steps = [
  "Personal Info",
  "Job Details",
  "Salary Structure",   // 👈 NEW
  "Compliance & Bank",
  "Documents",
  "Emergency Details",
];

export default function EmployeeStepForm({ employee }) {
  const { addEmployee, updateEmployee } = useEmployees();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState("forward");

  const [idChecking, setIdChecking] = useState(false);
  const [idExists, setIdExists] = useState(false);
  const [idTouched, setIdTouched] = useState(false);
  const [errors, setErrors] = useState({});
  const [customRoles, setCustomRoles] = useState([]);
  const [customDepartments, setCustomDepartments] = useState([]);

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "confirm", // "confirm" or "alert"
    title: "",
    message: "",
    onConfirm: null,
    onClose: null,
  });

  const [form, setForm] = useState({
    employee_id: "",
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    dob: "",
    gender: "",
    address: "",
    blood_group: "",
    nationality: "",

    role: "",
    department: "",
    designation: "",
    employment_type: "Full-time",
    joining_date: "",
    work_location: "",
    reporting_manager: "",
    is_active: true,

    bank_name: "",
    account_number: "",
    ifsc: "",
    pan: "",
    pf_number: "",

    pf_applicable: false,
    esi_applicable: false,
    pt_applicable: false,
    uan_number: "",
    esi_number: "",

    emergency_name: "",
    emergency_number: "",
    notes: "",

    profile_photo: null,
    resume: null,
    offer_letter: null,
    aadhar_card: null,
    pan_card: null,
    address_proof: null,
    education_cert: null,
    experience_cert: null,
  });

  const [salary, setSalary] = useState({
    basic: "",
    da: "",
    hra: "",
    conveyance: "",
    medical: "",
    special_allowance: "",
    employee_pf: "",
    professional_tax: "",
    employee_esi: "",
    tds: "",
    medical_insurance: "",
    employer_pf: "",
    employer_esi: "",
    gratuity: "",
  });

  /* ================= LOAD EDIT DATA ================= */
  useEffect(() => {
    if (!employee) return;

    setForm((prev) => ({
      ...prev,
      ...employee,
      role: employee.designation || employee.role || "",
      is_active: employee.is_active ?? true,
    }));
    
    if (employee.salary) {
      setSalary(prev => ({
        ...prev,
        ...employee.salary
      }));
    }
  }, [employee]);

  /* ================= FETCH CUSTOM ROLES & DEPARTMENTS ================= */
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await getEmployeeRoles();
        setCustomRoles(res.data.roles || []);
      } catch (err) {
        console.error('Failed to fetch roles', err);
      }
    };
    
    const fetchDepartments = async () => {
      try {
        const res = await getEmployeeDepartments();
        setCustomDepartments(res.data.departments || []);
      } catch (err) {
        console.error('Failed to fetch departments', err);
      }
    };
    
    fetchRoles();
    fetchDepartments();
  }, []);

  /* ================= DUPLICATE CHECK ================= */
  useEffect(() => {
    if (!form.employee_id) return;

    if (employee?.id && form.employee_id === employee.employee_id) {
      setIdExists(false);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        setIdChecking(true);
        const res = await checkEmployeeId(form.employee_id);
        setIdExists(res.data.exists);
      } catch (err) {
        console.error(err);
      } finally {
        setIdChecking(false);
      }
    }, 500);

    return () => clearTimeout(delay);
  }, [form.employee_id, employee]);

  const handleAddCustomRole = async () => {
    const newRole = window.prompt("Enter new Role name:");
    if (!newRole || !newRole.trim()) return;
    try {
      await addEmployeeRole(newRole.trim());
      const res = await getEmployeeRoles();
      setCustomRoles(res.data.roles || []);
      update("role", newRole.trim());
      update("designation", newRole.trim());
    } catch (err) {
      console.error('Failed to add role', err);
      alert("Failed to add role. It might already exist.");
    }
  };

  const handleAddCustomDepartment = async () => {
    const newDept = window.prompt("Enter new Department name:");
    if (!newDept || !newDept.trim()) return;
    try {
      await addEmployeeDepartment(newDept.trim());
      const res = await getEmployeeDepartments();
      setCustomDepartments(res.data.departments || []);
      update("department", newDept.trim());
    } catch (err) {
      console.error('Failed to add department', err);
      alert("Failed to add department. It might already exist.");
    }
  };

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const updateSalary = (field, value) => {
    setSalary((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateStep = (currentStep) => {
    const newErrors = {};

    if (currentStep === 0) {
      if (!form.employee_id) newErrors.employee_id = "please enter this field";
      if (!form.first_name) newErrors.first_name = "please enter this field";
      if (!form.email) newErrors.email = "please enter this field";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        newErrors.email = "Invalid email format";
      }
      if (form.mobile && !/^[0-9]{10}$/.test(form.mobile)) {
        newErrors.mobile = "Mobile number must be 10 digits";
      }
      if (idExists && !employee?.id) newErrors.employee_id = "Employee ID already exists";
    }

    if (currentStep === 1) {
      if (!form.role) newErrors.role = "please enter this field";
      if (!form.department) newErrors.department = "please enter this field";
      if (!form.designation) newErrors.designation = "please enter this field";
      if (!form.joining_date) newErrors.joining_date = "please enter this field";
    }

    if (currentStep === 2) {
      if (toAmount(salary.basic) <= 0) {
        newErrors.basic = "please enter this field";
      }
    }

    if (currentStep === 3) {
      if (form.account_number && !/^[0-9]{9,18}$/.test(form.account_number)) {
        newErrors.account_number = "Account number must be 9-18 digits";
      }
      if (form.pf_number && form.pf_number.trim().length > 50) {
        newErrors.pf_number = "PF Number must be 50 characters or fewer";
      }
      if (form.uan_number && !/^[0-9]{12}$/.test(form.uan_number)) {
        newErrors.uan_number = "UAN must be exactly 12 digits";
      }
      if (form.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.pan)) {
        newErrors.pan = "Invalid PAN format (e.g., ABCDE1234F)";
      }
      if (form.ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifsc)) {
        newErrors.ifsc = "Invalid IFSC format";
      }
    }

    if (currentStep === 5) {
      if (form.emergency_number && !/^[0-9]{10}$/.test(form.emergency_number)) {
        newErrors.emergency_number = "Mobile number must be 10 digits";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    
    if (step < steps.length - 1) {
      setDirection("forward");
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setDirection("backward");
    setStep((prev) => prev - 1);
  };

  const handleSave = async () => {
    if (!form.employee_id || !form.first_name || !form.email) {
      setModalConfig({
        isOpen: true,
        type: "alert",
        title: "Validation Error",
        message: "Employee ID, First Name, and Email are required fields.",
        onConfirm: null
      });
      return;
    }

    if (idExists && !employee?.id) {
      setModalConfig({
        isOpen: true,
        type: "alert",
        title: "Validation Error",
        message: "Employee ID already exists. Please use a unique ID.",
        onConfirm: null
      });
      return;
    }

    // Trigger Custom Styled Confirmation Modal
    setModalConfig({
      isOpen: true,
      type: "confirm",
      title: employee?.id ? "Update Employee Details" : "Onboard New Employee",
      message: employee?.id 
        ? "Are you sure you want to save the changes made to this employee's profile?" 
        : "Are you sure you want to onboard and create a profile for this employee?",
      onConfirm: async () => {
        await executeSave();
      }
    });
  };

  const executeSave = async () => {
    const formData = new FormData();
    const fileFields = [
      "profile_photo", "resume", "offer_letter", "aadhar_card",
      "pan_card", "address_proof", "education_cert", "experience_cert"
    ];

    // Complex metadata fields to exclude from dynamic FormData appending
    const excludedFields = [
      "history",
      "salary",
      "salary_history",
      "user",
      "id",
      "full_name",
      "status",
      "created_at",
      "updated_at"
    ];

    Object.keys(form).forEach((key) => {
      if (excludedFields.includes(key)) return;
      
      const value = form[key];
      
      if (fileFields.includes(key)) {
        if (value instanceof File) {
          formData.append(key, value);
        }
      } else if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    formData.append("salary", JSON.stringify(salaryPayload));

    const result = employee?.id
      ? await updateEmployee(employee.id, formData)
      : await addEmployee(formData);

    if (!result?.success) {
      setModalConfig({
        isOpen: true,
        type: "alert",
        title: "Saving Failed",
        message: result?.error || "An error occurred while saving employee details.",
        onConfirm: null
      });
      return;
    }

    // Trigger Custom Styled Success Alert Modal
    setModalConfig({
      isOpen: true,
      type: "alert",
      title: employee?.id ? "Successfully Updated" : "Successfully Onboarded",
      message: employee?.id 
        ? "Successfully Updated." 
        : "Employee successfully onboarded.",
      onConfirm: () => {
        navigate("/employees");
      }
    });
  };

  const payroll = useMemo(() => calculatePayroll(salary), [salary]);
  const salaryPayload = useMemo(() => buildCalculatedSalaryPayload(salary), [salary]);
  const { gross, totalDeductions, netSalary, additionalBenefits, ctc } = payroll;

  return (
    <div className="step-form-card">
      <div className="cu-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, borderBottom: "1px solid #f1f5f9", paddingBottom: 16 }}>
        <h3 className="cu-card-title" style={{ margin: 0, color: "#0f172a", fontSize: "18px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
          {employee?.id ? "✨ Edit Employee Details" : "✨ Onboard New Employee"}
        </h3>
        <button
          type="button"
          className="btn secondary"
          style={{ fontSize: 13, padding: "8px 16px", background: "#ffffff", color: "#475569", border: "1px solid #cbd5e1", borderRadius: "10px", fontWeight: "600", cursor: "pointer" }}
          onClick={() => navigate("/employees")}
        >
          ← Back to Employees
        </button>
      </div>

      <div className="stepper">
        {steps.map((label, i) => (
          <div key={i} className={`step ${i <= step ? "active" : ""}`}>
            <span>{i + 1}</span>
            <p>{label}</p>
          </div>
        ))}
      </div>

      <div className={`employee-form-grid step-animate ${direction}`}>
        {/* ================= STEP 0 ================= */}
        {step === 0 && (
          <>
            <Input label="Employee ID *"
              value={form.employee_id}
              onChange={(e)=>{
                update("employee_id", e.target.value.toUpperCase());
                setIdTouched(true);
              }}
              disabled={!!employee?.id}
              error={errors.employee_id}
            />

            {!employee?.id && idChecking && (
              <small style={{ color: "#64748b" }}>Checking...</small>
            )}

            {!employee?.id && !idChecking && idTouched && form.employee_id && (
              idExists ? (
                <small style={{ color: "red" }}>
                  ❌ Employee ID already exists
                </small>
              ) : (
                <small style={{ color: "green" }}>
                  ✅ Employee ID available
                </small>
              )
            )}

            <Input label="First Name *"
              value={form.first_name}
              onChange={(e)=>update("first_name", e.target.value)}
              error={errors.first_name}
            />

            <Input label="Last Name"
              value={form.last_name}
              onChange={(e)=>update("last_name", e.target.value)}
            />

            <Input label="Email *"
              value={form.email}
              onChange={(e)=>update("email", e.target.value)}
              type="email"
              error={errors.email}
            />

            <Input label="Mobile"
              value={form.mobile}
              onChange={(e)=>update("mobile", e.target.value.replace(/\D/g, ''))}
              maxLength="10"
              error={errors.mobile}
            />

            <Input label="Date of Birth" type="date"
              value={form.dob}
              onChange={(e)=>update("dob", e.target.value)}
            />

            <div className="form-field">
              <label>Gender</label>
              <select
                value={form.gender || ""}
                onChange={(e)=>update("gender", e.target.value)}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-field">
              <label>Blood Group</label>
              <select
                value={form.blood_group || ""}
                onChange={(e)=>update("blood_group", e.target.value)}
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <Input label="Nationality"
              value={form.nationality}
              onChange={(e)=>update("nationality", e.target.value)}
            />

            <div className="form-field" style={{ gridColumn: "1 / -1" }}>
              <label>Address</label>
              <textarea
                value={form.address || ""}
                onChange={(e) => update("address", e.target.value)}
                placeholder="Enter street, city, state, pincode"
              />
            </div>
          </>
        )}

        {/* ================= STEP 1 ================= */}
        {step === 1 && (
          <>
            <div className="form-field">
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Role *</span>
                <span 
                  style={{ color: '#4f46e5', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
                  onClick={handleAddCustomRole}
                >
                  + Add New Role
                </span>
              </label>
              <select
                value={form.role || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  update("role", val);
                  update("designation", val);
                }}
                className={errors.role ? "input-error" : ""}
              >
                <option value="">Select Role</option>
                {customRoles
                  .filter((role) => role && role.toLowerCase() !== "employee")
                  .map((role, index) => (
                    <option key={index} value={role}>{role}</option>
                  ))
                }
              </select>
              {errors.role && <small className="error-text">{errors.role}</small>}
            </div>

            <div className="form-field">
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Department *</span>
                <span 
                  style={{ color: '#4f46e5', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
                  onClick={handleAddCustomDepartment}
                >
                  + Add New Dept
                </span>
              </label>
              <select
                value={form.department || ""}
                onChange={(e)=>update("department", e.target.value)}
                className={errors.department ? "input-error" : ""}
              >
                <option value="">Select Department</option>
                {customDepartments.map((dept, index) => (
                  <option key={index} value={dept}>{dept}</option>
                ))}
              </select>
              {errors.department && <small className="error-text">{errors.department}</small>}
            </div>

            <Input label="Designation *"
              value={form.designation}
              onChange={(e) => {
                const val = e.target.value;
                update("designation", val);
                update("role", val);
              }}
              error={errors.designation}
            />

            <Input label="Joining Date *" type="date"
              value={form.joining_date}
              onChange={(e)=>update("joining_date", e.target.value)}
              error={errors.joining_date}
            />

            <Input label="Work Location"
              value={form.work_location}
              onChange={(e)=>update("work_location", e.target.value)}
            />
          </>
        )}

        {/* ================= SALARY STEP ================= */}
          {step === 2 && (
          <div className="salary-step-wrapper">
            <div className="responsive-table-container">
              <table className="payroll-table" style={{ tableLayout: "fixed", minWidth: "600px", width: "100%" }}>
                <thead>
                  <tr>
                    <th style={{ width: "45%" }}>Component</th>
                    <th style={{ width: "27.5%", textAlign: "right" }}>Monthly</th>
                    <th style={{ width: "27.5%", textAlign: "right" }}>Yearly</th>
                  </tr>
                </thead>

              <tbody>
                <SectionRow label="Earnings (A)" />
                <SalaryRow label="Basic" field="basic" salary={salary} setSalary={updateSalary} error={errors.basic} />
                <SalaryRow label="DA" field="da" salary={salary} setSalary={updateSalary} />
                <SalaryRow label="HRA" field="hra" salary={salary} setSalary={updateSalary} />
                <SalaryRow label="Conveyance Allowance" field="conveyance" salary={salary} setSalary={updateSalary} />
                <SalaryRow label="Medical Allowance" field="medical" salary={salary} setSalary={updateSalary} />
                <SalaryRow label="Special Allowance" field="special_allowance" salary={salary} setSalary={updateSalary} />

                <SummaryRow label="Gross Salary (A)" value={gross} className="summary-gross" />

                <SectionRow label="Deductions (B)" />
                <SalaryRow label="Employee PF" field="employee_pf" salary={salary} setSalary={updateSalary} />
                <SalaryRow label="Professional Tax" field="professional_tax" salary={salary} setSalary={updateSalary} />
                <SalaryRow label="Employee ESI" field="employee_esi" salary={salary} setSalary={updateSalary} />
                <SalaryRow label="TDS" field="tds" salary={salary} setSalary={updateSalary} />
                <SalaryRow label="Medical Insurance" field="medical_insurance" salary={salary} setSalary={updateSalary} />

                <SummaryRow label="Total Deductions (B)" value={totalDeductions} className="summary-deduction" />
                <SummaryRow label="Net Salary (A - B)" value={netSalary} className="summary-net" />

                <SectionRow label="Employer Contributions" />
                <SalaryRow label="Employer PF" field="employer_pf" salary={salary} setSalary={updateSalary} />
                <SalaryRow label="Employer ESI" field="employer_esi" salary={salary} setSalary={updateSalary} />
                <SalaryRow label="Gratuity" field="gratuity" salary={salary} setSalary={updateSalary} />

                <SummaryRow label="Additional Benefits (C)" value={additionalBenefits} className="summary-benefits" />
                  <SummaryRow label="CTC (A + C)" value={ctc} className="summary-ctc" />
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= STEP 3 ================= */}
        {step === 3 && (
          <>
            {/* Keep UAN visible for all employees; it remains optional unless provided. */}
            <Input label="UAN Number"
              value={form.uan_number || ""}
              onChange={(e)=>update("uan_number", e.target.value.replace(/\D/g, ""))}
              maxLength={12}
              helperText="12-digit number issued by EPFO."
              error={errors.uan_number}
            />

            {form.pf_applicable && (
              <Input label="PF Number"
                value={form.pf_number || ""}
                onChange={(e)=>update("pf_number", e.target.value)}
                maxLength={50}
                helperText="Provident Fund membership/account number."
                error={errors.pf_number}
              />
            )}

            <Input label="Bank Name"
              value={form.bank_name}
              onChange={(e)=>update("bank_name", e.target.value)}
            />

            <Input label="Account Number"
              value={form.account_number}
              onChange={(e)=>update("account_number", e.target.value.replace(/\D/g, ''))}
              error={errors.account_number}
            />

            <Input label="IFSC Code"
              value={form.ifsc}
              onChange={(e)=>update("ifsc", e.target.value.toUpperCase())}
              error={errors.ifsc}
            />

            <Input label="PAN Number"
              value={form.pan}
              onChange={(e)=>update("pan", e.target.value.toUpperCase())}
              error={errors.pan}
            />

            <div className="form-field" style={{ gridColumn: "1 / -1", display: "flex", gap: "24px", marginTop: "12px", marginBottom: "12px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>
                <input
                  type="checkbox"
                  checked={form.pf_applicable || false}
                  onChange={(e) => update("pf_applicable", e.target.checked)}
                  style={{ width: "18px", height: "18px" }}
                />
                PF Applicable
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>
                <input
                  type="checkbox"
                  checked={form.esi_applicable || false}
                  onChange={(e) => update("esi_applicable", e.target.checked)}
                  style={{ width: "18px", height: "18px" }}
                />
                ESI Applicable
              </label>
            </div>

            {form.esi_applicable && (
              <Input
                label="ESI Number"
                value={form.esi_number || ""}
                onChange={(e) => update("esi_number", e.target.value)}
                maxLength={25}
                helperText="17-digit number issued by ESIC."
                error={errors.esi_number}
              />
            )}
          </>
        )}


        {/* ================= STEP 4 ================= */}
        {step === 4 && (
          <>
            <FileField
              label="Profile Photo"
              accept="image/*"
              currentFile={form.profile_photo}
              onChange={(file) => update("profile_photo", file)}
            />

            <FileField
              label="Resume"
              accept=".pdf,.doc,.docx"
              currentFile={form.resume}
              onChange={(file) => update("resume", file)}
            />

            <FileField
              label="Offer Letter"
              accept=".pdf"
              currentFile={form.offer_letter}
              onChange={(file) => update("offer_letter", file)}
            />

            <FileField
              label="Aadhar Card"
              accept=".pdf,.jpg,.jpeg,.png"
              currentFile={form.aadhar_card}
              onChange={(file) => update("aadhar_card", file)}
            />

            <FileField
              label="PAN Card"
              accept=".pdf,.jpg,.jpeg,.png"
              currentFile={form.pan_card}
              onChange={(file) => update("pan_card", file)}
            />

            <FileField
              label="Address Proof"
              accept=".pdf,.jpg,.jpeg,.png"
              currentFile={form.address_proof}
              onChange={(file) => update("address_proof", file)}
            />

            <FileField
              label="Education Certificate"
              accept=".pdf"
              currentFile={form.education_cert}
              onChange={(file) => update("education_cert", file)}
            />

            <FileField
              label="Experience Certificate"
              accept=".pdf"
              currentFile={form.experience_cert}
              onChange={(file) => update("experience_cert", file)}
            />
          </>
        )}

        {/* ================= STEP 5 ================= */}
        {step === 5 && (
          <>
            <Input label="Emergency Contact Name"
              value={form.emergency_name}
              onChange={(e)=>update("emergency_name", e.target.value)}
            />

            <Input label="Emergency Contact Number"
              value={form.emergency_number}
              onChange={(e)=>update("emergency_number", e.target.value.replace(/\D/g, ''))}
              maxLength="10"
              error={errors.emergency_number}
            />

            <div className="form-field" style={{ gridColumn: "1 / -1" }}>
              <label>Notes</label>
              <textarea
                value={form.notes || ""}
                onChange={(e)=>update("notes", e.target.value)}
                placeholder="Enter any additional notes..."
              />
            </div>
          </>
        )}
      </div>

      {/* 1:1 Replica Stepper Navigation Buttons */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: 20, marginTop: 24 }}>
        {step > 0 ? (
          <button type="button" className="btn ghost" onClick={handleBack}>
            Back
          </button>
        ) : (
          <div />
        )}
        
        <div style={{ display: "flex", gap: 12 }}>
          {step < steps.length - 1 ? (
            <button type="button" className="btn primary" onClick={handleNext}>
              Next Step
            </button>
          ) : (
            <button type="button" className="btn primary" onClick={handleSave}>
              {employee?.id ? "✨ Save Changes" : "✨ Onboard Employee"}
            </button>
          )}
        </div>
      </div>

      {modalConfig.isOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}>
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "16px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            padding: "24px",
            width: "90%",
            maxWidth: "420px",
            textAlign: "center",
          }}>
            <div style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: modalConfig.type === "confirm" ? "#e0e7ff" : "#d1fae5",
              color: modalConfig.type === "confirm" ? "#4f46e5" : "#10b981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              margin: "0 auto 16px auto",
            }}>
              {modalConfig.type === "confirm" ? "❓" : "🎉"}
            </div>

            <h3 style={{
              fontSize: "18px",
              fontWeight: "700",
              color: "#0f172a",
              marginBottom: "8px",
              fontFamily: "'Outfit', 'Inter', sans-serif"
            }}>
              {modalConfig.title}
            </h3>

            <p style={{
              fontSize: "14px",
              color: "#64748b",
              lineHeight: "1.5",
              marginBottom: "24px",
              fontFamily: "'Inter', sans-serif"
            }}>
              {modalConfig.message}
            </p>

            <div style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center"
            }}>
              {modalConfig.type === "confirm" ? (
                <>
                  <button
                    onClick={() => {
                      setModalConfig(prev => ({ ...prev, isOpen: false }));
                      if (modalConfig.onClose) modalConfig.onClose();
                    }}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      background: "white",
                      color: "#475569",
                      fontWeight: "600",
                      fontSize: "14px",
                      cursor: "pointer",
                      fontFamily: "'Inter', sans-serif"
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setModalConfig(prev => ({ ...prev, isOpen: false }));
                      if (modalConfig.onConfirm) modalConfig.onConfirm();
                    }}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "8px",
                      border: "none",
                      background: "linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)",
                      color: "white",
                      fontWeight: "600",
                      fontSize: "14px",
                      cursor: "pointer",
                      boxShadow: "0 4px 6px -1px rgba(79, 70, 229, 0.2)",
                      fontFamily: "'Inter', sans-serif"
                    }}
                  >
                    Confirm
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setModalConfig(prev => ({ ...prev, isOpen: false }));
                    if (modalConfig.onConfirm) modalConfig.onConfirm();
                  }}
                  style={{
                    padding: "10px 24px",
                    borderRadius: "8px",
                    border: "none",
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    color: "white",
                    fontWeight: "600",
                    fontSize: "14px",
                    cursor: "pointer",
                    boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.2)",
                    fontFamily: "'Inter', sans-serif"
                  }}
                >
                  Awesome
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const Input = ({ label, error, helperText, containerStyle, ...props }) => (
  <div className="form-field" style={containerStyle}>
    <label>{label}</label>
    <input {...props} className={error ? "input-error" : ""} />
    {helperText && <small style={{ color: "#64748b" }}>{helperText}</small>}
    {error && <small className="error-text">{error}</small>}
  </div>
);

const FileField = ({ label, accept, currentFile, onChange }) => {
  const getFileName = (file) => {
    if (!file) return null;
    if (typeof file === 'string') {
      return file.split('/').pop();
    }
    return file.name;
  };

  const fileUrl = typeof currentFile === 'string' ? currentFile : null;

  return (
    <div className="form-field">
      <label>{label}</label>
      {currentFile && (
        <div className="current-file-text" style={{ marginBottom: "6px", fontSize: "13px" }}>
          {fileUrl ? (
            <span>
              Current: <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline", color: "#4f46e5", fontWeight: "600" }}>{getFileName(currentFile)}</a>
            </span>
          ) : (
            <span style={{ fontWeight: "600", color: "#10b981" }}>
              Selected: {getFileName(currentFile)} (Ready to upload)
            </span>
          )}
        </div>
      )}
      <input
        type="file"
        accept={accept}
        onChange={(e) => onChange(e.target.files[0])}
      />
    </div>
  );
};


const SectionRow = ({ label }) => (
  <tr className="bold-row">
    <td colSpan="3">{label}</td>
  </tr>
);

const SalaryRow = ({
  label,
  field,
  salary,
  setSalary,
  error,
}) => {
  const value = salary[field] ?? "";

  return (
    <>
      <tr>
        <td>{label}</td>
        <td>
          <input
            type="number"
            value={value}
            onChange={(e) => setSalary(field, e.target.value)}
            className={error ? "input-error" : ""}
            step="0.01"
            min="0"
          />
        </td>
        <td>
          {formatINR(yearlyAmount(value))}
        </td>
      </tr>
      {error && (
        <tr>
          <td colSpan="3">
            <small className="error-text">{error}</small>
          </td>
        </tr>
      )}
    </>
  );
};

const SummaryRow = ({ label, value, className = "" }) => (
  <tr className={`bold-row ${className}`}>
    <td>{label}</td>
    <td>{formatINR(value)}</td>
    <td>{formatINR(yearlyAmount(value))}</td>
  </tr>
);