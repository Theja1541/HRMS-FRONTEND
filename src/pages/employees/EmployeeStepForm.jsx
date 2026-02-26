// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useEmployees } from "../../context/EmployeesContext";
// import { checkEmployeeId } from "../../api/employees";
// import "../../styles/addEmployee.css";

// const steps = [
//   "Personal Info",
//   "Job Details",
//   "Salary & Compliance",
//   "Documents",
//   "Emergency Details",
// ];

// export default function EmployeeStepForm({ employee }) {
//   const { addEmployee, updateEmployee } = useEmployees();
//   const navigate = useNavigate();

//   const [step, setStep] = useState(0);
//   const [direction, setDirection] = useState("forward");

//   const [idChecking, setIdChecking] = useState(false);
//   const [idExists, setIdExists] = useState(false);
//   const [idTouched, setIdTouched] = useState(false);

//   const [form, setForm] = useState({
//     employee_id: "",

//     first_name: "",
//     last_name: "",
//     email: "",
//     mobile: "",
//     dob: "",
//     gender: "",
//     address: "",
//     blood_group: "",
//     nationality: "",

//     department: "",
//     designation: "",
//     employment_type: "Full-time",
//     joining_date: "",
//     work_location: "",
//     reporting_manager: "",
//     is_active: true,

//     basic_salary: "",
//     allowances: "",
//     deductions: "",

//     bank_name: "",
//     account_number: "",
//     ifsc: "",
//     pan: "",

//     pf_applicable: false,
//     esi_applicable: false,
//     pt_applicable: false,
//     uan_number: "",
//     esi_number: "",

//     emergency_name: "",
//     emergency_number: "",
//     notes: "",

//     profile_photo: null,
//     resume: null,
//     offer_letter: null,
//     id_proof: null,
//     address_proof: null,
//     education_cert: null,
//     experience_cert: null,
//   });

//   /* ================= LOAD EDIT DATA ================= */
//   useEffect(() => {
//   if (!form.employee_id || employee?.id) return;

//   const delay = setTimeout(async () => {
//     try {
//       setIdChecking(true);

//       const res = await fetch(
//         `http://127.0.0.1:8000/api/employees/check-id/?employee_id=${form.employee_id}`
//       );

//       const data = await res.json();

//       setIdExists(data.exists);
//     } catch (error) {
//       console.error("ID check failed", error);
//     } finally {
//       setIdChecking(false);
//     }
//   }, 500); // debounce 500ms

//   return () => clearTimeout(delay);
// }, [form.employee_id]);


//   const update = (field, value) => {
//     setForm((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleNext = () => {
//     setDirection("forward");
//     setStep((prev) => prev + 1);
//   };

//   const handleBack = () => {
//     setDirection("backward");
//     setStep((prev) => prev - 1);
//   };

//   /* ================= SAVE ================= */
//   const handleSave = async () => {
//     if (!form.employee_id) {
//       alert("Employee ID is required");
//       return;
//     }

//     const formData = new FormData();

//     const fileFields = [
//       "profile_photo",
//       "resume",
//       "offer_letter",
//       "id_proof",
//       "address_proof",
//       "education_cert",
//       "experience_cert",
//     ];

//     Object.keys(form).forEach((key) => {
//       const value = form[key];

//       if (fileFields.includes(key)) {
//         if (value instanceof File) {
//           formData.append(key, value);
//         }
//       } else {
//         if (value !== null && value !== undefined) {
//           formData.append(key, value);
//         }
//       }
//     });

//     const result = employee?.id
//       ? await updateEmployee(employee.id, formData)
//       : await addEmployee(formData);

//     if (!result?.success) {
//       alert(result?.error || "Failed to save employee");
//       return;
//     }

//     navigate("/employees");
//   };

//   return (
//     <div className="step-form-card">
//       {/* ================= STEPPER ================= */}
//       <div className="stepper">
//         {steps.map((label, i) => (
//           <div key={i} className={`step ${i <= step ? "active" : ""}`}>
//             <span>{i + 1}</span>
//             <p>{label}</p>
//           </div>
//         ))}
//       </div>

//       <div className={`form-grid step-animate ${direction}`}>
//         {/* ================= STEP 1 ================= */}
//         {step === 0 && (
//           <>
//             <div className="form-field">
//               <label>Employee ID *</label>
//               <input
//                 value={form.employee_id}
//                 onChange={(e) => {
//                   update("employee_id", e.target.value);
//                   setIdTouched(true);
//                 }}
//               />

