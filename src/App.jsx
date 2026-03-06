import { Routes, Route, Navigate } from "react-router-dom";

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

/* Super Admin */
import SuperAdminLayout from "./components/superadmin/SuperAdminLayout";
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import ManageUsers from "./pages/superadmin/ManageUsers";
import CreateUser from "./pages/superadmin/CreateUser";
import SystemSettings from "./pages/superadmin/SystemSettings";
import Reports from "./pages/superadmin/Reports";

import ErrorBoundary from "./components/common/ErrorBoundary";

import { ToastProvider } from "./context/ToastContext";

import PayrollSummary from "./pages/payroll/PayrollSummary";
import AddSalaryRevision from "./pages/payroll/AddSalaryRevision";

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

          {/* SUPER ADMIN */}
          <Route
            path="/super-admin"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                <SuperAdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<SuperAdminDashboard />} />
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="create-user" element={<CreateUser />} />
            <Route path="manage-users" element={<ManageUsers />} />
            <Route path="settings" element={<SystemSettings />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          {/* ADMIN / HR */}
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN","ADMIN","HR"]}>
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
            <Route path="attendance" element={<Attendance />} />
            <Route path="monthly" element={<MonthlyAttendance />} />

            {/* Leaves */}
            <Route path="leaves" element={<Leaves />} />
            <Route path="approvals" element={<LeaveApproval />} />
            <Route path="rejected" element={<LeaveRejected />} />
            <Route path="history" element={<LeaveHistory />} />

            {/* Payroll */}
            <Route path="payroll" element={<Payroll />} />
            {/* <Route path="payroll/salary-structure" element={<SalaryStructure />} /> */}
            {/* <Route path="salary" element={<SalaryStructure />} /> */}
            <Route path="payroll-summary" element={<PayrollSummary />} />
            <Route path="payroll/full-final" element={<Payroll />} />
            <Route path="employees/:id/salary-revision" element={<AddSalaryRevision />}/>

            {/* Email */}
            <Route path="email-dashboard" element={<EmailDashboard />} />
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
            <Route path="attendance" element={<EmployeeAttendance />} />
            <Route path="apply-leave" element={<ApplyLeave />} />
            <Route path="my-leaves" element={<MyLeaves />} />
            <Route path="leave-balance" element={<MyLeaveBalance />} />
            <Route path="my-payslips" element={<MyPayslips />} />
            <Route path="/employee/salary-timeline" element={<SalaryGrowthTimeline />} />
            <Route path="profile" element={<MyProfile />} />
            <Route path="my-documents" element={<MyDocuments />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </ToastProvider>
  );
}