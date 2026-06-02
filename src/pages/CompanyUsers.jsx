import { useEffect, useMemo, useState } from "react";
import {
  createCompanyUser,
  getCompanyUsers,
  updateCompanyUser,
  deleteUser,
  setUserBlock,
  unlockUser,
} from "../api/users";
import { getEmployeeDepartments, getEmployeeRoles } from "../api/employees";
import { formatINR } from "../utils/currency";
import {
  buildCalculatedSalaryPayload,
  calculatePayroll,
  toAmount,
  yearlyAmount,
} from "../utils/payrollCalculations";
import { useAuth } from "../auth/AuthContext";
import { getEffectiveSystemSettings } from "../api/superadmin";
import "../styles/pages.css";

const ROLE_LABELS = {
  ADMIN: "Company Admin",
  HR: "HR",
};

const ACTIONS = [
  { key: "view", label: "View" },
  { key: "create", label: "Create" },
  { key: "edit", label: "Edit" },
  { key: "delete", label: "Delete" },
  { key: "export", label: "Export" },
  { key: "approve", label: "Approve" }
];

const PERMISSION_SCHEMA = [
  {
    key: "employees",
    label: "Employees",
    icon: "👥",
    description: "Manage employee directory and onboarding profiles.",
    pages: ACTIONS
  },
  {
    key: "attendance",
    label: "Attendance",
    icon: "📅",
    description: "Monitor check-in logs and monthly attendance statistics.",
    pages: ACTIONS
  },
  {
    key: "leaves",
    label: "Leaves",
    icon: "🍃",
    description: "Review and approve/reject employee leaves requests.",
    pages: ACTIONS
  },
  {
    key: "payroll",
    label: "Payroll",
    icon: "💰",
    description: "Structure salaries, generate payslips and log payments.",
    pages: ACTIONS
  },
  {
    key: "assets",
    label: "Assets",
    icon: "📦",
    description: "Assign company assets and track requests history.",
    pages: ACTIONS
  },
  {
    key: "daybook",
    label: "Day Book",
    icon: "📘",
    description: "Track financial transactions, vendors, and reports.",
    pages: ACTIONS
  },
  {
    key: "holidays",
    label: "Holidays",
    icon: "🏖️",
    description: "Configure active calendar company holidays list.",
    pages: ACTIONS
  },
  {
    key: "notifications",
    label: "Notifications",
    icon: "📧",
    description: "Send company wide announcements and email reminders.",
    pages: ACTIONS
  },
  {
    key: "support",
    label: "Support",
    icon: "🎫",
    description: "Reply to employee queries and support help tickets.",
    pages: ACTIONS
  }
];

const onboardingSteps = [
  "Personal Info",
  "Job Details",
  "Salary Structure",
  "Compliance & Bank",
  "Documents",
  "Emergency Details",
  "Accessibility Permissions",
];

function formatDate(value) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleString();
}