//               {idChecking && <small style={{ color: "#64748b" }}>Checking...</small>}

//               {!idChecking && idTouched && form.employee_id && (
//                 idExists ? (
//                   <small style={{ color: "red" }}>
//                     ❌ Employee ID already exists
//                   </small>
//                 ) : (
//                   <small style={{ color: "green" }}>
//                     ✅ Employee ID available
//                   </small>
//                 )
//               )}
//             </div>

//             <Input label="First Name *" value={form.first_name}
//               onChange={(e)=>update("first_name", e.target.value)} />

//             <Input label="Last Name" value={form.last_name}
//               onChange={(e)=>update("last_name", e.target.value)} />

//             <Input label="Email *" value={form.email}
//               onChange={(e)=>update("email", e.target.value)} />

//             <Input label="Mobile" value={form.mobile}
//               onChange={(e)=>update("mobile", e.target.value)} />

//             <Input type="date" label="Date of Birth"
//               value={form.dob}
//               onChange={(e)=>update("dob", e.target.value)} />

//             <Input label="Gender"
//               value={form.gender}
//               onChange={(e)=>update("gender", e.target.value)} />

//             <Input label="Address"
//               value={form.address}
//               onChange={(e)=>update("address", e.target.value)} />

//             <FileUpload label="Profile Photo"
//               accept="image/*"
//               value={form.profile_photo}
//               onChange={(file)=>update("profile_photo", file)} />
//           </>
//         )}

//         {/* ================= STEP 2 ================= */}
//         {step === 1 && (
//           <>
//             <Input label="Department"
//               value={form.department}
//               onChange={(e)=>update("department", e.target.value)} />

//             <Input label="Designation"
//               value={form.designation}
//               onChange={(e)=>update("designation", e.target.value)} />

//             <Input type="date" label="Joining Date"
//               value={form.joining_date}
//               onChange={(e)=>update("joining_date", e.target.value)} />

//             <Input label="Work Location"
//               value={form.work_location}
//               onChange={(e)=>update("work_location", e.target.value)} />

//             <Input label="Reporting Manager"
//               value={form.reporting_manager}
//               onChange={(e)=>update("reporting_manager", e.target.value)} />

//             <div className="checkbox-field">
//               <label>
//                 <input
//                   type="checkbox"
//                   checked={form.is_active}
//                   onChange={(e)=>update("is_active", e.target.checked)}
//                 />
//                 Active Employee
//               </label>
//             </div>
//           </>
//         )}

//         {/* ================= STEP 3 ================= */}
//         {step === 2 && (
//           <>
//             <Input label="Basic Salary"
//               value={form.basic_salary}
//               onChange={(e)=>update("basic_salary", e.target.value)} />

//             <Input label="Allowances"
//               value={form.allowances}
//               onChange={(e)=>update("allowances", e.target.value)} />

//             <Input label="Deductions"
//               value={form.deductions}
//               onChange={(e)=>update("deductions", e.target.value)} />

//             <Input label="Bank Name"
//               value={form.bank_name}
//               onChange={(e)=>update("bank_name", e.target.value)} />

//             <Input label="Account Number"
//               value={form.account_number}
//               onChange={(e)=>update("account_number", e.target.value)} />

//             <Input label="IFSC Code"
//               value={form.ifsc}
//               onChange={(e)=>update("ifsc", e.target.value)} />

//             <Input label="PAN Number"
//               value={form.pan}
//               onChange={(e)=>update("pan", e.target.value)} />

//             <div className="checkbox-field">
//               <label>
//                 <input
//                   type="checkbox"
//                   checked={form.pf_applicable}
//                   onChange={(e)=>update("pf_applicable", e.target.checked)}
//                 />
//                 PF Applicable
//               </label>
//             </div>

//             {form.pf_applicable && (
//               <Input label="UAN Number"
//                 value={form.uan_number}
//                 onChange={(e)=>update("uan_number", e.target.value)} />
//             )}

//             <div className="checkbox-field">
//               <label>
//                 <input
//                   type="checkbox"
//                   checked={form.esi_applicable}
//                   onChange={(e)=>update("esi_applicable", e.target.checked)}
//                 />
//                 ESI Applicable
//               </label>
//             </div>

