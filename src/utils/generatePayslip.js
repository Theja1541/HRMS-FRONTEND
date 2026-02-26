import jsPDF from "jspdf";

export function generatePayslip({ employee, month, payroll }) {
  const doc = new jsPDF();

  /* ================= COMPANY HEADER ================= */

  // Company Name
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Genius Minds Making Code Pvt Ltd", 105, 18, {
    align: "center",
  });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Salary Payslip", 105, 25, { align: "center" });

  doc.line(14, 30, 196, 30);

  /* ================= EMPLOYEE DETAILS ================= */

  doc.setFontSize(11);
  doc.text(`Payslip Month : ${month}`, 14, 40);
  doc.text(`Employee Name : ${employee.name}`, 14, 48);
  doc.text(`Employee ID : ${employee.employeeId}`, 14, 56);

  doc.line(14, 62, 196, 62);

  /* ================= SALARY TABLE ================= */

  let y = 72;

  doc.setFont("helvetica", "bold");
  doc.text("Earnings", 14, y);
  doc.text("Amount (₹)", 90, y, { align: "right" });

  doc.text("Deductions", 120, y);
  doc.text("Amount (₹)", 196, y, { align: "right" });

  doc.line(14, y + 2, 196, y + 2);
  y += 10;

  doc.setFont("helvetica", "normal");

  const earnings = [
    ["Basic Salary", payroll.basic],
    ["HRA", payroll.hra],
    ["Allowances", payroll.allowances],
  ];

  const deductions = [
    ["PF", payroll.pf],
    ["ESI", payroll.esi],
    ["Professional Tax", payroll.professionalTax],
    ["Income Tax", payroll.incomeTax],
    ["LOP Deduction", payroll.lopDeduction],
  ];

  const rows = Math.max(earnings.length, deductions.length);

  for (let i = 0; i < rows; i++) {
    if (earnings[i]) {
      doc.text(earnings[i][0], 14, y);
      doc.text(
        `₹${earnings[i][1].toFixed(2)}`,
        90,
        y,
        { align: "right" }
      );
    }

    if (deductions[i]) {
      doc.text(deductions[i][0], 120, y);
      doc.text(
        `₹${deductions[i][1].toFixed(2)}`,
        196,
        y,
        { align: "right" }
      );
    }

    y += 8;
  }

  doc.line(14, y, 196, y);
  y += 10;

  /* ================= NET PAY ================= */

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(
    `Net Pay : ₹${payroll.netPay.toFixed(2)}`,
    14,
    y
  );

  /* ================= FOOTER ================= */

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    "This is a system generated payslip. No signature required.",
    105,
    280,
    { align: "center" }
  );

  doc.save(
    `Payslip_${employee.name}_${month}.pdf`
  );
}
