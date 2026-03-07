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
      is_active: employee.is_active ?? true,
      profile_photo: null,
      resume: null,
      offer_letter: null,
      id_proof: null,
      address_proof: null,
      education_cert: null,
      experience_cert: null,
    }));
    if (employee.salary) {
  setSalary(prev => ({
    ...prev,
    ...employee.salary
  }));
}
  }, [employee]);

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

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
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
  if (!form.employee_id) {
    alert("Employee ID is required");
    return;
  }

  if (idExists) {
    alert("Employee ID already exists");
    return;
  }

  const formData = new FormData();

  Object.keys(form).forEach((key) => {
    if (form[key] !== null && form[key] !== undefined) {
      formData.append(key, form[key]);
    }
  });

  // 👇 append salary JSON
  formData.append("salary", JSON.stringify(salary));

  const result = employee?.id
    ? await updateEmployee(employee.id, formData)
    : await addEmployee(formData);

  if (!result?.success) {
    alert(result?.error || "Failed to save employee");
    return;
  }

  navigate("/employees");
};

  const gross =
    Number(salary.basic || 0) +
    Number(salary.da || 0) +
    Number(salary.hra || 0) +
    Number(salary.conveyance || 0) +
    Number(salary.medical || 0) +
    Number(salary.special_allowance || 0);

  const totalDeductions =
    Number(salary.employee_pf || 0) +
    Number(salary.professional_tax || 0) +
    Number(salary.employee_esi || 0) +
    Number(salary.tds || 0) +
    Number(salary.medical_insurance || 0);

  const netSalary = gross - totalDeductions;

  const additionalBenefits =
    Number(salary.employer_pf || 0) +
    Number(salary.employer_esi || 0) +
    Number(salary.gratuity || 0);

  const ctc = gross + additionalBenefits;

  console.log("Current step:", step);

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
        {/* ================= STEP 0 ================= */}
        {step === 0 && (
          <>
            <Input label="Employee ID *"
              value={form.employee_id}
              onChange={(e)=>{
                update("employee_id", e.target.value.toUpperCase());
                setIdTouched(true);
              }}
            />

            <Input label="First Name *"
              value={form.first_name}
              onChange={(e)=>update("first_name", e.target.value)}
            />

            <Input label="Last Name"
              value={form.last_name}
              onChange={(e)=>update("last_name", e.target.value)}
            />

            <Input label="Email"
              value={form.email}
              onChange={(e)=>update("email", e.target.value)}
            />

            <Input label="Mobile"
              value={form.mobile}
              onChange={(e)=>update("mobile", e.target.value)}
            />

            <Input label="Date of Birth" type="date"
              value={form.dob}
              onChange={(e)=>update("dob", e.target.value)}
            />
          </>
        )}

        {/* ================= STEP 1 ================= */}
        {step === 1 && (
          <>
            <Input label="Department"
              value={form.department}
              onChange={(e)=>update("department", e.target.value)}
            />

            <Input label="Designation"
              value={form.designation}
              onChange={(e)=>update("designation", e.target.value)}
            />

            <Input label="Joining Date" type="date"
              value={form.joining_date}
              onChange={(e)=>update("joining_date", e.target.value)}
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

            <table className="payroll-table">
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Monthly</th>
                  <th>Yearly</th>
                </tr>
              </thead>

              <tbody>
                <SalaryRow label="Basic" field="basic" salary={salary} setSalary={setSalary} />
                <SalaryRow label="DA" field="da" salary={salary} setSalary={setSalary} />
                <SalaryRow label="HRA" field="hra" salary={salary} setSalary={setSalary} />
                <SalaryRow label="Conveyance" field="conveyance" salary={salary} setSalary={setSalary} />
                <SalaryRow label="Medical" field="medical" salary={salary} setSalary={setSalary} />
                <SalaryRow label="Special Allowance" field="special_allowance" salary={salary} setSalary={setSalary} />

                <SummaryRow label="Gross Salary (A)" value={gross} />

                <SalaryRow label="Employee PF" field="employee_pf" salary={salary} setSalary={setSalary} />
                <SalaryRow label="Professional Tax" field="professional_tax" salary={salary} setSalary={setSalary} />
                <SalaryRow label="Employee ESI" field="employee_esi" salary={salary} setSalary={setSalary} />
                <SalaryRow label="TDS" field="tds" salary={salary} setSalary={setSalary} />
                <SalaryRow label="Medical Insurance" field="medical_insurance" salary={salary} setSalary={setSalary} />

                <SummaryRow label="Total Deductions (B)" value={totalDeductions} />
                <SummaryRow label="Net Salary (A - B)" value={netSalary} />

                <SalaryRow label="Employer PF" field="employer_pf" salary={salary} setSalary={setSalary} />
                <SalaryRow label="Employer ESI" field="employer_esi" salary={salary} setSalary={setSalary} />
                <SalaryRow label="Gratuity" field="gratuity" salary={salary} setSalary={setSalary} />

                <SummaryRow label="CTC (A + C)" value={ctc} />
              </tbody>
            </table>

          </div>
        )}

        {/* ================= STEP 3 ================= */}
        {step === 3 && (
          <>
            <Input label="Bank Name"
              value={form.bank_name}
              onChange={(e)=>update("bank_name", e.target.value)}
            />

            <Input label="Account Number"
              value={form.account_number}
              onChange={(e)=>update("account_number", e.target.value)}
            />

            <Input label="IFSC Code"
              value={form.ifsc}
              onChange={(e)=>update("ifsc", e.target.value)}
            />

            <Input label="PAN Number"
              value={form.pan}
              onChange={(e)=>update("pan", e.target.value.toUpperCase())}
            />
          </>
        )}


        {/* ================= STEP 4 ================= */}
        {step === 4 && (
          <>
            <div className="form-field">
              <label>Profile Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  update("profile_photo", e.target.files[0])
                }
              />
            </div>

            <div className="form-field">
              <label>Resume</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) =>
                  update("resume", e.target.files[0])
                }
              />
            </div>

            <div className="form-field">
              <label>Offer Letter</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) =>
                  update("offer_letter", e.target.files[0])
                }
              />
            </div>

            <div className="form-field">
              <label>Aadhar Card</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) =>
                  update("aadhar_card", e.target.files[0])
                }
              />
            </div>

            <div className="form-field">
              <label>PAN Card</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) =>
                  update("pan_card", e.target.files[0])
                }
              />
            </div>

            <div className="form-field">
              <label>Address Proof</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) =>
                  update("address_proof", e.target.files[0])
                }
              />
            </div>

            <div className="form-field">
              <label>Education Certificate</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) =>
                  update("education_cert", e.target.files[0])
                }
              />
            </div>

            <div className="form-field">
              <label>Experience Certificate</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) =>
                  update("experience_cert", e.target.files[0])
                }
              />
            </div>
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
              onChange={(e)=>update("emergency_number", e.target.value)}
            />

            <div className="form-field">
              <label>Notes</label>
              <textarea
                value={form.notes}
                onChange={(e)=>update("notes", e.target.value)}
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
          <button className="btn primary" onClick={handleSave}>
            Save Employee
          </button>
        )}
      </div>
    </div>
  );
}

const Input = ({ label, ...props }) => (
  <div className="form-field">
    <label>{label}</label>
    <input {...props} />
  </div>
);


const SalaryRow = ({ label, field, salary, setSalary }) => {
  const value = salary[field] || "";

  return (
    <tr>
      <td>{label}</td>
      <td>
        <input
          type="number"
          value={value}
          onChange={(e) =>
            setSalary({ ...salary, [field]: e.target.value })
          }
        />
      </td>
      <td>
        ₹ {(Number(value || 0) * 12).toLocaleString("en-IN")}
      </td>
    </tr>
  );
};

const SummaryRow = ({ label, value }) => (
  <tr className="bold-row">
    <td>{label}</td>
    <td>₹ {Number(value).toLocaleString("en-IN")}</td>
    <td>₹ {(Number(value) * 12).toLocaleString("en-IN")}</td>
  </tr>
);