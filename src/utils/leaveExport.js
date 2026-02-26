import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ================================
   EXPORT LEAVES TO EXCEL
================================ */
export function exportLeavesToExcel(leaves, fileName = "Leaves_Report") {
  const data = leaves.map(l => ({
    Employee: l.employeeName,
    From: l.fromDate,
    To: l.toDate,
    Type: l.type,
    Reason: l.reason,
    Status: l.status,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Leaves");

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

/* ================================
   EXPORT LEAVES TO PDF
================================ */
export function exportLeavesToPDF(leaves, title = "Leaves Report") {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(title, 14, 18);

  const tableData = leaves.map(l => ([
    l.employeeName,
    l.fromDate,
    l.toDate,
    l.type,
    l.status,
  ]));

  autoTable(doc, {
    startY: 26,
    head: [["Employee", "From", "To", "Type", "Status"]],
    body: tableData,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [37, 99, 235] },
  });

  doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
}
