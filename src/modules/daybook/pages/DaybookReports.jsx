import { useState } from "react";
import { getVendorPaymentsReport, getExpenseSummaryReport, getGSTTransactionsReport, getMonthlyReport } from "../../../api/daybook";
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import "../../../styles/daybook.css";
import "../../../styles/employees.css";

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
    <div className="employees-page">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Daybook Reports</h2>
          <p className="page-subtitle">Analyze cash flows, financial summaries, and GST tax filings</p>
        </div>
      </div>

      {/* FILTER BAR / CONTROLS */}
      <div className="filter-bar">
        <select 
          className="filter-select" 
          value={reportType} 
          onChange={(e) => setReportType(e.target.value)}
          style={{ minWidth: '200px' }}
        >
          <option value="summary">Financial Summary</option>
          <option value="gst">GST Report</option>
        </select>

        {reportType === "summary" ? (
          <>
            <input
              type="number"
              className="search-input"
              placeholder="Year"
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              style={{ width: 'auto', minWidth: '120px' }}
            />
            <select
              className="filter-select"
              value={filters.month}
              onChange={(e) => setFilters({ ...filters, month: e.target.value })}
              style={{ minWidth: '150px' }}
            >
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          </>
        ) : (
          <>
            <input
              type="date"
              className="search-input"
              value={filters.start_date}
              onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
              style={{ width: 'auto', minWidth: '160px' }}
            />
            <input
              type="date"
              className="search-input"
              value={filters.end_date}
              onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
              style={{ width: 'auto', minWidth: '160px' }}
            />
          </>
        )}

        <button 
          className="add-employee-btn" 
          onClick={fetchReport}
          style={{ padding: '10px 24px', fontWeight: '600' }}
        >
          🔍 Generate Report
        </button>
        
        {reportData && (
          <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
            <button className="settings-btn" onClick={exportToExcel}>📊 Export Excel</button>
            <button className="deactivated-btn" onClick={exportToPDF}>📄 Export PDF</button>
          </div>
        )}
      </div>

      {loading && <div className="loading" style={{ fontSize: '16px', fontWeight: '500', color: '#64748b' }}>Loading report data...</div>}

      {reportData && !loading && (
        <div style={{ animation: 'fadeSlideIn 0.3s ease-out' }}>
          {reportType === "summary" && (
            <div className="monthly-report">
              <h2 style={{ margin: "0 0 20px 0", color: "#1e293b", fontSize: "18px", fontWeight: "600" }}>
                Financial Summary - {filters.month}/{filters.year}
              </h2>
              
              {/* Border-left Stat Widgets */}
              <div className="employee-stats" style={{ marginBottom: "30px" }}>
                <div className="stat-card" style={{ borderLeft: "4px solid #16a34a" }}>
                  <h4 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 6px 0' }}>
                    <span>Total Credit (Money In)</span>
                    <span style={{ fontSize: '18px' }}>💰</span>
                  </h4>
                  <p style={{ color: "#16a34a", fontSize: "24px", fontWeight: '700', margin: 0 }}>
                    ₹{Number(reportData.total_credit).toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="stat-card" style={{ borderLeft: "4px solid #dc2626" }}>
                  <h4 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 6px 0' }}>
                    <span>Total Debit (Money Out)</span>
                    <span style={{ fontSize: '18px' }}>💸</span>
                  </h4>
                  <p style={{ color: "#dc2626", fontSize: "24px", fontWeight: '700', margin: 0 }}>
                    ₹{Number(reportData.total_debit).toLocaleString('en-IN')}
                  </p>
                </div>
                {/* <div className="stat-card" style={{ borderLeft: "4px solid #2563eb" }}>
                  <h4 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 6px 0' }}>
                    <span>Net Balance</span>
                    <span style={{ fontSize: '18px' }}>⚖️</span>
                  </h4>
                  <p style={{ color: "#2563eb", fontSize: "24px", fontWeight: '700', margin: 0 }}>
                    ₹{Number(reportData.balance).toLocaleString('en-IN')}
                  </p>
                </div> */}
                <div className="stat-card" style={{ borderLeft: "4px solid #475569" }}>
                  <h4 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 6px 0' }}>
                    <span>Transactions Count</span>
                    <span style={{ fontSize: '18px' }}>📊</span>
                  </h4>
                  <p style={{ color: "#475569", fontSize: "24px", fontWeight: '700', margin: 0 }}>
                    {reportData.transaction_count}
                  </p>
                </div>
              </div>

              <h3 style={{ margin: "24px 0 16px 0", color: "#1e293b", fontSize: "16px", fontWeight: "600" }}>Category-wise Breakdown</h3>
              <div className="table-wrapper">
                <table className="employees-table">
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
                        <td><strong>{item.category__name}</strong></td>
                        <td>
                          <span className={`badge ${item.category__category_type === 'INCOME' ? 'credit' : 'debit'}`}>
                            {item.category__category_type}
                          </span>
                        </td>
                        <td className="debit-amount">₹{Number(item.total_debit || 0).toLocaleString('en-IN')}</td>
                        <td className="credit-amount">₹{Number(item.total_credit || 0).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {reportType === "gst" && (
            <div className="gst-transactions-report">
              <h2 style={{ margin: "0 0 16px 0", color: "#1e293b", fontSize: "18px", fontWeight: "600" }}>
                GST Transactions Report
              </h2>
              <div className="table-wrapper">
                <table className="employees-table">
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
                          <td><strong>{new Date(txn.date).toLocaleDateString('en-IN')}</strong></td>
                          <td>{txn.details}</td>
                          <td>{vendor || '-'}</td>
                          <td>
                            <span className={`badge ${isDebit ? 'debit' : 'credit'}`}>
                              {isDebit ? '💸 Debit' : '💰 Credit'}
                            </span>
                          </td>
                          <td className={isDebit ? 'debit-amount' : 'credit-amount'}>
                            ₹{Number(amount).toLocaleString('en-IN')}
                          </td>
                          <td style={{ color: "#475569", fontWeight: "600" }}>
                            ₹{Number(txn.gst_amount).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
