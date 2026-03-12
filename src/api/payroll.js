import api from "./axios";

/* ============================================================
   SALARY MANAGEMENT
============================================================ */

export const getAllSalaries = () =>
  api.get("/payroll/salary/all/");

export const setSalary = (data) =>
  api.post("/payroll/salary/set/", data);

export const updateSalary = (salaryId, data) =>
  api.put(`/payroll/salary/${salaryId}/update/`, data);

export const getSalaryByEmployee = (employeeId) =>
  api.get(`/payroll/salary/employee/${employeeId}/`);


/* ============================================================
   PAYSLIP GENERATION
============================================================ */

export const generatePayslip = (data) =>
  api.post("/payroll/payslip/generate/", data);

export const bulkGeneratePayslips = (month) =>
  api.post("/payroll/payslip/bulk-generate/", { month });

export const bulkApprovePayslips = (month) =>
  api.post("/payroll/payslip/bulk-approve/", { month });


/* ============================================================
   PAYSLIP STATUS ACTIONS
============================================================ */

export const approvePayslip = (payslipId) =>
  api.post(`/payroll/payslip/approve/${payslipId}/`);

export const markPayslipPaid = (payslipId) =>
  api.post(`/payroll/payslip/mark-paid/${payslipId}/`);

export const cancelPayslip = (payslipId) =>
  api.post(`/payroll/payslip/cancel/${payslipId}/`);


/* ============================================================
   PAYSLIP LISTING
============================================================ */

export const getMyPayslips = () =>
  api.get("/payroll/payslip/me/");

export const getAllPayslips = () =>
  api.get("/payroll/payslip/all/");

export const getPayrollStatus = (month, status = "ALL") =>
  api.get("/payroll/status/", {
    params: { month, status },
  });


/* ============================================================
   DOWNLOADS
============================================================ */

export const downloadPayslipPDF = (payslipId) =>
  api.get(`/payroll/payslip/pdf/${payslipId}/`, {
    responseType: "blob",
  });

export const downloadAllPayslipsZip = (month) =>
  api.get("/payroll/payslip/download-all/", {
    params: { month },
    responseType: "blob",
  });


/* ============================================================
   EMAIL SYSTEM
============================================================ */

export const sendSinglePayslipEmail = (employeeId, month) =>
  api.post("/payroll/payslip/email/single/", {
    employee_id: employeeId,
    month,
  });

export const bulkEmailPayslips = (month) =>
  api.post("/payroll/payslip/email/bulk/", { month });

export const getPayslipEmailLogs = (payslipId) =>
  api.get(`/payroll/payslip/${payslipId}/email-logs/`);

export const getEmailDashboard = () =>
  api.get("/payroll/email/dashboard/");


/* ============================================================
   PAYROLL CONTROL
============================================================ */

export const reopenPayrollMonth = (month) =>
  api.post("/payroll/reopen/", { month });

export const getPayrollDashboardSummary = (month) =>
  api.get("/payroll/dashboard-summary/", {
    params: { month },
  });


/* ============================================================
   FULL & FINAL SETTLEMENT
============================================================ */

export const generateFullFinal = (data) =>
  api.post("/payroll/full-final/generate/", data);


/* ============================================================
   EMPLOYEE VALIDATION
============================================================ */

export const checkEmployeeId = (employeeId) =>
  api.get("/employees/check-id/", {
    params: { employee_id: employeeId },
  });

export const getSalaryTimeline = (employeeId) =>
  api.get(`/payroll/salary-revisions/employee/${employeeId}/`);

export const exportSalaryBankFile = (month, year, companyAccount) =>
  api.get("/payroll/export-salary-bank-file/", {
    params: {
      month,
      year,
      company_account: companyAccount,
    },
    responseType: "blob",
  });