export default function CompanyUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [companyFeatures, setCompanyFeatures] = useState(null);

  // Stepper Wizard Toggle
  const [showOnboardWizard, setShowOnboardWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [direction, setDirection] = useState("forward");

  // Custom configuration lists
  const [customRoles, setCustomRoles] = useState([]);
  const [customDepartments, setCustomDepartments] = useState([]);

  // Onboarding Form State (Unified structure)
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    employee_id: "",

    // Step 1: Personal Information
    dob: "",
    gender: "",
    address: "",
    blood_group: "",
    nationality: "",

    // Step 2: Job Details
    department: "",
    designation: "",
    employment_type: "Full-time",
    joining_date: "",
    work_location: "",
    reporting_manager: "",

    // Step 4: Compliance & Bank details
    bank_name: "",
    account_number: "",
    ifsc: "",
    pan: "",
    pf_number: "",
    uan_number: "",
    esi_number: "",
    pf_applicable: false,
    esi_applicable: false,
    pt_applicable: false,

    // Step 6: Emergency Details
    emergency_name: "",
    emergency_number: "",
    notes: "",
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

  const [files, setFiles] = useState({
    profile_photo: null,
    resume: null,
    offer_letter: null,
    aadhar_card: null,
    pan_card: null,
    address_proof: null,
    education_certificate: null,
    experience_certificate: null,
  });

  // Editing State
  const [editingUser, setEditingUser] = useState(null);
  const [editTab, setEditTab] = useState("personal");
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    employee_id: "",
    is_active: true,

    // Step 1: Personal Info
    dob: "",
    gender: "",
    address: "",
    blood_group: "",
    nationality: "",

    // Step 2: Job Details
    department: "",
    designation: "",
    employment_type: "Full-time",
    joining_date: "",
    work_location: "",
    reporting_manager: "",

    // Step 4: Compliance & Bank details
    bank_name: "",
    account_number: "",
    ifsc: "",
    pan: "",
    pf_number: "",
    uan_number: "",
    esi_number: "",
    pf_applicable: false,
    esi_applicable: false,
    pt_applicable: false,

    // Step 6: Emergency Details
    emergency_name: "",
    emergency_number: "",
    notes: "",
  });

  const [editSalary, setEditSalary] = useState({
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

  const [editFiles, setEditFiles] = useState({
    profile_photo: null,
    resume: null,
    offer_letter: null,
    aadhar_card: null,
    pan_card: null,
    address_proof: null,
    education_certificate: null,
    experience_certificate: null,
  });

  // Active Permissions State
  const [permissions, setPermissions] = useState(() => {
    const initial = {};
    PERMISSION_SCHEMA.forEach(mod => {
      initial[mod.key] = {};
      mod.pages.forEach(p => {
        initial[mod.key][p.key] = true; // Default to checked
      });
    });
    return initial;
  });

  const companyName = currentUser?.company?.name || "your company";

  const isFeatureEnabled = (moduleKey, pageKey = null) => {
    if (!companyFeatures) return true; // Show all while loading
    if (moduleKey === "employees") return true; // Core module
    
    const key = moduleKey === "leaves" ? "leave" : moduleKey;
    const modObj = companyFeatures[key];
    
    if (modObj === undefined) return true;
    if (typeof modObj === "boolean") return modObj;
    
    if (typeof modObj === "object" && modObj !== null) {
      if (modObj.enabled === false) return false;
      
      if (pageKey && ["view", "create", "edit", "delete", "export", "approve"].includes(pageKey)) {
        if (modObj.actions) {
          return modObj.actions[pageKey] === true;
        }
      }
      
      if (pageKey && modObj.pages && modObj.pages[pageKey] !== undefined) {
        return modObj.pages[pageKey] === true;
      }
    }

    if (pageKey && ["view", "create", "edit", "delete", "export", "approve"].includes(pageKey)) {
      return true; 
    }

    if (!pageKey) {
      if (typeof modObj === "boolean") return modObj;
      return Object.values(modObj).some(val => val === true);
    }
    
    if (typeof modObj === "boolean") return modObj;
    return modObj[pageKey] === true;
  };

  const filteredSchema = useMemo(() => {
    if (!companyFeatures) return PERMISSION_SCHEMA;
    
    return PERMISSION_SCHEMA.map(mod => {
      const activePages = mod.pages.filter(p => isFeatureEnabled(mod.key, p.key));
      if (activePages.length === 0) return null;
      return {
        ...mod,
        pages: activePages
      };
    }).filter(Boolean);
  }, [companyFeatures]);

  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => (a.role > b.role ? 1 : -1)),
    [users]
  );

  const fetchUsers = async () => {
    try {
      const res = await getCompanyUsers();
      setUsers(Array.isArray(res.data) ? res.data : []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load company users.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRolesAndDepartments = async () => {
    try {
      const rRes = await getEmployeeRoles();
      setCustomRoles(rRes.data.roles || []);
      const dRes = await getEmployeeDepartments();
      setCustomDepartments(dRes.data.departments || []);
    } catch (err) {
      console.error("Failed to load departments or roles", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRolesAndDepartments();
    getEffectiveSystemSettings()
      .then(res => {
        const features = res.data?.company_enabled_modules || {};
        setCompanyFeatures(features);
        
        const checkEnabled = (modKey, pageKey) => {
          if (modKey === "employees") return true;
          const key = modKey === "leaves" ? "leave" : modKey;
          const modObj = features[key];
          if (modObj === undefined) return true;
          if (typeof modObj === "boolean") return modObj;
          if (typeof modObj === "object" && modObj !== null) {
            if (modObj.enabled === false) return false;
            if (modObj.actions && modObj.actions[pageKey] !== undefined) {
              return modObj.actions[pageKey] === true;
            }
            if (modObj.pages && modObj.pages[pageKey] !== undefined) {
              return modObj.pages[pageKey] === true;
            }
          }
          return modObj[pageKey] === true;
        };

        const initial = {};
        PERMISSION_SCHEMA.forEach(mod => {
          initial[mod.key] = {};
          mod.pages.forEach(p => {
            initial[mod.key][p.key] = checkEnabled(mod.key, p.key);
          });
        });
        setPermissions(initial);
      })
      .catch(() => {
        setCompanyFeatures({});
      });
  }, []);

  const handleSelectAll = () => {
    const allPerms = {};
    PERMISSION_SCHEMA.forEach(mod => {
      allPerms[mod.key] = {};
      mod.pages.forEach(p => {
        allPerms[mod.key][p.key] = false;
      });
    });
    filteredSchema.forEach(mod => {
      allPerms[mod.key] = {};
      mod.pages.forEach(p => {
        allPerms[mod.key][p.key] = true;
      });
    });
    setPermissions(allPerms);
  };

  const handleClearAll = () => {
    const noPerms = {};
    PERMISSION_SCHEMA.forEach(mod => {
      noPerms[mod.key] = {};
      mod.pages.forEach(p => {
        noPerms[mod.key][p.key] = false;
      });
    });
    setPermissions(noPerms);
  };

  const toggleModule = (moduleKey) => {
    const modObj = permissions[moduleKey] || {};
    const schemaMod = filteredSchema.find(m => m.key === moduleKey);
    if (!schemaMod) return;
    const allEnabled = schemaMod.pages.every(p => modObj[p.key] === true);
    
    setPermissions(current => {
      const next = { ...current };
      next[moduleKey] = { ...next[moduleKey] };
      schemaMod.pages.forEach(p => {
        next[moduleKey][p.key] = !allEnabled;
      });
      return next;
    });
  };

  const togglePage = (moduleKey, pageKey) => {
    setPermissions(current => {
      const next = { ...current };
      next[moduleKey] = { ...next[moduleKey] };
      next[moduleKey][pageKey] = !next[moduleKey][pageKey];
      return next;
    });
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSalaryChange = (field, value) => {
    setSalary((current) => ({
      ...current,
      [field]: value
    }));
  };

  const handleEditSalaryChange = (field, value) => {
    setEditSalary((current) => ({
      ...current,
      [field]: value
    }));
  };

  const handleEditChange = (event) => {
    const { name, value, type, checked } = event.target;
    setEditForm((current) => ({ 
      ...current, 
      [name]: type === "checkbox" ? checked : value 
    }));
  };

  const handleFileChange = (event) => {
    const { name, files: uploadedFiles } = event.target;
    setFiles((current) => ({ ...current, [name]: uploadedFiles[0] }));
  };

  const handleEditFileChange = (event) => {
    const { name, files: uploadedFiles } = event.target;
    setEditFiles((current) => ({ ...current, [name]: uploadedFiles[0] }));
  };

  const handleStartEdit = (usr) => {
    setEditingUser(usr);
    setEditTab("personal");
    const details = usr.hr_details || {};
    const dSalary = details.salary || {};

    setEditForm({
      first_name: usr.first_name || "",
      last_name: usr.last_name || "",
      email: usr.email || "",
      phone: usr.phone || "",
      employee_id: usr.employee_id || "",
      is_active: usr.is_active !== false,

      // Step 1: Personal Info
      dob: details.dob || "",
      gender: details.gender || "",
      address: details.address || "",
      blood_group: details.blood_group || "",
      nationality: details.nationality || "",

      // Step 2: Job Details
      department: details.department || "",
      designation: details.designation || "",
      employment_type: details.employment_type || "Full-time",
      joining_date: details.joining_date || "",
      work_location: details.work_location || "",
      reporting_manager: details.reporting_manager || "",

      // Step 4: Compliance & Bank details
      bank_name: details.bank_name || "",
      account_number: details.account_number || "",
      ifsc: details.ifsc || "",
      pan: details.pan || "",
      pf_number: details.pf_number || "",
      uan_number: details.uan_number || "",
      esi_number: details.esi_number || "",
      pf_applicable: details.pf_applicable || false,
      esi_applicable: details.esi_applicable || false,
      pt_applicable: details.pt_applicable || false,

      // Step 6: Emergency details
      emergency_name: details.emergency_name || "",
      emergency_number: details.emergency_number || "",
      notes: details.notes || "",
    });

    setEditSalary({
      basic: dSalary.basic || "",
      da: dSalary.da || "",
      hra: dSalary.hra || "",
      conveyance: dSalary.conveyance || "",
      medical: dSalary.medical || "",
      special_allowance: dSalary.special_allowance || "",
      employee_pf: dSalary.employee_pf || "",
      professional_tax: dSalary.professional_tax || "",
      employee_esi: dSalary.employee_esi || "",
      tds: dSalary.tds || "",
      medical_insurance: dSalary.medical_insurance || "",
      employer_pf: dSalary.employer_pf || "",
      employer_esi: dSalary.employer_esi || "",
      gratuity: dSalary.gratuity || "",
    });
    
    setEditFiles({
      profile_photo: null,
      resume: null,
      offer_letter: null,
      aadhar_card: null,
      pan_card: null,
      address_proof: null,
      education_certificate: null,
      experience_certificate: null,
    });
    
    // Set active permissions from existing user hr_permissions
    const initialPerms = {};
    PERMISSION_SCHEMA.forEach(mod => {
      initialPerms[mod.key] = {};
      mod.pages.forEach(p => {
        initialPerms[mod.key][p.key] = false;
      });
    });
    filteredSchema.forEach(mod => {
      initialPerms[mod.key] = {};
      mod.pages.forEach(p => {
        initialPerms[mod.key][p.key] = (usr.hr_permissions?.[mod.key]?.[p.key] === true);
      });
    });
    setPermissions(initialPerms);
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setError("");
    handleSelectAll();
  };

  // Helper validation for steps
  const validateStep = (currentStep) => {
    const newErrors = {};

    if (currentStep === 0) {
      if (!form.employee_id) newErrors.employee_id = "please enter this field";
      if (!form.first_name) newErrors.first_name = "please enter this field";
      if (!form.last_name) newErrors.last_name = "please enter this field";
      if (!form.email) newErrors.email = "please enter this field";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        newErrors.email = "Invalid email format";
      }
    }
    if (currentStep === 1) {
      if (!form.designation) newErrors.designation = "please enter this field";
      if (!form.department) newErrors.department = "please enter this field";
      if (!form.joining_date) newErrors.joining_date = "please enter this field";
    }
    if (currentStep === 2) {
      if (toAmount(salary.basic) <= 0) {
        newErrors.basic = "please enter this field";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(wizardStep)) return;
    setDirection("forward");
    setWizardStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setDirection("backward");
    setWizardStep((prev) => prev - 1);
  };

  const handleSubmit = async (event) => {
    if (event) event.preventDefault();
    if (saving) return;

    setSaving(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("role", "HR");
      formData.append("email", form.email.trim());
      formData.append("username", form.email.trim().toLowerCase());
      formData.append("first_name", form.first_name.trim());
      formData.append("last_name", form.last_name.trim());
      formData.append("phone", form.phone.trim());
      formData.append("employee_id", form.employee_id.trim());
      formData.append("hr_permissions", JSON.stringify(permissions));

      // Pack additional steps' information safely in hr_details JSON object
      const hrDetailsPayload = {
        // Step 1
        dob: form.dob,
        gender: form.gender,
        address: form.address,
        blood_group: form.blood_group,
        nationality: form.nationality,
        // Step 2
        department: form.department,
        designation: form.designation,
        employment_type: form.employment_type,
        joining_date: form.joining_date,
        work_location: form.work_location,
        reporting_manager: form.reporting_manager,
        // Step 3
        salary: salary,
        // Step 4
        bank_name: form.bank_name,
        account_number: form.account_number,
        ifsc: form.ifsc,
        pan: form.pan,
        pf_number: form.pf_number,
        uan_number: form.uan_number,
        esi_number: form.esi_number,
        pf_applicable: form.pf_applicable,
        esi_applicable: form.esi_applicable,
        pt_applicable: form.pt_applicable,
        // Step 6
        emergency_name: form.emergency_name,
        emergency_number: form.emergency_number,
        notes: form.notes,
      };
      
      formData.append("hr_details", JSON.stringify(hrDetailsPayload));

      Object.keys(files).forEach((key) => {
        if (files[key]) {
          formData.append(key, files[key]);
        }
      });

      await createCompanyUser(formData);
      alert("HR user onboarded successfully. A temporary password has been emailed.");
      
      // Reset State
      setForm({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        employee_id: "",
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
        bank_name: "",
        account_number: "",
        ifsc: "",
        pan: "",
        pf_number: "",
        uan_number: "",
        esi_number: "",
        pf_applicable: false,
        esi_applicable: false,
        pt_applicable: false,
        emergency_name: "",
        emergency_number: "",
        notes: "",
      });
      setSalary({
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
      setFiles({
        profile_photo: null,
        resume: null,
        offer_letter: null,
        aadhar_card: null,
        pan_card: null,
        address_proof: null,
        education_certificate: null,
        experience_certificate: null,
      });
      
      setWizardStep(0);
      setShowOnboardWizard(false);
      handleSelectAll();
      fetchUsers();
    } catch (err) {
      const data = err.response?.data || {};
      const firstError =
        data.email?.[0] ||
        data.role?.[0] ||
        data.employee_id?.[0] ||
        data.error ||
        data.detail ||
        "Failed to onboarding HR user.";
      setError(firstError);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async (event) => {
    event.preventDefault();
    if (saving) return;

    setSaving(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("first_name", editForm.first_name.trim());
      formData.append("last_name", editForm.last_name.trim());
      formData.append("phone", editForm.phone.trim());
      formData.append("employee_id", editForm.employee_id.trim());
      formData.append("is_active", editForm.is_active);
      formData.append("hr_permissions", JSON.stringify(permissions));

      const hrDetailsPayload = {
        // Step 1
        dob: editForm.dob,
        gender: editForm.gender,
        address: editForm.address,
        blood_group: editForm.blood_group,
        nationality: editForm.nationality,
        // Step 2
        department: editForm.department,
        designation: editForm.designation,
        employment_type: editForm.employment_type,
        joining_date: editForm.joining_date,
        work_location: editForm.work_location,
        reporting_manager: editForm.reporting_manager,
        // Step 3
        salary: editSalary,
        // Step 4
        bank_name: editForm.bank_name,
        account_number: editForm.account_number,
        ifsc: editForm.ifsc,
        pan: editForm.pan,
        pf_number: editForm.pf_number,
        uan_number: editForm.uan_number,
        esi_number: editForm.esi_number,
        pf_applicable: editForm.pf_applicable,
        esi_applicable: editForm.esi_applicable,
        pt_applicable: editForm.pt_applicable,
        // Step 6
        emergency_name: editForm.emergency_name,
        emergency_number: editForm.emergency_number,
        notes: editForm.notes,
      };

      formData.append("hr_details", JSON.stringify(hrDetailsPayload));

      Object.keys(editFiles).forEach((key) => {
        if (editFiles[key]) {
          formData.append(key, editFiles[key]);
        }
      });

      await updateCompanyUser(editingUser.id, formData);
      alert("HR user updated successfully.");
      setEditingUser(null);
      handleSelectAll();
      fetchUsers();
    } catch (err) {
      const data = err.response?.data || {};
      const firstError =
        data.employee_id?.[0] ||
        data.detail ||
        "Failed to update HR user.";
      setError(firstError);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (companyUser) => {
    const nextStatus = !companyUser.is_active;
    try {
      await setUserBlock(companyUser.id, nextStatus);
      alert(`User status successfully changed to ${nextStatus ? "Active" : "Inactive"}.`);
      fetchUsers();
    } catch (err) {
      alert("Failed to change user status.");
    }
  };

  const handleUnlockUser = async (companyUser) => {
    try {
      await unlockUser(companyUser.id);
      alert("User account successfully unlocked.");
      fetchUsers();
    } catch (err) {
      alert("Failed to unlock user account.");
    }
  };

  const handleDeleteClick = async (userId) => {
    if (!window.confirm("Are you sure you want to permanently delete this HR user? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteUser(userId);
      alert("HR user deleted successfully.");
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete HR user.");
    }
  };

  const renderPermissionBadges = (companyUser) => {
    if (companyUser.role === "ADMIN") {
      return <span className="cu-badge-pill full-access">🌟 Full Admin</span>;
    }
    const perms = companyUser.hr_permissions || {};
    const badges = [];

    filteredSchema.forEach(mod => {
      const modObj = perms[mod.key];
      let hasAny = false;
      if (modObj) {
        if (typeof modObj === "boolean") {
          hasAny = modObj;
        } else {
          hasAny = mod.pages.some(p => modObj[p.key] === true);
        }
      }

      if (hasAny) {
        badges.push(
          <span key={mod.key} className={`cu-badge-pill ${mod.key}`}>
            {mod.icon} {mod.label}
          </span>
        );
      }
    });

    if (badges.length === 0) {
      return <span className="muted-text" style={{ fontSize: 12 }}>No Permissions Assigned</span>;
    }

    if (badges.length === filteredSchema.length) {
      return <span className="cu-badge-pill full-access">🌟 Full Access (All)</span>;
    }

    return <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{badges}</div>;
  };

  const isModuleCardActive = (moduleKey) => {
    const modObj = permissions[moduleKey] || {};
    const schemaMod = filteredSchema.find(m => m.key === moduleKey);
    if (!schemaMod) return false;
    return schemaMod.pages.some(p => modObj[p.key] === true);
  };

  // Salary real-time calculations
  const payroll = useMemo(() => calculatePayroll(salary), [salary]);
  const editPayroll = useMemo(() => calculatePayroll(editSalary), [editSalary]);

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Dynamic Premium Styling Block */}
      <style>{`
        .cu-card {
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02);
          padding: 28px;
          margin-bottom: 28px;
          border: 1px solid #f0f2f5;
        }
        .cu-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .cu-card-title {
          margin: 0;
          color: #0f172a;
          font-size: 18px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .cu-form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }
        .cu-form-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .cu-form-field label {
          font-weight: 600;
          font-size: 13px;
          color: #475569;
        }
        .cu-form-field input, .cu-form-field select, .cu-form-field textarea {
          padding: 10px 14px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          font-size: 14px;
          outline: none;
          background: #ffffff;
          transition: all 0.2s ease;
        }
        .cu-form-field input:focus, .cu-form-field select:focus, .cu-form-field textarea:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
        .cu-form-field input:disabled {
          background: #f1f5f9;
          color: #64748b;
          cursor: not-allowed;
        }
        .permissions-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 24px;
          margin-bottom: 16px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 12px;
        }
        .permissions-title {
          font-weight: 600;
          color: #0f172a;
          margin: 0;
          font-size: 16px;
        }
        .permissions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .module-card {
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 16px;
          transition: all 0.2s ease;
        }
        .module-card.active {
          border-color: #6366f1;
          background: #faf5ff;
        }
        .module-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
          padding-bottom: 8px;
          border-bottom: 1px dashed #cbd5e1;
        }
        .module-title-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .module-icon {
          font-size: 18px;
        }
        .module-title {
          font-weight: 600;
          color: #1e293b;
          font-size: 14px;
        }
        .module-desc {
          font-size: 11px;
          color: #64748b;
          line-height: 1.4;
          margin-bottom: 12px;
          height: 32px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .subpages-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .subpage-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #334155;
          cursor: pointer;
          padding: 4px 6px;
          border-radius: 4px;
          transition: background 0.15s ease;
        }
        .subpage-item:hover {
          background: rgba(99, 102, 241, 0.05);
        }
        .custom-checkbox {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          border: 2px solid #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
          background: #ffffff;
        }
        .custom-checkbox.checked {
          border-color: #6366f1;
          background: #6366f1;
        }
        .custom-checkbox.checked::after {
          content: "✓";
          color: #ffffff;
          font-size: 10px;
          font-weight: bold;
        }
        .cu-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 600;
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
        }
        .cu-badge-pill.full-access {
          background: #dcfce7;
          color: #15803d;
          border-color: #bbf7d0;
        }
        .cu-badge-pill.employees { background: #ffedd5; color: #c2410c; border-color: #fed7aa; }
        .cu-badge-pill.attendance { background: #fee2e2; color: #b91c1c; border-color: #fecaca; }
        .cu-badge-pill.leaves { background: #dbeafe; color: #1d4ed8; border-color: #bfdbfe; }
        .cu-badge-pill.payroll { background: #fef9c3; color: #a16207; border-color: #fef08a; }
        .cu-badge-pill.assets { background: #e0f2fe; color: #0369a1; border-color: #bae6fd; }
        .cu-badge-pill.daybook { background: #fae8ff; color: #a21caf; border-color: #f5d0fe; }
        .cu-badge-pill.holidays { background: #ffe4e6; color: #be123c; border-color: #fecdd3; }
        .cu-badge-pill.notifications { background: #ecfeff; color: #0e7490; border-color: #cffafe; }
        .cu-badge-pill.support { background: #f0fdf4; color: #15803d; border-color: #bbf7d0; }

        .cu-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }
        .cu-modal-container {
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          width: 92%;
          max-width: 960px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 28px;
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Stepper styles */
        .stepper {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 32px;
          position: relative;
        }
        .step {
          flex: 1;
          text-align: center;
          position: relative;
          opacity: 0.5;
          transition: all 0.3s ease;
        }
        .step::after {
          content: "";
          position: absolute;
          top: 17px;
          right: -50%;
          width: 100%;
          height: 3px;
          background: #e2e8f0;
          z-index: 0;
          transition: all 0.3s ease;
        }
        .step:last-child::after {
          display: none;
        }
        .step.active {
          opacity: 1;
        }
        .step.active span {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
        }
        .step.active::after {
          background: #6366f1;
        }
        .step span {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #e2e8f0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #475569;
          position: relative;
          z-index: 1;
          transition: all 0.3s ease;
          font-size: 13px;
        }
        .step p {
          font-size: 11px;
          margin-top: 8px;
          color: #64748b;
          font-weight: 600;
        }
        .step.active p {
          color: #0f172a;
        }

        /* Animations */
        .step-animate {
          animation-duration: 0.3s;
          animation-fill-mode: both;
          animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
        .step-animate.forward {
          animation-name: slideForward;
        }
        .step-animate.backward {
          animation-name: slideBackward;
        }
        @keyframes slideForward {
          from { opacity: 0; transform: translateX(30px) scale(0.99); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes slideBackward {
          from { opacity: 0; transform: translateX(-30px) scale(0.99); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        /* Salary Calculations styles */
        .salary-step-wrapper {
          grid-column: 1 / -1;
        }
        .payroll-table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          table-layout: fixed;
        }
        .payroll-table th {
          background: #f8fafc;
          padding: 10px 12px;
          text-align: left;
          font-size: 12px;
          color: #475569;
          border-bottom: 1px solid #e2e8f0;
        }
        .payroll-table td {
          border-bottom: 1px solid #f1f5f9;
          padding: 8px 12px;
          font-size: 13px;
        }
        .payroll-table td:nth-child(2), .payroll-table td:nth-child(3),
        .payroll-table th:nth-child(2), .payroll-table th:nth-child(3) {
          text-align: right;
        }
        .payroll-table input[type="number"] {
          width: 120px;
          text-align: right;
          padding: 6px 10px;
          border-radius: 6px;
          border: 1px solid #cbd5e1;
        }
        .bold-row td {
          font-weight: 700;
          background: #f1f5f9;
          color: #0f172a;
        }
        .bold-row.summary-gross td { background: #eff6ff; }
        .bold-row.summary-deduction td { background: #fef3c7; }
        .bold-row.summary-net td { background: #dcfce7; }
        .bold-row.summary-ctc td { background: #ede9fe; }

        .cu-form-field input[type="file"] {
          padding: 12px;
          background: #f8fafc;
          border: 2px dashed #cbd5e1;
          border-radius: 8px;
          cursor: pointer;
        }
        .cu-form-field input[type="file"]:hover {
          background: #f0f2ff;
          border-color: #6366f1;
        }

        /* Tabs for Edit Modal */
        .modal-tabs {
          display: flex;
          gap: 8px;
          border-bottom: 1px solid #e2e8f0;
          margin-bottom: 24px;
          overflow-x: auto;
        }
        .modal-tab-btn {
          padding: 10px 16px;
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
          border: none;
          background: transparent;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .modal-tab-btn:hover {
          color: #4f46e5;
        }
        .modal-tab-btn.active {
          color: #4f46e5;
          border-bottom-color: #4f46e5;
        }
      `}</style>

      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Company Users & Permissions</h2>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Manage Admin and HR users for <strong>{companyName}</strong>. Specify exactly which modules and sub-pages each HR user is allowed to access.
          </p>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            marginTop: 12,
            marginBottom: 20,
            padding: "12px 16px",
            borderRadius: 10,
            background: "#fef2f2",
            color: "#b91c1c",
            fontSize: 14,
            fontWeight: 500,
            border: "1px solid #fee2e2"
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* ─── SCENARIO A: WIZARD FORM IS OPEN ─── */}
      {showOnboardWizard ? (
        <div className="cu-card">
          <div className="cu-card-header">
            <h3 className="cu-card-title">✨ Onboard New HR User</h3>
            <button
              type="button"
              className="btn secondary"
              style={{ fontSize: 13, padding: "8px 16px" }}
              onClick={() => {
                setShowOnboardWizard(false);
                setWizardStep(0);
              }}
            >
              ← Back to Active Directory
            </button>
          </div>

          {/* Stepper Steps UI */}
          <div className="stepper">
            {onboardingSteps.map((label, idx) => (
              <div key={idx} className={`step ${idx <= wizardStep ? "active" : ""}`}>
                <span>{idx + 1}</span>
                <p>{label}</p>
              </div>
            ))}
          </div>

          <form onSubmit={(e) => e.preventDefault()}>
            <div className={`step-animate ${direction}`}>
              
              {/* STEP 1: Personal Info */}
              {wizardStep === 0 && (
                <div className="cu-form-grid">
                  <div className="cu-form-field">
                    <label>Employee ID *</label>
                    <input
                      name="employee_id"
                      value={form.employee_id}
                      onChange={handleChange}
                      placeholder="EMP-HR-01"
                      className={errors.employee_id ? "input-error" : ""}
                      required
                    />
                    {errors.employee_id && <small className="error-text">{errors.employee_id}</small>}
                  </div>
                  <div className="cu-form-field">
                    <label>First Name *</label>
                    <input
                      name="first_name"
                      value={form.first_name}
                      onChange={handleChange}
                      placeholder="First name"
                      className={errors.first_name ? "input-error" : ""}
                      required
                    />
                    {errors.first_name && <small className="error-text">{errors.first_name}</small>}
                  </div>
                  <div className="cu-form-field">
                    <label>Last Name *</label>
                    <input
                      name="last_name"
                      value={form.last_name}
                      onChange={handleChange}
                      placeholder="Last name"
                      className={errors.last_name ? "input-error" : ""}
                      required
                    />
                    {errors.last_name && <small className="error-text">{errors.last_name}</small>}
                  </div>
                  <div className="cu-form-field">
                    <label>Email Address *</label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="hr@company.com"
                      className={errors.email ? "input-error" : ""}
                      required
                    />
                    {errors.email && <small className="error-text">{errors.email}</small>}
                  </div>
                  <div className="cu-form-field">
                    <label>Phone Number</label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+91999999999"
                    />
                  </div>
                  <div className="cu-form-field">
                    <label>Date of Birth</label>
                    <input
                      name="dob"
                      type="date"
                      value={form.dob}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="cu-form-field">
                    <label>Gender</label>
                    <select name="gender" value={form.gender} onChange={handleChange}>
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="cu-form-field">
                    <label>Blood Group</label>
                    <select
                      name="blood_group"
                      value={form.blood_group || ""}
                      onChange={handleChange}
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
                  <div className="cu-form-field">
                    <label>Nationality</label>
                    <input
                      name="nationality"
                      value={form.nationality}
                      onChange={handleChange}
                      placeholder="Indian"
                    />
                  </div>
                  <div className="cu-form-field" style={{ gridColumn: "1 / -1" }}>
                    <label>Permanent Address</label>
                    <textarea
                      name="address"
                      rows={2}
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Enter street, city, state, pincode"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Job Details */}
              {wizardStep === 1 && (
                <div className="cu-form-grid">
                  <div className="cu-form-field">
                    <label>Designation *</label>
                    <input
                      name="designation"
                      value={form.designation}
                      onChange={handleChange}
                      placeholder="HR Executive"
                      className={errors.designation ? "input-error" : ""}
                      required
                    />
                    {errors.designation && <small className="error-text">{errors.designation}</small>}
                  </div>
                  <div className="cu-form-field">
                    <label>Department *</label>
                    <select
                      name="department"
                      value={form.department}
                      onChange={handleChange}
                      className={errors.department ? "input-error" : ""}
                      required
                    >
                      <option value="">Select Department</option>
                      {customDepartments.map((dept, i) => (
                        <option key={i} value={dept}>{dept}</option>
                      ))}
                    </select>
                    {errors.department && <small className="error-text">{errors.department}</small>}
                  </div>
                  <div className="cu-form-field">
                    <label>Employment Type</label>
                    <select
                      name="employment_type"
                      value={form.employment_type}
                      onChange={handleChange}
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Intern">Intern</option>
                    </select>
                  </div>
                  <div className="cu-form-field">
                    <label>Joining Date *</label>
                    <input
                      name="joining_date"
                      type="date"
                      value={form.joining_date}
                      onChange={handleChange}
                      className={errors.joining_date ? "input-error" : ""}
                      required
                    />
                    {errors.joining_date && <small className="error-text">{errors.joining_date}</small>}
                  </div>
                  <div className="cu-form-field">
                    <label>Work Location</label>
                    <input
                      name="work_location"
                      value={form.work_location}
                      onChange={handleChange}
                      placeholder="Head Office"
                    />
                  </div>
                  <div className="cu-form-field">
                    <label>Reporting Manager</label>
                    <input
                      name="reporting_manager"
                      value={form.reporting_manager}
                      onChange={handleChange}
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Salary Structure */}
              {wizardStep === 2 && (
                <div className="salary-step-wrapper">
                  <h4 style={{ margin: "0 0 16px 0", color: "#0f172a", fontSize: 14 }}>✨ Define Monthly Pay Scale</h4>
                  <div className="responsive-table-container">
                    <table className="payroll-table" style={{ minWidth: "600px", width: "100%" }}>
                      <thead>
                        <tr>
                          <th style={{ width: "45%" }}>Salary Component</th>
                          <th style={{ width: "27.5%", textAlign: "right" }}>Monthly Amount (₹)</th>
                          <th style={{ width: "27.5%", textAlign: "right" }}>Yearly Amount (₹)</th>
                        </tr>
                      </thead>
                    <tbody>
                      <tr className="bold-row"><td colSpan="3">Earnings (A)</td></tr>
                      <tr>
                        <td>Basic *</td>
                        <td>
                          <input type="number" value={salary.basic} onChange={(e) => handleSalaryChange("basic", e.target.value)} step="0.01" min="0" className={errors.basic ? "input-error" : ""} />
                          {errors.basic && <div className="error-text" style={{ fontSize: 11, textAlign: "right" }}>{errors.basic}</div>}
                        </td>
                        <td>{formatINR(yearlyAmount(salary.basic))}</td>
                      </tr>
                      <tr>
                        <td>DA</td>
                        <td><input type="number" value={salary.da} onChange={(e) => handleSalaryChange("da", e.target.value)} step="0.01" min="0" /></td>
                        <td>{formatINR(yearlyAmount(salary.da))}</td>
                      </tr>
                      <tr>
                        <td>HRA</td>
                        <td><input type="number" value={salary.hra} onChange={(e) => handleSalaryChange("hra", e.target.value)} step="0.01" min="0" /></td>
                        <td>{formatINR(yearlyAmount(salary.hra))}</td>
                      </tr>
                      <tr>
                        <td>Conveyance</td>
                        <td><input type="number" value={salary.conveyance} onChange={(e) => handleSalaryChange("conveyance", e.target.value)} step="0.01" min="0" /></td>
                        <td>{formatINR(yearlyAmount(salary.conveyance))}</td>
                      </tr>
                      <tr>
                        <td>Medical Allowance</td>
                        <td><input type="number" value={salary.medical} onChange={(e) => handleSalaryChange("medical", e.target.value)} step="0.01" min="0" /></td>
                        <td>{formatINR(yearlyAmount(salary.medical))}</td>
                      </tr>
                      <tr>
                        <td>Special Allowance</td>
                        <td><input type="number" value={salary.special_allowance} onChange={(e) => handleSalaryChange("special_allowance", e.target.value)} step="0.01" min="0" /></td>
                        <td>{formatINR(yearlyAmount(salary.special_allowance))}</td>
                      </tr>

                      <tr className="bold-row summary-gross">
                        <td>Gross Salary (A)</td>
                        <td>{formatINR(payroll.gross)}</td>
                        <td>{formatINR(yearlyAmount(payroll.gross))}</td>
                      </tr>

                      <tr className="bold-row"><td colSpan="3">Deductions (B)</td></tr>
                      <tr>
                        <td>Employee PF</td>
                        <td><input type="number" value={salary.employee_pf} onChange={(e) => handleSalaryChange("employee_pf", e.target.value)} step="0.01" min="0" /></td>
                        <td>{formatINR(yearlyAmount(salary.employee_pf))}</td>
                      </tr>
                      <tr>
                        <td>Professional Tax</td>
                        <td><input type="number" value={salary.professional_tax} onChange={(e) => handleSalaryChange("professional_tax", e.target.value)} step="0.01" min="0" /></td>
                        <td>{formatINR(yearlyAmount(salary.professional_tax))}</td>
                      </tr>
                      <tr>
                        <td>Employee ESI</td>
                        <td><input type="number" value={salary.employee_esi} onChange={(e) => handleSalaryChange("employee_esi", e.target.value)} step="0.01" min="0" /></td>
                        <td>{formatINR(yearlyAmount(salary.employee_esi))}</td>
                      </tr>
                      <tr>
                        <td>TDS</td>
                        <td><input type="number" value={salary.tds} onChange={(e) => handleSalaryChange("tds", e.target.value)} step="0.01" min="0" /></td>
                        <td>{formatINR(yearlyAmount(salary.tds))}</td>
                      </tr>
                      <tr>
                        <td>Medical Insurance</td>
                        <td><input type="number" value={salary.medical_insurance} onChange={(e) => handleSalaryChange("medical_insurance", e.target.value)} step="0.01" min="0" /></td>
                        <td>{formatINR(yearlyAmount(salary.medical_insurance))}</td>
                      </tr>

                      <tr className="bold-row summary-deduction">
                        <td>Total Deductions (B)</td>
                        <td>{formatINR(payroll.totalDeductions)}</td>
                        <td>{formatINR(yearlyAmount(payroll.totalDeductions))}</td>
                      </tr>

                      <tr className="bold-row summary-net">
                        <td>Net Salary (A - B)</td>
                        <td>{formatINR(payroll.netSalary)}</td>
                        <td>{formatINR(yearlyAmount(payroll.netSalary))}</td>
                      </tr>

                      <tr className="bold-row"><td colSpan="3">Employer Contributions</td></tr>
                      <tr>
                        <td>Employer PF</td>
                        <td><input type="number" value={salary.employer_pf} onChange={(e) => handleSalaryChange("employer_pf", e.target.value)} step="0.01" min="0" /></td>
                        <td>{formatINR(yearlyAmount(salary.employer_pf))}</td>
                      </tr>
                      <tr>
                        <td>Employer ESI</td>
                        <td><input type="number" value={salary.employer_esi} onChange={(e) => handleSalaryChange("employer_esi", e.target.value)} step="0.01" min="0" /></td>
                        <td>{formatINR(yearlyAmount(salary.employer_esi))}</td>
                      </tr>
                      <tr>
                        <td>Gratuity</td>
                        <td><input type="number" value={salary.gratuity} onChange={(e) => handleSalaryChange("gratuity", e.target.value)} step="0.01" min="0" /></td>
                        <td>{formatINR(yearlyAmount(salary.gratuity))}</td>
                      </tr>

                      <tr className="bold-row summary-ctc">
                        <td>CTC (Gross + Contributions)</td>
                        <td>{formatINR(payroll.ctc)}</td>
                        <td>{formatINR(yearlyAmount(payroll.ctc))}</td>
                      </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* STEP 4: Compliance & Bank Details */}
              {wizardStep === 3 && (
                <div>
                  <div className="cu-form-grid" style={{ marginBottom: 24 }}>
                    <div className="cu-form-field">
                      <label>Bank Name</label>
                      <input
                        name="bank_name"
                        value={form.bank_name}
                        onChange={handleChange}
                        placeholder="HDFC Bank"
                      />
                    </div>
                    <div className="cu-form-field">
                      <label>Account Number</label>
                      <input
                        name="account_number"
                        value={form.account_number}
                        onChange={handleChange}
                        placeholder="5010023456789"
                      />
                    </div>
                    <div className="cu-form-field">
                      <label>IFSC Code</label>
                      <input
                        name="ifsc"
                        value={form.ifsc}
                        onChange={handleChange}
                        placeholder="HDFC0001234"
                      />
                    </div>
                    <div className="cu-form-field">
                      <label>PAN Number</label>
                      <input
                        name="pan"
                        value={form.pan}
                        onChange={handleChange}
                        placeholder="ABCDE1234F"
                      />
                    </div>
                    {form.pf_applicable && (
                      <div className="cu-form-field">
                        <label>PF Number</label>
                        <input
                          name="pf_number"
                          value={form.pf_number}
                          onChange={handleChange}
                          placeholder="MH/BAN/12345/678"
                        />
                      </div>
                    )}
                    <div className="cu-form-field">
                      <label>UAN Number</label>
                      <input
                        name="uan_number"
                        value={form.uan_number}
                        onChange={handleChange}
                        placeholder="100234567890"
                      />
                    </div>
                    {form.esi_applicable && (
                      <div className="cu-form-field">
                        <label>ESI Number</label>
                        <input
                          name="esi_number"
                          value={form.esi_number}
                          onChange={handleChange}
                          placeholder="3100234567890123"
                        />
                      </div>
                    )}
                  </div>

                  <h4 style={{ margin: "24px 0 12px 0", color: "#0f172a", fontSize: 13 }}>⚙️ Statutory Applicability</h4>
                  <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: "600", color: "#334155" }}>
                      <input type="checkbox" name="pf_applicable" checked={form.pf_applicable} onChange={handleChange} style={{ width: 18, height: 18 }} />
                      PF Applicable
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: "600", color: "#334155" }}>
                      <input type="checkbox" name="esi_applicable" checked={form.esi_applicable} onChange={handleChange} style={{ width: 18, height: 18 }} />
                      ESI Applicable
                    </label>
                  </div>
                </div>
              )}

              {/* STEP 5: Document Uploads */}
              {wizardStep === 4 && (
                <div>
                  <h4 style={{ margin: "0 0 16px 0", color: "#0f172a", fontSize: 14 }}>📁 Upload Onboarding Documents</h4>
                  <div className="cu-form-grid" style={{ background: "#f8fafc", padding: "20px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
                    <div className="cu-form-field">
                      <label>Profile Photo</label>
                      <input type="file" name="profile_photo" onChange={handleFileChange} accept="image/*" />
                    </div>
                    <div className="cu-form-field">
                      <label>Resume</label>
                      <input type="file" name="resume" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                    </div>
                    <div className="cu-form-field">
                      <label>Offer Letter</label>
                      <input type="file" name="offer_letter" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                    </div>
                    <div className="cu-form-field">
                      <label>Aadhar Card</label>
                      <input type="file" name="aadhar_card" onChange={handleFileChange} accept=".pdf,image/*" />
                    </div>
                    <div className="cu-form-field">
                      <label>PAN Card</label>
                      <input type="file" name="pan_card" onChange={handleFileChange} accept=".pdf,image/*" />
                    </div>
                    <div className="cu-form-field">
                      <label>Address Proof</label>
                      <input type="file" name="address_proof" onChange={handleFileChange} accept=".pdf,image/*" />
                    </div>
                    <div className="cu-form-field">
                      <label>Education Certificate</label>
                      <input type="file" name="education_certificate" onChange={handleFileChange} accept=".pdf,image/*" />
                    </div>
                    <div className="cu-form-field">
                      <label>Experience Certificate</label>
                      <input type="file" name="experience_certificate" onChange={handleFileChange} accept=".pdf,image/*" />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: Emergency details */}
              {wizardStep === 5 && (
                <div className="cu-form-grid" style={{ gridTemplateColumns: "1fr" }}>
                  <div className="cu-form-field" style={{ maxWidth: 400 }}>
                    <label>Emergency Contact Name</label>
                    <input
                      name="emergency_name"
                      value={form.emergency_name}
                      onChange={handleChange}
                      placeholder="Contact person's full name"
                    />
                  </div>
                  <div className="cu-form-field" style={{ maxWidth: 400 }}>
                    <label>Emergency Contact Number</label>
                    <input
                      name="emergency_number"
                      value={form.emergency_number}
                      onChange={handleChange}
                      placeholder="+91999990000"
                    />
                  </div>
                  <div className="cu-form-field">
                    <label>Onboarding Notes / Medical Details</label>
                    <textarea
                      name="notes"
                      rows={4}
                      value={form.notes}
                      onChange={handleChange}
                      placeholder="Add any medical alerts, allergies, or other onboarding notes"
                    />
                  </div>
                </div>
              )}

              {/* STEP 7: Set Accessibility Permissions */}
              {wizardStep === 6 && (
                <div>
                  <div className="permissions-header" style={{ marginTop: 0 }}>
                    <h4 className="permissions-title">Configure Accessibility Permissions</h4>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button type="button" className="btn secondary text" style={{ fontSize: 12, padding: "4px 8px" }} onClick={handleSelectAll}>
                        Select All
                      </button>
                      <button type="button" className="btn secondary text" style={{ fontSize: 12, padding: "4px 8px" }} onClick={handleClearAll}>
                        Clear All
                      </button>
                    </div>
                  </div>

                  <div className="permissions-grid">
                    {filteredSchema.map(mod => {
                      const modObj = permissions[mod.key] || {};
                      const allChecked = mod.pages.every(p => modObj[p.key] === true);
                      const isActive = isModuleCardActive(mod.key);

                      return (
                        <div key={mod.key} className={`module-card ${isActive ? "active" : ""}`}>
                          <div className="module-header">
                            <div className="module-title-wrapper">
                              <span className="module-icon">{mod.icon}</span>
                              <span className="module-title">{mod.label}</span>
                            </div>
                            <div className={`custom-checkbox ${allChecked ? "checked" : ""}`} onClick={() => toggleModule(mod.key)} />
                          </div>
                          <div className="module-desc">{mod.description}</div>
                          <div className="subpages-list">
                            {mod.pages.map(p => (
                              <div key={p.key} className="subpage-item" onClick={() => togglePage(mod.key, p.key)}>
                                <div className={`custom-checkbox ${modObj[p.key] === true ? "checked" : ""}`} />
                                <span>{p.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* Stepper Navigation Buttons */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: 20, marginTop: 24 }}>
              {wizardStep > 0 ? (
                <button type="button" className="btn ghost" onClick={handleBack}>
                  Back
                </button>
              ) : (
                <div />
              )}
              
              <div style={{ display: "flex", gap: 12 }}>
                {wizardStep < onboardingSteps.length - 1 ? (
                  <button type="button" className="btn primary" onClick={handleNext}>
                    Next Step
                  </button>
                ) : (
                  <button type="button" className="btn primary" onClick={handleSubmit} disabled={saving}>
                    {saving ? "Processing Onboarding..." : "✨ Onboard HR User"}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      ) : null}

      {/* ─── SCENARIO B: ACTIVE DIRECTORY DIRECTORY TABLE ─── */}
      {!showOnboardWizard && (
        <div className="cu-card" style={{ overflowX: "auto" }}>
          <div className="cu-card-header">
            <h3 className="cu-card-title">👥 Active Directory</h3>
            {!showOnboardWizard && (
              <button
                type="button"
                className="btn primary"
                style={{ fontSize: 13, padding: "8px 18px" }}
                onClick={() => {
                  setShowOnboardWizard(true);
                  setWizardStep(0);
                }}
              >
                + Onboard HR User
              </button>
            )}
          </div>

          {loading ? (
            <p className="muted-text">Fetching active members list...</p>
          ) : (
            <div className="responsive-table-container">
              <table className="table" style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
                <thead>
                <tr style={{ textAlign: "left", borderBottom: "2px solid #f1f5f9" }}>
                  <th style={{ padding: "12px 8px" }}>Name</th>
                  <th style={{ padding: "12px 8px" }}>Email</th>
                  <th style={{ padding: "12px 8px" }}>Phone / ID</th>
                  <th style={{ padding: "12px 8px" }}>Access Permissions Summary</th>
                  <th style={{ padding: "12px 8px" }}>Onboarded</th>
                  <th style={{ padding: "12px 8px" }}>Status Controls</th>
                  <th style={{ padding: "12px 8px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map((companyUser) => (
                  <tr key={companyUser.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "14px 8px", fontWeight: 550, color: "#1e293b" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {companyUser.profile_photo ? (
                          <img src={companyUser.profile_photo} alt="" style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>👤</div>
                        )}
                        <div>
                          {`${companyUser.first_name || ""} ${companyUser.last_name || ""}`.trim() || companyUser.username}
                          <div style={{ fontSize: "10px", color: "#64748b" }}>Role: {ROLE_LABELS[companyUser.role] || companyUser.role}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 8px" }}>{companyUser.email}</td>
                    <td style={{ padding: "14px 8px", fontSize: "12px" }}>
                      {companyUser.phone && <div>📞 {companyUser.phone}</div>}
                      {companyUser.employee_id && <div style={{ fontWeight: "600", color: "#6366f1" }}>🪪 {companyUser.employee_id}</div>}
                      {!companyUser.phone && !companyUser.employee_id && <span style={{ color: "#94a3b8" }}>—</span>}
                    </td>
                    <td style={{ padding: "14px 8px", maxWidth: 280 }}>{renderPermissionBadges(companyUser)}</td>
                    <td style={{ padding: "14px 8px", color: "#64748b", fontSize: 12 }}>
                      {formatDate(companyUser.date_joined)}
                      {companyUser.last_login && (
                        <div style={{ fontSize: "10px", color: "#0f766e", marginTop: "4px" }}>
                          Last login: {new Date(companyUser.last_login).toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "14px 8px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {companyUser.role === "HR" ? (
                          <button
                            type="button"
                            onClick={() => handleToggleActive(companyUser)}
                            className={`cu-badge-pill`}
                            style={{
                              cursor: "pointer",
                              background: companyUser.is_active ? "#dcfce7" : "#fee2e2",
                              color: companyUser.is_active ? "#15803d" : "#b91c1c",
                              borderColor: companyUser.is_active ? "#bbf7d0" : "#fecaca",
                              justifyContent: "center",
                              width: "fit-content"
                            }}
                          >
                            {companyUser.is_active ? "● Active" : "○ Inactive"}
                          </button>
                        ) : (
                          <span className="cu-badge-pill" style={{ background: "#f1f5f9", color: "#475569", width: "fit-content" }}>● Active</span>
                        )}

                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          {companyUser.is_locked ? (
                            <>
                              <span className="cu-badge-pill" style={{ background: "#fef3c7", color: "#b45309", borderColor: "#fde68a" }}>🔒 Locked</span>
                              {companyUser.role === "HR" && (
                                <button
                                  type="button"
                                  onClick={() => handleUnlockUser(companyUser)}
                                  style={{ background: "#3b82f6", color: "white", border: "none", borderRadius: "4px", padding: "2px 6px", fontSize: "10px", fontWeight: "bold", cursor: "pointer" }}
                                >
                                  Unlock
                                </button>
                              )}
                            </>
                          ) : (
                            <span className="muted-text" style={{ fontSize: "11px", color: "#64748b" }}>
                              Attempts: {companyUser.failed_attempts || 0}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 8px", textAlign: "right" }}>
                      {companyUser.role === "HR" && (
                        <div style={{ display: "inline-flex", gap: 6 }}>
                          <button type="button" className="btn secondary" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => handleStartEdit(companyUser)}>
                            🔧 Edit Profile
                          </button>
                          <button type="button" className="btn danger" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => handleDeleteClick(companyUser.id)}>
                            🗑️
                          </button>
                        </div>
                      )}
                      {companyUser.role === "ADMIN" && (
                        <span className="muted-text" style={{ fontSize: 12 }}>Protected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
          {!loading && sortedUsers.length === 0 && (
            <p className="muted-text" style={{ padding: "20px 0", textAlign: "center" }}>
              No Admin or HR user accounts found.
            </p>
          )}
        </div>
      )}

      {/* ─── EDIT MODAL OVERLAY ─── */}
      {editingUser && (
        <div className="cu-modal-overlay">
          <div className="cu-modal-container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, borderBottom: "1px solid #f1f5f9", paddingBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, color: "#0f172a", fontWeight: 700 }}>
                Adjust HR User Onboarding & Access Rights
              </h3>
              <button type="button" className="btn secondary text" style={{ fontSize: 20 }} onClick={handleCancelEdit}>
                ✕
              </button>
            </div>

            {/* Premium Tabbed Navigation inside Edit Modal */}
            <div className="modal-tabs">
              <button type="button" className={`modal-tab-btn ${editTab === "personal" ? "active" : ""}`} onClick={() => setEditTab("personal")}>
                👤 Personal & Job Info
              </button>
              <button type="button" className={`modal-tab-btn ${editTab === "salary" ? "active" : ""}`} onClick={() => setEditTab("salary")}>
                💰 Salary & Compliance
              </button>
              <button type="button" className={`modal-tab-btn ${editTab === "emergency" ? "active" : ""}`} onClick={() => setEditTab("emergency")}>
                📁 Documents & Emergency
              </button>
              <button type="button" className={`modal-tab-btn ${editTab === "permissions" ? "active" : ""}`} onClick={() => setEditTab("permissions")}>
                🔒 Access Permissions
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              
              {/* TAB 1: Personal & Job Info */}
              {editTab === "personal" && (
                <div>
                  <h4 style={{ margin: "0 0 16px 0", color: "#1e293b" }}>Personal Information</h4>
                  <div className="cu-form-grid" style={{ marginBottom: 28 }}>
                    <div className="cu-form-field">
                      <label>First Name *</label>
                      <input
                        name="first_name"
                        value={editForm.first_name}
                        onChange={handleEditChange}
                        placeholder="First name"
                        required
                      />
                    </div>
                    <div className="cu-form-field">
                      <label>Last Name *</label>
                      <input
                        name="last_name"
                        value={editForm.last_name}
                        onChange={handleEditChange}
                        placeholder="Last name"
                        required
                      />
                    </div>
                    <div className="cu-form-field">
                      <label>Email Address (Immutable)</label>
                      <input
                        name="email"
                        type="email"
                        value={editForm.email}
                        disabled
                        style={{ background: "#f1f5f9", color: "#64748b", cursor: "not-allowed" }}
                      />
                    </div>
                    <div className="cu-form-field">
                      <label>Phone Number</label>
                      <input
                        name="phone"
                        value={editForm.phone}
                        onChange={handleEditChange}
                        placeholder="+91999999999"
                      />
                    </div>
                    <div className="cu-form-field">
                      <label>Date of Birth</label>
                      <input
                        name="dob"
                        type="date"
                        value={editForm.dob}
                        onChange={handleEditChange}
                      />
                    </div>
                    <div className="cu-form-field">
                      <label>Gender</label>
                      <select name="gender" value={editForm.gender} onChange={handleEditChange}>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="cu-form-field">
                      <label>Blood Group</label>
                      <select
                        name="blood_group"
                        value={editForm.blood_group || ""}
                        onChange={handleEditChange}
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
                    <div className="cu-form-field">
                      <label>Nationality</label>
                      <input
                        name="nationality"
                        value={editForm.nationality}
                        onChange={handleEditChange}
                        placeholder="Indian"
                      />
                    </div>
                    <div className="cu-form-field" style={{ gridColumn: "1 / -1" }}>
                      <label>Address</label>
                      <textarea
                        name="address"
                        rows={2}
                        value={editForm.address}
                        onChange={handleEditChange}
                      />
                    </div>
                  </div>

                  <h4 style={{ margin: "24px 0 16px 0", color: "#1e293b" }}>Job Information</h4>
                  <div className="cu-form-grid">
                    <div className="cu-form-field">
                      <label>Employee ID (Immutable)</label>
                      <input
                        name="employee_id"
                        value={editForm.employee_id}
                        disabled
                        style={{ background: "#f1f5f9", color: "#64748b", cursor: "not-allowed" }}
                      />
                    </div>
                    <div className="cu-form-field">
                      <label>Designation *</label>
                      <input
                        name="designation"
                        value={editForm.designation}
                        onChange={handleEditChange}
                        placeholder="HR Executive"
                        required
                      />
                    </div>
                    <div className="cu-form-field">
                      <label>Department</label>
                      <select
                        name="department"
                        value={editForm.department}
                        onChange={handleEditChange}
                      >
                        <option value="">Select Department</option>
                        {customDepartments.map((dept, i) => (
                          <option key={i} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                    <div className="cu-form-field">
                      <label>Employment Type</label>
                      <select
                        name="employment_type"
                        value={editForm.employment_type}
                        onChange={handleEditChange}
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Intern">Intern</option>
                      </select>
                    </div>
                    <div className="cu-form-field">
                      <label>Joining Date</label>
                      <input
                        name="joining_date"
                        type="date"
                        value={editForm.joining_date}
                        onChange={handleEditChange}
                      />
                    </div>
                    <div className="cu-form-field">
                      <label>Work Location</label>
                      <input
                        name="work_location"
                        value={editForm.work_location}
                        onChange={handleEditChange}
                        placeholder="Head Office"
                      />
                    </div>
                    <div className="cu-form-field">
                      <label>Reporting Manager</label>
                      <input
                        name="reporting_manager"
                        value={editForm.reporting_manager}
                        onChange={handleEditChange}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="cu-form-field" style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "8px", marginTop: "24px" }}>
                      <input
                        type="checkbox"
                        id="is_active"
                        name="is_active"
                        checked={editForm.is_active}
                        onChange={handleEditChange}
                        style={{ width: "18px", height: "18px", cursor: "pointer" }}
                      />
                      <label htmlFor="is_active" style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b", cursor: "pointer", userSelect: "none" }}>
                        Account Status: Active
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Salary Structure & Compliance */}
              {editTab === "salary" && (
                <div>
                  <h4 style={{ margin: "0 0 16px 0", color: "#1e293b" }}>Salary Structure</h4>
                  <div className="salary-step-wrapper" style={{ marginBottom: 28 }}>
                    <div className="responsive-table-container">
                      <table className="payroll-table" style={{ minWidth: "600px", width: "100%" }}>
                        <thead>
                        <tr>
                          <th style={{ width: "45%" }}>Salary Component</th>
                          <th style={{ width: "27.5%", textAlign: "right" }}>Monthly Amount (₹)</th>
                          <th style={{ width: "27.5%", textAlign: "right" }}>Yearly Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bold-row"><td colSpan="3">Earnings (A)</td></tr>
                        <tr>
                          <td>Basic *</td>
                          <td><input type="number" value={editSalary.basic} onChange={(e) => handleEditSalaryChange("basic", e.target.value)} step="0.01" min="0" /></td>
                          <td>{formatINR(yearlyAmount(editSalary.basic))}</td>
                        </tr>
                        <tr>
                          <td>DA</td>
                          <td><input type="number" value={editSalary.da} onChange={(e) => handleEditSalaryChange("da", e.target.value)} step="0.01" min="0" /></td>
                          <td>{formatINR(yearlyAmount(editSalary.da))}</td>
                        </tr>
                        <tr>
                          <td>HRA</td>
                          <td><input type="number" value={editSalary.hra} onChange={(e) => handleEditSalaryChange("hra", e.target.value)} step="0.01" min="0" /></td>
                          <td>{formatINR(yearlyAmount(editSalary.hra))}</td>
                        </tr>
                        <tr>
                          <td>Conveyance</td>
                          <td><input type="number" value={editSalary.conveyance} onChange={(e) => handleEditSalaryChange("conveyance", e.target.value)} step="0.01" min="0" /></td>
                          <td>{formatINR(yearlyAmount(editSalary.conveyance))}</td>
                        </tr>
                        <tr>
                          <td>Medical Allowance</td>
                          <td><input type="number" value={editSalary.medical} onChange={(e) => handleEditSalaryChange("medical", e.target.value)} step="0.01" min="0" /></td>
                          <td>{formatINR(yearlyAmount(editSalary.medical))}</td>
                        </tr>
                        <tr>
                          <td>Special Allowance</td>
                          <td><input type="number" value={editSalary.special_allowance} onChange={(e) => handleEditSalaryChange("special_allowance", e.target.value)} step="0.01" min="0" /></td>
                          <td>{formatINR(yearlyAmount(editSalary.special_allowance))}</td>
                        </tr>

                        <tr className="bold-row summary-gross">
                          <td>Gross Salary (A)</td>
                          <td>{formatINR(editPayroll.gross)}</td>
                          <td>{formatINR(yearlyAmount(editPayroll.gross))}</td>
                        </tr>

                        <tr className="bold-row"><td colSpan="3">Deductions (B)</td></tr>
                        <tr>
                          <td>Employee PF</td>
                          <td><input type="number" value={editSalary.employee_pf} onChange={(e) => handleEditSalaryChange("employee_pf", e.target.value)} step="0.01" min="0" /></td>
                          <td>{formatINR(yearlyAmount(editSalary.employee_pf))}</td>
                        </tr>
                        <tr>
                          <td>Professional Tax</td>
                          <td><input type="number" value={editSalary.professional_tax} onChange={(e) => handleEditSalaryChange("professional_tax", e.target.value)} step="0.01" min="0" /></td>
                          <td>{formatINR(yearlyAmount(editSalary.professional_tax))}</td>
                        </tr>
                        <tr>
                          <td>Employee ESI</td>
                          <td><input type="number" value={editSalary.employee_esi} onChange={(e) => handleEditSalaryChange("employee_esi", e.target.value)} step="0.01" min="0" /></td>
                          <td>{formatINR(yearlyAmount(editSalary.employee_esi))}</td>
                        </tr>
                        <tr>
                          <td>TDS</td>
                          <td><input type="number" value={editSalary.tds} onChange={(e) => handleEditSalaryChange("tds", e.target.value)} step="0.01" min="0" /></td>
                          <td>{formatINR(yearlyAmount(editSalary.tds))}</td>
                        </tr>
                        <tr>
                          <td>Medical Insurance</td>
                          <td><input type="number" value={editSalary.medical_insurance} onChange={(e) => handleEditSalaryChange("medical_insurance", e.target.value)} step="0.01" min="0" /></td>
                          <td>{formatINR(yearlyAmount(editSalary.medical_insurance))}</td>
                        </tr>

                        <tr className="bold-row summary-deduction">
                          <td>Total Deductions (B)</td>
                          <td>{formatINR(editPayroll.totalDeductions)}</td>
                          <td>{formatINR(yearlyAmount(editPayroll.totalDeductions))}</td>
                        </tr>

                        <tr className="bold-row summary-net">
                          <td>Net Salary (A - B)</td>
                          <td>{formatINR(editPayroll.netSalary)}</td>
                          <td>{formatINR(yearlyAmount(editPayroll.netSalary))}</td>
                        </tr>

                        <tr className="bold-row"><td colSpan="3">Employer Contributions</td></tr>
                        <tr>
                          <td>Employer PF</td>
                          <td><input type="number" value={editSalary.employer_pf} onChange={(e) => handleEditSalaryChange("employer_pf", e.target.value)} step="0.01" min="0" /></td>
                          <td>{formatINR(yearlyAmount(editSalary.employer_pf))}</td>
                        </tr>
                        <tr>
                          <td>Employer ESI</td>
                          <td><input type="number" value={editSalary.employer_esi} onChange={(e) => handleEditSalaryChange("employer_esi", e.target.value)} step="0.01" min="0" /></td>
                          <td>{formatINR(yearlyAmount(editSalary.employer_esi))}</td>
                        </tr>
                        <tr>
                          <td>Gratuity</td>
                          <td><input type="number" value={editSalary.gratuity} onChange={(e) => handleEditSalaryChange("gratuity", e.target.value)} step="0.01" min="0" /></td>
                          <td>{formatINR(yearlyAmount(editSalary.gratuity))}</td>
                        </tr>

                        <tr className="bold-row summary-ctc">
                          <td>CTC (Gross + Contributions)</td>
                          <td>{formatINR(editPayroll.ctc)}</td>
                          <td>{formatINR(yearlyAmount(editPayroll.ctc))}</td>
                        </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <h4 style={{ margin: "24px 0 16px 0", color: "#1e293b" }}>Compliance & Statutory</h4>
                  <div className="cu-form-grid">
                    <div className="cu-form-field">
                      <label>Bank Name</label>
                      <input
                        name="bank_name"
                        value={editForm.bank_name}
                        onChange={handleEditChange}
                        placeholder="HDFC Bank"
                      />
                    </div>
                    <div className="cu-form-field">
                      <label>Account Number</label>
                      <input
                        name="account_number"
                        value={editForm.account_number}
                        onChange={handleEditChange}
                        placeholder="5010023456789"
                      />
                    </div>
                    <div className="cu-form-field">
                      <label>IFSC Code</label>
                      <input
                        name="ifsc"
                        value={editForm.ifsc}
                        onChange={handleEditChange}
                        placeholder="HDFC0001234"
                      />
                    </div>
                    <div className="cu-form-field">
                      <label>PAN Number</label>
                      <input
                        name="pan"
                        value={editForm.pan}
                        onChange={handleEditChange}
                        placeholder="ABCDE1234F"
                      />
                    </div>
                    {editForm.pf_applicable && (
                      <div className="cu-form-field">
                        <label>PF Number</label>
                        <input
                          name="pf_number"
                          value={editForm.pf_number}
                          onChange={handleEditChange}
                        />
                      </div>
                    )}
                    <div className="cu-form-field">
                      <label>UAN Number</label>
                      <input
                        name="uan_number"
                        value={editForm.uan_number}
                        onChange={handleEditChange}
                      />
                    </div>
                    {editForm.esi_applicable && (
                      <div className="cu-form-field">
                        <label>ESI Number</label>
                        <input
                          name="esi_number"
                          value={editForm.esi_number}
                          onChange={handleEditChange}
                        />
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginTop: 12 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: "600" }}>
                      <input type="checkbox" name="pf_applicable" checked={editForm.pf_applicable} onChange={handleEditChange} style={{ width: 16, height: 16 }} />
                      PF Applicable
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: "600" }}>
                      <input type="checkbox" name="esi_applicable" checked={editForm.esi_applicable} onChange={handleEditChange} style={{ width: 16, height: 16 }} />
                      ESI Applicable
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 3: Documents & Emergency */}
              {editTab === "emergency" && (
                <div>
                  <h4 style={{ margin: "0 0 16px 0", color: "#1e293b" }}>Documents Checklist</h4>
                  
                  {/* Show existing files if they exist */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 24 }}>
                    {["profile_photo", "resume", "offer_letter", "aadhar_card", "pan_card", "address_proof", "education_certificate", "experience_certificate"].map((fileKey) => {
                      const fileUrl = editingUser[fileKey];
                      return (
                        <div key={fileKey} style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                          <span style={{ fontSize: 11, color: "#64748b", fontWeight: "600", display: "block", textTransform: "capitalize" }}>
                            {fileKey.replace("_", " ")}
                          </span>
                          {fileUrl ? (
                            <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#4f46e5", fontWeight: "600", textDecoration: "none" }}>
                              📄 View Uploaded File
                            </a>
                          ) : (
                            <span style={{ fontSize: 12, color: "#94a3b8" }}>No document uploaded</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="cu-form-grid" style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #cbd5e1", marginBottom: 24 }}>
                    <div className="cu-form-field">
                      <label>Update Profile Photo</label>
                      <input type="file" name="profile_photo" onChange={handleEditFileChange} accept="image/*" />
                    </div>
                    <div className="cu-form-field">
                      <label>Update Resume</label>
                      <input type="file" name="resume" onChange={handleEditFileChange} accept=".pdf,.doc,.docx" />
                    </div>
                    <div className="cu-form-field">
                      <label>Update Offer Letter</label>
                      <input type="file" name="offer_letter" onChange={handleEditFileChange} accept=".pdf,.doc,.docx" />
                    </div>
                    <div className="cu-form-field">
                      <label>Update Aadhar Card</label>
                      <input type="file" name="aadhar_card" onChange={handleEditFileChange} accept=".pdf,image/*" />
                    </div>
                    <div className="cu-form-field">
                      <label>Update PAN Card</label>
                      <input type="file" name="pan_card" onChange={handleEditFileChange} accept=".pdf,image/*" />
                    </div>
                    <div className="cu-form-field">
                      <label>Update Address Proof</label>
                      <input type="file" name="address_proof" onChange={handleEditFileChange} accept=".pdf,image/*" />
                    </div>
                    <div className="cu-form-field">
                      <label>Update Education Certificate</label>
                      <input type="file" name="education_certificate" onChange={handleEditFileChange} accept=".pdf,image/*" />
                    </div>
                    <div className="cu-form-field">
                      <label>Update Experience Certificate</label>
                      <input type="file" name="experience_certificate" onChange={handleEditFileChange} accept=".pdf,image/*" />
                    </div>
                  </div>

                  <h4 style={{ margin: "24px 0 16px 0", color: "#1e293b" }}>Emergency Details</h4>
                  <div className="cu-form-grid">
                    <div className="cu-form-field">
                      <label>Emergency Contact Name</label>
                      <input
                        name="emergency_name"
                        value={editForm.emergency_name}
                        onChange={handleEditChange}
                        placeholder="Contact person name"
                      />
                    </div>
                    <div className="cu-form-field">
                      <label>Emergency Contact Number</label>
                      <input
                        name="emergency_number"
                        value={editForm.emergency_number}
                        onChange={handleEditChange}
                        placeholder="+91999990000"
                      />
                    </div>
                    <div className="cu-form-field" style={{ gridColumn: "1 / -1" }}>
                      <label>Onboarding Notes</label>
                      <textarea
                        name="notes"
                        rows={3}
                        value={editForm.notes}
                        onChange={handleEditChange}
                        placeholder="Add medical/onboarding notes"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Accessibility Permissions */}
              {editTab === "permissions" && (
                <div>
                  <div className="permissions-header" style={{ marginTop: 0 }}>
                    <h4 className="permissions-title">Configure Page Access Rights</h4>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button type="button" className="btn secondary text" style={{ fontSize: 12, padding: "4px 8px" }} onClick={handleSelectAll}>
                        Select All
                      </button>
                      <button type="button" className="btn secondary text" style={{ fontSize: 12, padding: "4px 8px" }} onClick={handleClearAll}>
                        Clear All
                      </button>
                    </div>
                  </div>

                  <div className="permissions-grid">
                    {filteredSchema.map(mod => {
                      const modObj = permissions[mod.key] || {};
                      const allChecked = mod.pages.every(p => modObj[p.key] === true);
                      const isActive = isModuleCardActive(mod.key);

                      return (
                        <div key={mod.key} className={`module-card ${isActive ? "active" : ""}`}>
                          <div className="module-header">
                            <div className="module-title-wrapper">
                              <span className="module-icon">{mod.icon}</span>
                              <span className="module-title">{mod.label}</span>
                            </div>
                            <div className={`custom-checkbox ${allChecked ? "checked" : ""}`} onClick={() => toggleModule(mod.key)} />
                          </div>
                          <div className="module-desc">{mod.description}</div>
                          <div className="subpages-list">
                            {mod.pages.map(p => (
                              <div key={p.key} className="subpage-item" onClick={() => togglePage(mod.key, p.key)}>
                                <div className={`custom-checkbox ${modObj[p.key] === true ? "checked" : ""}`} />
                                <span>{p.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Actions Footer inside Edit Modal */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: 20, marginTop: 24 }}>
                <button type="button" className="btn danger" style={{ background: "#fef2f2", color: "#b91c1c", border: "1px solid #fee2e2" }} onClick={() => handleDeleteClick(editingUser.id)}>
                  🗑️ Terminate HR Account
                </button>
                <div style={{ display: "flex", gap: 12 }}>
                  <button type="button" className="btn secondary" onClick={handleCancelEdit}>
                    Cancel
                  </button>
                  <button type="submit" className="btn primary" disabled={saving}>
                    {saving ? "Saving adjustments..." : "Save Adjustments"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
