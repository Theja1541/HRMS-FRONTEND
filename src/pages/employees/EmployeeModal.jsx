// import { useEffect } from "react";
// import { useEmployees } from "../../context/EmployeesContext";
// import EmployeeStepForm from "./EmployeeStepForm";
// import "../../styles/modal.css";

// export default function EmployeeModal({ employee, onClose }) {
//   const {
//     addEmployee,
//     updateEmployee,
//   } = useEmployees();

//   /* ================= HANDLERS ================= */

//   const handleSave = (data) => {
//     if (employee) {
//       updateEmployee(employee.id, data);
//     } else {
//       addEmployee(data);
//     }
//     onClose();
//   };

//   /* ================= ESC CLOSE ================= */

//   useEffect(() => {
//     const esc = (e) => {
//       if (e.key === "Escape") onClose();
//     };
//     window.addEventListener("keydown", esc);
//     return () => window.removeEventListener("keydown", esc);
//   }, [onClose]);

//   /* ================= RENDER ================= */

//   return (
//     <div className="modal-overlay">
//       <div className="modal-card large">
//         {/* HEADER */}
//         <div className="modal-header">
//           <h3>
//             {employee ? "Edit Employee" : "Add New Employee"}
//           </h3>
//           <button className="modal-close" onClick={onClose}>
//             ✕
//           </button>
//         </div>

//         {/* BODY */}
//         <div className="modal-body">
//           <EmployeeStepForm
//             initialData={employee}
//             onSubmit={handleSave}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }
