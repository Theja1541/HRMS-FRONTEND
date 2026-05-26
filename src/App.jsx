import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

/* Auth */
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import Unauthorized from "./pages/auth/Unauthorized";

/* Layouts */
import Layout from "./components/common/Layout";
import EmployeeLayout from "./pages/employee-portal/EmployeeLayout";

/* Auth Pages */
import Login from "./pages/auth/Login";
import ChangePassword from "./pages/auth/ChangePassword";

/* Context */
import { EmployeesProvider } from "./context/EmployeesContext";

/* Admin / HR Pages */
import Dashboard from "./pages/dashboard/Dashboard";
import Employees from "./pages/employees/Employees";
import AddEmployee from "./pages/employees/AddEmployee";
import EmployeeProfile from "./pages/employees/EmployeeProfile";
import Attendance from "./pages/attendance/Attendance";
import MonthlyAttendance from "./pages/attendance/MonthlyAttendance";
import Leaves from "./pages/leaves/Leaves";
import LeaveApproval from "./pages/leaves/LeavesApprovals";
import LeaveRejected from "./pages/leaves/LeaveRejected";
import LeaveHistory from "./pages/leaves/LeaveHistory";
import LeaveSettings from "./pages/leaves/LeaveSettings";
import Payroll from "./pages/payroll/Payroll";
import EmailDashboard from "./pages/payroll/EmailDashboard";
import SalaryEditor from "./pages/payroll/SalaryEditor";
import { PayrollProvider } from "./context/PayrollContext";

/* Employee Pages */
import EmployeeDashboard from "./pages/employee-portal/EmployeeDashboard";
// import MyAttendance from "./pages/employee-portal/MyAttendance";
import EmployeeAttendance from "./pages/employee-portal/EmployeeAttendance";
import ApplyLeave from "./pages/employee-portal/ApplyLeave";
import MyLeaves from "./pages/employee-portal/MyLeaves";
import MyProfile from "./pages/employee-portal/MyProfile";
import MyDocuments from "./pages/employee-portal/MyDocuments";
import MyPayslips from "./pages/employee-portal/MyPayslips";
import MyLeaveBalance from "./pages/employee-portal/MyLeaveBalance";
import SalaryGrowthTimeline from "./pages/employee-portal/SalaryGrowthTimeline";
import MySalary from "./pages/employee-portal/MySalary";
import Settings from "./pages/auth/Settings";

/* Super Admin (uses same Layout + Sidebar as Admin, variant="superadmin") */
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import ManageUsers from "./pages/superadmin/ManageUsers";
import CreateUser from "./pages/superadmin/CreateUser";
import Companies from "./pages/superadmin/Companies";
import Billing from "./pages/superadmin/Billing";
import CompanyDetail from "./pages/superadmin/CompanyDetail";
import CompanyEmployees from "./pages/superadmin/CompanyEmployees";
import CompanyPayroll from "./pages/superadmin/CompanyPayroll";
import AuditLogs from "./pages/superadmin/AuditLogs";
import SendNotification from "./pages/superadmin/SendNotification";
import SystemSettings from "./pages/superadmin/SystemSettings";
import Reports from "./pages/superadmin/Reports";
import SupportTickets from "./pages/superadmin/SupportTickets";

import ErrorBoundary from "./components/common/ErrorBoundary";

import { ToastProvider } from "./context/ToastContext";
import { getEffectiveSystemSettings } from "./api/superadmin";

import PayrollSummary from "./pages/payroll/PayrollSummary";
import AddSalaryRevision from "./pages/payroll/AddSalaryRevision";
import SalaryPaymentSummary from "./pages/payroll/SalaryPaymentSummary";
import LeaveDashboard from "./pages/leaves/LeaveDashboard";
import LeaveCalendar from "./pages/leaves/LeaveCalendar";
import AssetReturnManagement from "./pages/assets/AssetReturnManagement";
import AssetManagement from "./pages/assets/AssetManagement";
import MyAssetReturns from "./pages/employee-portal/MyAssetReturns";
import Support from "./pages/support/Support";
import CompanyUsers from "./pages/CompanyUsers";
import Notifications from "./pages/notifications/Notifications";
import HolidayList from "./pages/holidays/HolidayList";
import HolidayCalendar from "./pages/holidays/HolidayCalendar";
import HolidayCreate from "./pages/holidays/HolidayCreate";

