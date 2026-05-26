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
  const [errors, setErrors] = useState({});
  const [customRoles, setCustomRoles] = useState([]);
  const [customDepartments, setCustomDepartments] = useState([]);

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

    role: "EMPLOYEE",
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
        const token = localStorage.getItem('accessToken');
        const res = await fetch('http://127.0.0.1:8000/api/employees/roles/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        setCustomRoles(data.roles || []);
      } catch (err) {
        console.error('Failed to fetch roles', err);
      }
    };
    
    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('http://127.0.0.1:8000/api/employees/departments/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        setCustomDepartments(data.departments || []);
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
      if (!form.employee_id) newErrors.employee_id = "This field is required";
      if (!form.first_name) newErrors.first_name = "This field is required";
      if (!form.email) newErrors.email = "This field is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        newErrors.email = "Invalid email format";
      }
      if (form.mobile && !/^[0-9]{10}$/.test(form.mobile)) {
        newErrors.mobile = "Mobile number must be 10 digits";
      }
      if (idExists && !employee?.id) newErrors.employee_id = "Employee ID already exists";
    }

    if (currentStep === 1) {
      if (!form.department) newErrors.department = "This field is required";
      if (!form.designation) newErrors.designation = "This field is required";
      if (!form.joining_date) newErrors.joining_date = "This field is required";
    }

    if (currentStep === 2) {
      if (!salary.basic || Number(salary.basic) <= 0) {
        newErrors.basic = "Basic salary is required";
      }
    }

    if (currentStep === 3) {
      if (form.account_number && !/^[0-9]{9,18}$/.test(form.account_number)) {
        newErrors.account_number = "Account number must be 9-18 digits";
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
    alert("Employee ID, First Name, and Email are required");
    return;
  }

  if (idExists && !employee?.id) {
    alert("Employee ID already exists. Please use a different ID.");
    return;
  }

  const formData = new FormData();
  const fileFields = [
    "profile_photo", "resume", "offer_letter", "aadhar_card",
    "pan_card", "address_proof", "education_cert", "experience_cert"
  ];

  Object.keys(form).forEach((key) => {
    const value = form[key];
    
    if (fileFields.includes(key)) {
      if (value instanceof File) {
        formData.append(key, value);
      }
    } else if (value !== null && value !== undefined) {
      formData.append(key, value);
    }
  });

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

            <Input label="Address"
              value={form.address}
              onChange={(e)=>update("address", e.target.value)}
            />

            <Input label="Blood Group"
              value={form.blood_group}
              onChange={(e)=>update("blood_group", e.target.value)}
            />

            <Input label="Nationality"
              value={form.nationality}
              onChange={(e)=>update("nationality", e.target.value)}
            />
          </>
        )}

        {/* ================= STEP 1 ================= */}
        {step === 1 && (
          <>
            <div className="form-field">
              <label>Role *</label>
              <select
                value={form.role || "EMPLOYEE"}
                onChange={(e)=>update("role", e.target.value)}
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="HR">HR</option>
                {customRoles.map((role, index) => (
                  <option key={index} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Department *</label>
              <select
                value={form.department || ""}
                onChange={(e)=>update("department", e.target.value)}
              >
                <option value="">Select Department</option>
                {customDepartments.map((dept, index) => (
                  <option key={index} value={dept}>{dept}</option>
                ))}
              </select>
              {errors.department && <small style={{ color: "red", fontSize: "12px" }}>{errors.department}</small>}
            </div>

            <Input label="Designation *"
              value={form.designation}
              onChange={(e)=>update("designation", e.target.value)}
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

            <table className="payroll-table">
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Monthly</th>
                  <th>Yearly</th>
                </tr>
              </thead>

              <tbody>
                <SalaryRow label="Basic" field="basic" salary={salary} setSalary={updateSalary} error={errors.basic} />
                <SalaryRow label="DA" field="da" salary={salary} setSalary={updateSalary} />
                <SalaryRow label="HRA" field="hra" salary={salary} setSalary={updateSalary} />
                <SalaryRow label="Conveyance" field="conveyance" salary={salary} setSalary={updateSalary} />
                <SalaryRow label="Medical" field="medical" salary={salary} setSalary={updateSalary} />
                <SalaryRow label="Special Allowance" field="special_allowance" salary={salary} setSalary={updateSalary} />

                <SummaryRow label="Gross Salary (A)" value={gross} />

                <SalaryRow label="Employee PF" field="employee_pf" salary={salary} setSalary={updateSalary} />
                <SalaryRow label="Professional Tax" field="professional_tax" salary={salary} setSalary={updateSalary} />
                <SalaryRow label="Employee ESI" field="employee_esi" salary={salary} setSalary={updateSalary} />
                <SalaryRow label="TDS" field="tds" salary={salary} setSalary={updateSalary} />
                <SalaryRow label="Medical Insurance" field="medical_insurance" salary={salary} setSalary={updateSalary} />

                <SummaryRow label="Total Deductions (B)" value={totalDeductions} />
                <SummaryRow label="Net Salary (A - B)" value={netSalary} />

                <SalaryRow label="Employer PF" field="employer_pf" salary={salary} setSalary={updateSalary} />
                <SalaryRow label="Employer ESI" field="employer_esi" salary={salary} setSalary={updateSalary} />
                <SalaryRow label="Gratuity" field="gratuity" salary={salary} setSalary={updateSalary} />

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
          </>
        )}


        {/* ================= STEP 4 ================= */}
        {step === 4 && (
          <>
            <FileField
              label="Profile Photo"
              accept="image/*"
              currentFile={employee?.profile_photo}
              onChange={(file) => update("profile_photo", file)}
            />

            <FileField
              label="Resume"
              accept=".pdf,.doc,.docx"
              currentFile={employee?.resume}
              onChange={(file) => update("resume", file)}
            />

            <FileField
              label="Offer Letter"
              accept=".pdf"
              currentFile={employee?.offer_letter}
              onChange={(file) => update("offer_letter", file)}
            />

            <FileField
              label="Aadhar Card"
              accept=".pdf,.jpg,.jpeg,.png"
              currentFile={employee?.aadhar_card}
              onChange={(file) => update("aadhar_card", file)}
            />

            <FileField
              label="PAN Card"
              accept=".pdf,.jpg,.jpeg,.png"
              currentFile={employee?.pan_card}
              onChange={(file) => update("pan_card", file)}
            />

            <FileField
              label="Address Proof"
              accept=".pdf,.jpg,.jpeg,.png"
              currentFile={employee?.address_proof}
              onChange={(file) => update("address_proof", file)}
            />

            <FileField
              label="Education Certificate"
              accept=".pdf"
              currentFile={employee?.education_cert}
              onChange={(file) => update("education_cert", file)}
            />

            <FileField
              label="Experience Certificate"
              accept=".pdf"
              currentFile={employee?.experience_cert}
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

const Input = ({ label, error, ...props }) => (
  <div className="form-field">
    <label>{label}</label>
    <input {...props} />
    {error && <small style={{ color: "red", fontSize: "12px" }}>{error}</small>}
  </div>
);

const FileField = ({ label, accept, currentFile, onChange }) => {
  const getFileName = (url) => {
    if (!url) return null;
    return url.split('/').pop();
  };

  return (
    <div className="form-field">
      <label>{label}</label>
      {currentFile && typeof currentFile === 'string' && (
        <div style={{ marginBottom: '8px', fontSize: '14px', color: '#64748b' }}>
          Current: <a href={currentFile} target="_blank" rel="noopener noreferrer">{getFileName(currentFile)}</a>
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


const SalaryRow = ({ label, field, salary, setSalary, error }) => {
  const value = salary[field] || "";

  return (
    <>
      <tr>
        <td>{label}</td>
        <td>
          <input
            type="number"
            value={value}
            onChange={(e) => setSalary(field, e.target.value)}
            style={error ? { borderColor: "red" } : {}}
          />
        </td>
        <td>
          ₹ {(Number(value || 0) * 12).toLocaleString("en-IN")}
        </td>
      </tr>
      {error && (
        <tr>
          <td colSpan="3">
            <small style={{ color: "red", fontSize: "12px" }}>{error}</small>
          </td>
        </tr>
      )}
    </>
  );
};

const SummaryRow = ({ label, value }) => (
  <tr className="bold-row">
    <td>{label}</td>
    <td>₹ {Number(value).toLocaleString("en-IN")}</td>
    <td>₹ {(Number(value) * 12).toLocaleString("en-IN")}</td>
  </tr>
);