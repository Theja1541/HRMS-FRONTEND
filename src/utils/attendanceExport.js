import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ======================
   EXCEL EXPORT
====================== */
export function exportAttendanceExcel({
  title,
  month,
  columns,
  rows,
}) {
  const worksheet = XLSX.utils.aoa_to_sheet([
    [title],
    [`Month: ${month}`],
    [],
    columns,
    ...rows,
  ]);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

  XLSX.writeFile(workbook, `${title}_${month}.xlsx`);
}

/* ======================
   PDF EXPORT
====================== */
export function exportAttendancePDF({
  title,
  month,
  columns,
  rows,
}) {
  const doc = new jsPDF("landscape");

  doc.setFontSize(14);
  doc.text(title, 14, 14);

  doc.setFontSize(10);
  doc.text(`Month: ${month}`, 14, 22);

  autoTable(doc, {
    startY: 28,
    head: [columns],
    body: rows,
    styles: { fontSize: 8 },
    headStyles: {
      fillColor: [22, 163, 74], // GREEN – matches Present
      textColor: 255,
    },
  });

  doc.save(`${title}_${month}.pdf`);
}