//             {form.esi_applicable && (
//               <Input label="ESI Number"
//                 value={form.esi_number}
//                 onChange={(e)=>update("esi_number", e.target.value)} />
//             )}

//             <div className="checkbox-field">
//               <label>
//                 <input
//                   type="checkbox"
//                   checked={form.pt_applicable}
//                   onChange={(e)=>update("pt_applicable", e.target.checked)}
//                 />
//                 Professional Tax Applicable
//               </label>
//             </div>
//           </>
//         )}

//         {/* ================= STEP 4 ================= */}
//         {step === 3 && (
//           <>
//             <FileUpload label="Resume" accept=".pdf,.doc,.docx"
//               value={form.resume}
//               onChange={(file)=>update("resume", file)} />

//             <FileUpload label="Offer Letter"
//               value={form.offer_letter}
//               onChange={(file)=>update("offer_letter", file)} />

//             <FileUpload label="ID Proof"
//               value={form.id_proof}
//               onChange={(file)=>update("id_proof", file)} />

//             <FileUpload label="Address Proof"
//               value={form.address_proof}
//               onChange={(file)=>update("address_proof", file)} />
//           </>
//         )}

//         {/* ================= STEP 5 ================= */}
//         {step === 4 && (
//           <>
//             <Input label="Emergency Name"
//               value={form.emergency_name}
//               onChange={(e)=>update("emergency_name", e.target.value)} />

//             <Input label="Emergency Number"
//               value={form.emergency_number}
//               onChange={(e)=>update("emergency_number", e.target.value)} />

//             <Input label="Blood Group"
//               value={form.blood_group}
//               onChange={(e)=>update("blood_group", e.target.value)} />

//             <Input label="Nationality"
//               value={form.nationality}
//               onChange={(e)=>update("nationality", e.target.value)} />

//             <textarea
//               placeholder="Notes"
//               value={form.notes}
//               onChange={(e)=>update("notes", e.target.value)}
//             />
//           </>
//         )}
//       </div>

//       <div className="step-actions">
//         {step > 0 && (
//           <button className="btn ghost" onClick={handleBack}>
//             Back
//           </button>
//         )}

//         {step < steps.length - 1 ? (
//           <button className="btn primary" onClick={handleNext}>
//             Next
//           </button>
//         ) : (
//           <button className="btn primary" onClick={handleSave} disabled={idExists || idChecking}>
//             Save Employee
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }

// /* ================= INPUT COMPONENT ================= */


import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useEmployees } from "../../context/EmployeesContext";
import { checkEmployeeId } from "../../api/employees";
import "../../styles/addEmployee.css";

