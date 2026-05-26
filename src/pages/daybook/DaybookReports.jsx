import { useState } from "react";
import { getVendorPaymentsReport, getExpenseSummaryReport, getGSTTransactionsReport, getMonthlyReport } from "../../api/daybook";
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import "../../styles/daybook.css";

export default function DaybookReports() {
  const [reportType, setReportType] = useState("summary");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  });

  const exportToExcel = () => {
    try {
      let excelData = [];
      
      if (reportType === "summary" && reportData) {
        excelData = reportData.category_wise?.map(item => ({
          'Category': item.category__name,
          'Type': item.category__category_type,
          'Debit': item.total_debit || 0,
          'Credit': item.total_credit || 0
        })) || [];
      } else if (reportType === "gst" && reportData) {
        excelData = reportData.map(txn => {
          const isDebit = txn.debit_amount > 0;
          return {
            'Date': new Date(txn.date).toLocaleDateString('en-IN'),
            'Details': txn.details || '',
            'Vendor': isDebit ? (txn.to_vendor_name || '-') : (txn.from_vendor_name || '-'),
            'Type': isDebit ? 'Debit' : 'Credit',
            'Amount': isDebit ? txn.debit_amount : txn.credit_amount,
            'GST Amount': txn.gst_amount
          };
        });
      }
      
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, reportType === "summary" ? 'Summary' : 'GST Report');
      XLSX.writeFile(workbook, `${reportType}_report_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export. Please try again.');
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text(`${reportType === "summary" ? 'Financial Summary' : 'GST Transactions'} Report`, 14, 20);
      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 14, 28);
      
      if (reportType === "summary" && reportData) {
        doc.text(`Period: ${filters.month}/${filters.year}`, 14, 35);
        doc.text(`Total Credit: Rs ${Number(reportData.total_credit).toLocaleString('en-IN')}`, 14, 42);
        doc.text(`Total Debit: Rs ${Number(reportData.total_debit).toLocaleString('en-IN')}`, 14, 49);
        doc.text(`Balance: Rs ${Number(reportData.balance).toLocaleString('en-IN')}`, 14, 56);
        
        const tableData = reportData.category_wise?.map(item => [
          item.category__name,
          item.category__category_type,
          `Rs ${Number(item.total_debit || 0).toLocaleString('en-IN')}`,
          `Rs ${Number(item.total_credit || 0).toLocaleString('en-IN')}`
        ]) || [];
        
        autoTable(doc, {
          startY: 63,
          head: [['Category', 'Type', 'Debit', 'Credit']],
          body: tableData,
          theme: 'grid',
          styles: { fontSize: 9, cellPadding: 3 },
          headStyles: { fillColor: [41, 128, 185], textColor: 255 }
        });
      } else if (reportType === "gst" && reportData) {
        const tableData = reportData.map(txn => {
          const isDebit = txn.debit_amount > 0;
          return [
            new Date(txn.date).toLocaleDateString('en-IN'),
            txn.details || '',
            isDebit ? (txn.to_vendor_name || '-') : (txn.from_vendor_name || '-'),
            isDebit ? 'Debit' : 'Credit',
            `Rs ${Number(isDebit ? txn.debit_amount : txn.credit_amount).toLocaleString('en-IN')}`,
            `Rs ${Number(txn.gst_amount).toLocaleString('en-IN')}`
          ];
        });
        
        autoTable(doc, {
          startY: 35,
          head: [['Date', 'Details', 'Vendor', 'Type', 'Amount', 'GST Amount']],
          body: tableData,
          theme: 'grid',
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [41, 128, 185], textColor: 255 }
        });
      }
      
      doc.save(`${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF export error:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  const fetchReport = async () => {
    if (!filters.year || !filters.month) {
      alert('Please select year and month');
      return;
    }
    setLoading(true);
    try {
      let res;
      if (reportType === "summary") {
        console.log('Fetching monthly report:', { year: filters.year, month: filters.month });
        res = await getMonthlyReport({ year: filters.year, month: filters.month });
      } else if (reportType === "gst") {
        console.log('Fetching GST report:', { start_date: filters.start_date, end_date: filters.end_date });
        res = await getGSTTransactionsReport({ start_date: filters.start_date, end_date: filters.end_date });
      }
      console.log('Report data:', res.data);
      setReportData(res.data);
    } catch (error) {
      console.error("Error fetching report:", error);
      alert("Failed to fetch report: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <h1>Daybook Reports</h1>
      </div>

      <div className="report-controls">
        <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
          <option value="summary">Financial Summary</option>
          <option value="gst">GST Report</option>
        </select>

        {reportType === "summary" ? (
          <>
            <input
              type="number"
              placeholder="Year"
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
            />
            <input
              type="number"
              placeholder="Month"
              min="1"
              max="12"
              value={filters.month}
              onChange={(e) => setFilters({ ...filters, month: e.target.value })}
            />
          </>
        ) : (
          <>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
            />
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
            />
          </>
        )}

        <button className="btn-primary" onClick={fetchReport}>
          Generate Report
        </button>
        {reportData && (
          <>
            <button className="btn-secondary" onClick={exportToExcel}>📊 Export Excel</button>
            <button className="btn-secondary" onClick={exportToPDF}>📄 Export PDF</button>
          </>
        )}
      </div>

      {loading && <div className="loading">Loading...</div>}

      {reportData && (
        <div className="report-results">
          {reportType === "summary" && reportData && (
            <div className="monthly-report">
              <h2>Financial Summary - {filters.month}/{filters.year}</h2>
              <div className="summary-cards">
                <div className="summary-card credit">
                  <h3>Total Credit</h3>
                  <p className="subtitle">Money In</p>
                  <p>₹{Number(reportData.total_credit).toLocaleString('en-IN')}</p>
                </div>
                <div className="summary-card debit">
                  <h3>Total Debit</h3>
                  <p className="subtitle">Money Out</p>
                  <p>₹{Number(reportData.total_debit).toLocaleString('en-IN')}</p>
                </div>
                <div className="summary-card balance">
                  <h3>Balance</h3>
                  <p>₹{Number(reportData.balance).toLocaleString('en-IN')}</p>
                </div>
                <div className="summary-card">
                  <h3>Transactions</h3>
                  <p>{reportData.transaction_count}</p>
                </div>
              </div>
              <h3>Category-wise Breakdown</h3>
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Debit</th>
                    <th>Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.category_wise?.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.category__name}</td>
                      <td>{item.category__category_type}</td>
                      <td className="debit-amount">₹{Number(item.total_debit || 0).toLocaleString('en-IN')}</td>
                      <td className="credit-amount">₹{Number(item.total_credit || 0).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {reportType === "gst" && reportData && (
            <div className="gst-transactions-report">
              <h2>GST Transactions Report</h2>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Details</th>
                    <th>Vendor</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>GST Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((txn) => {
                    const isDebit = txn.debit_amount > 0;
                    const amount = isDebit ? txn.debit_amount : txn.credit_amount;
                    const vendor = isDebit ? txn.to_vendor_name : txn.from_vendor_name;
                    
                    return (
                      <tr key={txn.id}>
                        <td>{new Date(txn.date).toLocaleDateString('en-IN')}</td>
                        <td>{txn.details}</td>
                        <td>{vendor || '-'}</td>
                        <td>
                          <span className={`badge ${isDebit ? 'debit' : 'credit'}`}>
                            {isDebit ? 'Debit' : 'Credit'}
                          </span>
                        </td>
                        <td>₹{Number(amount).toLocaleString('en-IN')}</td>
                        <td>₹{Number(txn.gst_amount).toLocaleString('en-IN')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
