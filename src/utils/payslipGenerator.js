import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function generatePayslipPDF({
  employee,
  payroll,
  month,
}) {
  const doc = new jsPDF();

  /* ===== HEADER ===== */
  doc.setFontSize(18);
  doc.text("Payslip", 14, 20);

  doc.setFontSize(11);
  doc.text(`Month: ${month}`, 14, 28);

  /* ===== EMPLOYEE DETAILS ===== */
  autoTable(doc, {
    startY: 35,
    theme: "grid",
    styles: { fontSize: 10 },
    head: [["Employee Details", ""]],
    body: [
      ["Employee Name", `${employee.firstName} ${employee.lastName}`],
      ["Employee ID", employee.employeeId],
      ["Department", employee.department || "-"],
      ["Designation", employee.designation || "-"],
    ],
  });

  /* ===== SALARY DETAILS ===== */
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 8,
    theme: "grid",
    styles: { fontSize: 10 },
    head: [["Salary Details", "Amount (₹)"]],
    body: [
      ["Gross Salary", payroll.gross.toFixed(2)],
      ["Paid Days", payroll.paidDays],
      ["Loss of Pay (LOP)", payroll.lop],
      ["Net Pay", payroll.netPay.toFixed(2)],
    ],
  });

  /* ===== FOOTER ===== */
  doc.setFontSize(10);
  doc.text(
    "This is a system generated payslip.",
    14,
    doc.internal.pageSize.height - 20
  );

  doc.save(
    `Payslip_${employee.employeeId}_${month}.pdf`
  );
}