const steps = [
  "Personal Info",
  "Job Details",
  "Salary & Compliance",
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

    department: "",
    designation: "",
    employment_type: "Full-time",
    joining_date: "",
    work_location: "",
    reporting_manager: "",
    is_active: true,

    basic_salary: "",
    allowances: "",
    deductions: "",

    bank_name: "",
    account_number: "",
    ifsc: "",
    pan: "",

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
    id_proof: null,
    address_proof: null,
    education_cert: null,
    experience_cert: null,
  });

  /* =====================================================
     LOAD EDIT DATA (CRITICAL FIX)
  ===================================================== */
  useEffect(() => {
    if (!employee) return;

    setForm((prev) => ({
      ...prev,
      ...employee,
      is_active: employee.is_active ?? true,

      // Prevent file URLs being set as file objects
      profile_photo: null,
      resume: null,
      offer_letter: null,
      id_proof: null,
      address_proof: null,
      education_cert: null,
      experience_cert: null,
    }));
  }, [employee]);

  /* =====================================================
     LIVE DUPLICATE CHECK (ADD MODE ONLY)
  ===================================================== */
  useEffect(() => {
    if (!form.employee_id) return;

    // Skip duplicate check in edit mode if ID unchanged
    if (employee?.id && form.employee_id === employee.employee_id) {
      setIdExists(false);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        setIdChecking(true);

        const res = await checkEmployeeId(
          form.employee_id,
          employee?.id || null
        );

        setIdExists(res.data.exists);
      } catch (error) {
        console.error("ID check failed:", error);
      } finally {
        setIdChecking(false);
      }
    }, 500);

    return () => clearTimeout(delay);
  }, [form.employee_id, employee]);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    setDirection("forward");
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setDirection("backward");
    setStep((prev) => prev - 1);
  };

  /* =====================================================
     SAVE
  ===================================================== */
  const handleSave = async () => {
    if (!form.employee_id) {
      alert("Employee ID is required");
      return;
    }

    if (idExists) {
      alert("Employee ID already exists");
      return;
    }

    const formData = new FormData();

    const fileFields = [
      "profile_photo",
      "resume",
      "offer_letter",
      "id_proof",
      "address_proof",
      "education_cert",
      "experience_cert",
    ];

    Object.keys(form).forEach((key) => {
      const value = form[key];

      if (fileFields.includes(key)) {
        if (value instanceof File) {
          formData.append(key, value);
        }
      } else {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      }
    });

    const result = employee?.id
      ? await updateEmployee(employee.id, formData)
      : await addEmployee(formData);

    if (!result?.success) {
      alert(result?.error || "Failed to save employee");
      return;
    }

    navigate("/employees");
  };

  return (
    <div className="step-form-card">
      <div className="stepper">
        {steps.map((label, i) => (
          <div key={i} className={`step ${i <= step ? "active" : ""}`}>
            <span>{i + 1}</span>
            <p>{label}</p>
          </div>
        ))}
      </div>

      <div className={`form-grid step-animate ${direction}`}>
        {step === 0 && (
          <>
            <div className="form-field">
              <label>Employee ID *</label>
              <input
                value={form.employee_id}
                onChange={(e) => {
                  update("employee_id", e.target.value.toUpperCase());
                  setIdTouched(true);
                }}
              />

              {idChecking && (
                <small style={{ color: "#64748b" }}>Checking...</small>
              )}

              {!idChecking && idTouched && form.employee_id && (
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
            </div>

            <Input label="First Name *" value={form.first_name}
              onChange={(e)=>update("first_name", e.target.value)} />

            <Input label="Last Name"
              value={form.last_name}
              onChange={(e)=>update("last_name", e.target.value)} />

            <Input label="Email *"
              value={form.email}
              onChange={(e)=>update("email", e.target.value)} />

            <Input label="Mobile"
              value={form.mobile}
              onChange={(e)=>update("mobile", e.target.value)} />

            <Input label="Date of Birth" type="date"
              value={form.dob}
              onChange={(e)=>update("dob", e.target.value)} />

            <div className="form-field">
              <label>Gender</label>
              <select value={form.gender} onChange={(e)=>update("gender", e.target.value)}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <Input label="Address"
              value={form.address}
              onChange={(e)=>update("address", e.target.value)} />

            <Input label="Blood Group"
              value={form.blood_group}
              onChange={(e)=>update("blood_group", e.target.value)} />

            <Input label="Nationality"
              value={form.nationality}
              onChange={(e)=>update("nationality", e.target.value)} />
          </>
        )}

        {step === 1 && (
          <>
            <Input label="Department"
              value={form.department}
              onChange={(e)=>update("department", e.target.value)} />

            <Input label="Designation"
              value={form.designation}
              onChange={(e)=>update("designation", e.target.value)} />

            <div className="form-field">
              <label>Employment Type</label>
              <select value={form.employment_type} onChange={(e)=>update("employment_type", e.target.value)}>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Intern">Intern</option>
              </select>
            </div>

            <Input label="Joining Date" type="date"
              value={form.joining_date}
              onChange={(e)=>update("joining_date", e.target.value)} />

            <Input label="Work Location"
              value={form.work_location}
              onChange={(e)=>update("work_location", e.target.value)} />

            <Input label="Reporting Manager"
              value={form.reporting_manager}
              onChange={(e)=>update("reporting_manager", e.target.value)} />

            <div className="checkbox-field">
              <label>
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e)=>update("is_active", e.target.checked)}
                />
                Active Employee
              </label>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <Input label="Basic Salary" type="number"
              value={form.basic_salary}
              onChange={(e)=>update("basic_salary", e.target.value)} />

            <Input label="Allowances" type="number"
              value={form.allowances}
              onChange={(e)=>update("allowances", e.target.value)} />

            <Input label="Deductions" type="number"
              value={form.deductions}
              onChange={(e)=>update("deductions", e.target.value)} />

            <Input label="Bank Name"
              value={form.bank_name}
              onChange={(e)=>update("bank_name", e.target.value)} />

            <Input label="Account Number"
              value={form.account_number}
              onChange={(e)=>update("account_number", e.target.value)} />

            <Input label="IFSC Code"
              value={form.ifsc}
              onChange={(e)=>update("ifsc", e.target.value)} />

            <Input label="PAN Number"
              value={form.pan}
              onChange={(e)=>update("pan", e.target.value.toUpperCase())} />

            <div className="checkbox-field">
              <label>
                <input type="checkbox" checked={form.pf_applicable}
                  onChange={(e)=>update("pf_applicable", e.target.checked)} />
                PF Applicable
              </label>
            </div>

            <div className="checkbox-field">
              <label>
                <input type="checkbox" checked={form.esi_applicable}
                  onChange={(e)=>update("esi_applicable", e.target.checked)} />
                ESI Applicable
              </label>
            </div>

            <div className="checkbox-field">
              <label>
                <input type="checkbox" checked={form.pt_applicable}
                  onChange={(e)=>update("pt_applicable", e.target.checked)} />
                PT Applicable
              </label>
            </div>

            <Input label="UAN Number"
              value={form.uan_number}
              onChange={(e)=>update("uan_number", e.target.value)} />

            <Input label="ESI Number"
              value={form.esi_number}
              onChange={(e)=>update("esi_number", e.target.value)} />
          </>
        )}

        {step === 3 && (
          <>
            <FileUpload label="Profile Photo" accept="image/*"
              value={form.profile_photo}
              onChange={(file)=>update("profile_photo", file)} />

            <FileUpload label="Resume" accept=".pdf,.doc,.docx"
              value={form.resume}
              onChange={(file)=>update("resume", file)} />

            <FileUpload label="Offer Letter" accept=".pdf"
              value={form.offer_letter}
              onChange={(file)=>update("offer_letter", file)} />

            <FileUpload label="ID Proof" accept=".pdf,.jpg,.jpeg,.png"
              value={form.id_proof}
              onChange={(file)=>update("id_proof", file)} />

            <FileUpload label="Address Proof" accept=".pdf,.jpg,.jpeg,.png"
              value={form.address_proof}
              onChange={(file)=>update("address_proof", file)} />

            <FileUpload label="Education Certificate" accept=".pdf"
              value={form.education_cert}
              onChange={(file)=>update("education_cert", file)} />

            <FileUpload label="Experience Certificate" accept=".pdf"
              value={form.experience_cert}
              onChange={(file)=>update("experience_cert", file)} />
          </>
        )}

        {step === 4 && (
          <>
            <Input label="Emergency Contact Name"
              value={form.emergency_name}
              onChange={(e)=>update("emergency_name", e.target.value)} />

            <Input label="Emergency Contact Number"
              value={form.emergency_number}
              onChange={(e)=>update("emergency_number", e.target.value)} />

            <div className="form-field">
              <label>Notes</label>
              <textarea
                value={form.notes}
                onChange={(e)=>update("notes", e.target.value)}
                rows="4"
              />
            </div>
          </>
        )}
      </div>

      <div className="step-actions">
        {step > 0 && (
          <button className="btn ghost" onClick={handleBack}>
            Back
          </button>
        )}

        {step < steps.length - 1 ? (
          <button className="btn primary" onClick={handleNext}>
            Next
          </button>
        ) : (
          <button
            className="btn primary"
            onClick={handleSave}
            disabled={idExists || idChecking}
          >
            Save Employee
          </button>
        )}
      </div>
    </div>
  );
}

/* ================= INPUT COMPONENT ================= */
const Input = ({ label, ...props }) => (
  <div className="form-field">
    <label>{label}</label>
    <input {...props} />
  </div>
);

/* ================= FILE UPLOAD ================= */
const FileUpload = ({ label, value, onChange, accept = "*" }) => {
  const inputId = label.replace(/\s+/g, "_");
  const isFile = value instanceof File;

  return (
    <div className="form-field">
      <label>{label}</label>
      <input
        type="file"
        accept={accept}
        id={inputId}
        hidden
        onChange={(e) => onChange(e.target.files[0])}
      />
      <label htmlFor={inputId} className="custom-file-btn">
        Choose File
      </label>
      {isFile && <p className="file-name">{value.name}</p>}
    </div>
  );
};