/* Daybook / Finance */
import DaybookDashboard from "./modules/daybook/pages/Dashboard";
import DaybookTransactions from "./modules/daybook/pages/Transactions";
import DaybookTransactionForm from "./modules/daybook/pages/TransactionForm";
import DaybookVendors from "./modules/daybook/pages/Vendors";
import DaybookCategories from "./modules/daybook/pages/Categories";
import DaybookReports from "./modules/daybook/pages/Reports";
import DaybookInvoiceView from "./modules/daybook/pages/DaybookInvoiceView";

function ModuleRoute({ module, children }) {
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getEffectiveSystemSettings()
      .then((res) => {
        if (!cancelled) {
          setAllowed(res.data?.features?.[module] !== false);
        }
      })
      .catch(() => {
        if (!cancelled) setAllowed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [module]);

  if (allowed === null) return null;
  if (!allowed) return <Navigate to="/dashboard" replace />;
  return children;
}

// export default function App() {
//   return (
//     <AuthProvider>
//       <Routes>

//         {/* PUBLIC */}
//         <Route path="/login" element={<Login />} />
//         <Route path="/unauthorized" element={<Unauthorized />} />

//         <Route
//           path="/change-password"
//           element={
//             <ProtectedRoute allowedRoles={["SUPER_ADMIN","ADMIN","HR","EMPLOYEE"]}>
//               <ChangePassword />
//             </ProtectedRoute>
//           }
//         />

//         {/* SUPER ADMIN */}
//         <Route
//           path="/super-admin"
//           element={
//             <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
//               <SuperAdminLayout />
//             </ProtectedRoute>
//           }
//         >
//           <Route index element={<SuperAdminDashboard />} />
//           <Route path="dashboard" element={<SuperAdminDashboard />} />
//           <Route path="create-user" element={<CreateUser />} />
//           <Route path="manage-users" element={<ManageUsers />} />
//           <Route path="settings" element={<SystemSettings />} />
//           <Route path="reports" element={<Reports />} />
//         </Route>

//         {/* ADMIN / HR */}
//         <Route
//           path="/"
//           element={
//             <ProtectedRoute allowedRoles={["SUPER_ADMIN","ADMIN","HR"]}>
//               <EmployeesProvider>
//                 <ErrorBoundary>
//                   <Layout />
//                 </ErrorBoundary>
//               </EmployeesProvider>
//             </ProtectedRoute>
//           }
//         >
//           <Route index element={<Navigate to="dashboard" replace />} />
//           <Route path="dashboard" element={<Dashboard />} />

//           {/* Employees */}
//           <Route path="employees" element={<Employees />} />
//           <Route path="employees/add" element={<AddEmployee />} />
//           <Route path="employees/edit/:id" element={<AddEmployee />} />
//           <Route path="employees/:id" element={<EmployeeProfile />} />

//           {/* Attendance */}
//           <Route path="attendance" element={<Attendance />} />
//           <Route path="monthly" element={<MonthlyAttendance />} />

//           {/* Leaves */}
//           <Route path="leaves" element={<Leaves />} />
//           <Route path="approvals" element={<LeaveApproval />} />
//           <Route path="rejected" element={<LeaveRejected />} />
//           <Route path="history" element={<LeaveHistory />} />

//           {/* Payroll */}
//           <Route path="payroll" element={<Payroll />} />
//           <Route path="salary" element={<SalaryEditor />} />
//           <Route path="full-final" element={<Payroll />} />

//           {/* Email */}
//           <Route path="email-dashboard" element={<EmailDashboard />} />
//         </Route>

//         {/* EMPLOYEE PORTAL */}
//         <Route
//           path="/employee"
//           element={
//             <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
//               <EmployeeLayout />
//             </ProtectedRoute>
//           }
//         >
//           <Route index element={<Navigate to="dashboard" replace />} />
//           <Route path="dashboard" element={<EmployeeDashboard />} />
//           {/* <Route path="attendance" element={<MyAttendance />} /> */}
//           <Route path="attendance" element={<EmployeeAttendance />} />
//           <Route path="apply-leave" element={<ApplyLeave />} />
//           <Route path="my-leaves" element={<MyLeaves />} />
//           <Route path="my-payslips" element={<MyPayslips />} />  {/* ADD THIS */}
//           <Route path="profile" element={<MyProfile />} />
//           <Route path="my-documents" element={<MyDocuments />} />
//         </Route>

//         <Route path="*" element={<Navigate to="/login" replace />} />
//       </Routes>
//     </AuthProvider>
//   );
// }


export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Routes>

          {/* PUBLIC */}
          <Route path="/login" element={<Login />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* <Route
            path="/change-password"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN","ADMIN","HR","EMPLOYEE"]}>
                <ChangePassword />
              </ProtectedRoute>
            }
          /> */}

          {/* SUPER ADMIN – same Layout as Admin, different sidebar menu */}
          <Route
            path="/super-admin"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                <Layout sidebarVariant="superadmin" />
              </ProtectedRoute>
            }
          >
            <Route index element={<SuperAdminDashboard />} />
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="companies" element={<Companies />} />
            <Route path="companies/:id" element={<CompanyDetail />} />
            <Route path="companies/:id/employees" element={<CompanyEmployees />} />
            <Route path="companies/:id/payroll" element={<CompanyPayroll />} />
            <Route path="create-user" element={<CreateUser />} />
            <Route path="manage-users" element={<ManageUsers />} />
            <Route path="audit" element={<AuditLogs />} />
            <Route path="notifications" element={<SendNotification />} />
            <Route path="billing" element={<Billing />} />
            <Route path="settings" element={<SystemSettings />} />
            <Route path="reports" element={<Reports />} />
            <Route path="support" element={<SupportTickets />} />
          </Route>

          {/* ADMIN / HR / FINANCE */}
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={["ADMIN","HR","FINANCE_ADMIN"]}>
                <EmployeesProvider>
                  <PayrollProvider>
                    <ErrorBoundary>
                      <Layout />
                    </ErrorBoundary>
                  </PayrollProvider>
                </EmployeesProvider>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Employees */}
            <Route path="employees" element={<Employees />} />
            <Route path="employees/add" element={<AddEmployee />} />
            <Route path="employees/edit/:id" element={<AddEmployee />} />
            <Route path="employees/:id" element={<EmployeeProfile />} />

            {/* Attendance */}
            <Route path="attendance" element={<ModuleRoute module="attendance"><Attendance /></ModuleRoute>} />
            <Route path="monthly" element={<ModuleRoute module="attendance"><MonthlyAttendance /></ModuleRoute>} />

            {/* Leaves */}
            <Route path="leave-dashboard" element={<ModuleRoute module="leave"><LeaveDashboard /></ModuleRoute>} />
            <Route path="leave-calendar" element={<ModuleRoute module="leave"><LeaveCalendar /></ModuleRoute>} />
            <Route path="leaves" element={<ModuleRoute module="leave"><Leaves /></ModuleRoute>} />
            <Route path="approvals" element={<ModuleRoute module="leave"><LeaveApproval /></ModuleRoute>} />
            <Route path="rejected" element={<ModuleRoute module="leave"><LeaveRejected /></ModuleRoute>} />
            <Route path="history" element={<ModuleRoute module="leave"><LeaveHistory /></ModuleRoute>} />
            <Route path="leave-settings" element={<ModuleRoute module="leave"><LeaveSettings /></ModuleRoute>} />

            {/* Payroll */}
            <Route path="payroll" element={<ModuleRoute module="payroll"><Payroll /></ModuleRoute>} />
            {/* <Route path="payroll/salary-structure" element={<SalaryStructure />} /> */}
            {/* <Route path="salary" element={<SalaryStructure />} /> */}
            <Route path="payroll-summary" element={<ModuleRoute module="payroll"><PayrollSummary /></ModuleRoute>} />
            <Route path="salary-payment-summary" element={<ModuleRoute module="payroll"><SalaryPaymentSummary /></ModuleRoute>} />
            <Route path="payroll/full-final" element={<ModuleRoute module="payroll"><Payroll /></ModuleRoute>} />
            <Route path="employees/:id/salary-revision" element={<ModuleRoute module="payroll"><AddSalaryRevision /></ModuleRoute>}/>

            {/* Email */}
            <Route path="email-dashboard" element={<ModuleRoute module="payroll"><EmailDashboard /></ModuleRoute>} />
            
            {/* Assets */}
            <Route path="assets" element={<ModuleRoute module="assets"><AssetManagement /></ModuleRoute>} />
            <Route path="asset-returns" element={<ModuleRoute module="assets"><AssetReturnManagement /></ModuleRoute>} />

            {/* Support */}
            <Route path="support" element={<ModuleRoute module="support"><Support /></ModuleRoute>} />

            {/* Company users */}
            <Route path="company-users" element={<CompanyUsers />} />

            {/* Notifications */}
            <Route path="notifications" element={<ModuleRoute module="notifications"><Notifications /></ModuleRoute>} />

            {/* Holidays */}
            <Route path="holidays" element={<HolidayList />} />
            <Route path="holidays/calendar" element={<HolidayCalendar />} />
            <Route path="holidays/new" element={<HolidayCreate />} />
            <Route path="holidays/:id" element={<HolidayCreate />} />

            {/* Daybook / Finance */}
            <Route path="daybook" element={<Navigate to="dashboard" replace />} />
            <Route path="daybook/dashboard" element={<ModuleRoute module="daybook"><DaybookDashboard /></ModuleRoute>} />
            <Route path="daybook/transactions" element={<ModuleRoute module="daybook"><DaybookTransactions /></ModuleRoute>} />
            <Route path="daybook/transactions/add" element={<ModuleRoute module="daybook"><DaybookTransactionForm /></ModuleRoute>} />
            <Route path="daybook/transactions/edit/:id" element={<ModuleRoute module="daybook"><DaybookTransactionForm /></ModuleRoute>} />
            <Route path="daybook/transactions/invoice/:id" element={<ModuleRoute module="daybook"><DaybookInvoiceView /></ModuleRoute>} />
            <Route path="daybook/vendors" element={<ModuleRoute module="daybook"><DaybookVendors /></ModuleRoute>} />
            <Route path="daybook/categories" element={<ModuleRoute module="daybook"><DaybookCategories /></ModuleRoute>} />
            <Route path="daybook/reports" element={<ModuleRoute module="daybook"><DaybookReports /></ModuleRoute>} />

            {/* Settings */}
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* EMPLOYEE PORTAL */}
          <Route
            path="/employee"
            element={
              <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
                <EmployeeLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<EmployeeDashboard />} />
            <Route path="attendance" element={<ModuleRoute module="attendance"><EmployeeAttendance /></ModuleRoute>} />
            <Route path="apply-leave" element={<ModuleRoute module="leave"><ApplyLeave /></ModuleRoute>} />
            <Route path="my-leaves" element={<ModuleRoute module="leave"><MyLeaves /></ModuleRoute>} />
            <Route path="leave-balance" element={<ModuleRoute module="leave"><MyLeaveBalance /></ModuleRoute>} />
            <Route path="my-payslips" element={<ModuleRoute module="payroll"><MyPayslips /></ModuleRoute>} />
            <Route path="my-salary" element={<ModuleRoute module="payroll"><MySalary /></ModuleRoute>} />
            <Route path="/employee/salary-timeline" element={<ModuleRoute module="payroll"><SalaryGrowthTimeline /></ModuleRoute>} />
            <Route path="profile" element={<MyProfile />} />
            <Route path="my-documents" element={<MyDocuments />} />
            <Route path="asset-returns" element={<ModuleRoute module="assets"><MyAssetReturns /></ModuleRoute>} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<div style={{ padding: 40, textAlign: "center" }}><h2>404 - Page Not Found</h2><p>The page you are looking for does not exist.</p></div>} />
        </Routes>
      </AuthProvider>
    </ToastProvider>
  );
}
