import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTransactions, deleteTransaction } from "../../api/daybook";
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import "../../styles/daybook.css";

export default function Transactions() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    search: "",
    payment_mode: "",
    category: "",
    vendor_type: ""
  });

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);



  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      if (filters.search) params.search = filters.search;
      if (filters.payment_mode) params.payment_mode = filters.payment_mode;
      if (filters.category) params.category = filters.category;

      const res = await getTransactions(params);
      setTransactions(res.data.results || res.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      alert("Error loading transactions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (txn) => {
    setSelectedTransaction(txn);
    setShowDetailsModal(true);
  };

  const exportToExcel = () => {
    try {
      if (!transactions || transactions.length === 0) {
        alert('No transactions to export');
        return;
      }

      const excelData = transactions.map(txn => {
        const isDebit = txn.debit_amount > 0;
        const vendorGstin = isDebit ? txn.to_vendor_gstin : txn.from_vendor_gstin;
        const baseAmount = isDebit ? txn.debit_amount : txn.credit_amount;
        const gstAmount = txn.gst_applicable ? txn.gst_amount : 0;
        const totalAmount = parseFloat(baseAmount) + parseFloat(gstAmount);
        
        return {
          'Date': new Date(txn.date).toLocaleDateString('en-IN'),
          'Time': new Date(txn.created_at).toLocaleTimeString('en-IN'),
          'Details': txn.details || '',
          'Vendor': isDebit ? (txn.to_vendor_name || '-') : (txn.from_vendor_name || '-'),
          'Vendor GSTIN': vendorGstin || '-',
          'Type': isDebit ? 'Debit' : 'Credit',
          'Base Amount': baseAmount,
          'GST Amount': gstAmount,
          'Total Amount': totalAmount,
          'Category': txn.category_name || '',
          'Payment Mode': txn.payment_mode || '',
          'Bank Name': txn.bank_name || '-',
          'Account Number': txn.account_number || '-',
          'IFSC Code': txn.ifsc_code || '-',
          'Account Holder': txn.account_holder_name || '-',
          'UPI ID': txn.upi_id || '-',
          'Cheque Number': txn.cheque_number || '-'
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      
      // Add company header
      XLSX.utils.sheet_add_aoa(worksheet, [['GMMC HRMS'], ['Transactions Report'], ['']], { origin: 'A1' });
      XLSX.utils.sheet_add_json(worksheet, excelData, { origin: 'A4', skipHeader: false });
      
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
      XLSX.writeFile(workbook, `transactions_${new Date().toISOString().split('T')[0]}.xlsx`);
      alert('Excel file downloaded successfully!');
    } catch (error) {
      console.error('Export error:', error);
      alert(`Failed to export: ${error.message}`);
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF('l', 'mm', 'a4');
      
      // Company header
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text('GMMC HRMS', 148, 10, { align: 'center' });
      doc.setFontSize(16);
      doc.text('Transactions Report', 148, 17, { align: 'center' });
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 148, 23, { align: 'center' });
      
      const tableData = transactions.map(txn => {
        const isDebit = txn.debit_amount > 0;
        const vendorGstin = isDebit ? txn.to_vendor_gstin : txn.from_vendor_gstin;
        const baseAmount = isDebit ? txn.debit_amount : txn.credit_amount;
        const gstAmount = txn.gst_applicable ? txn.gst_amount : 0;
        const totalAmount = parseFloat(baseAmount) + parseFloat(gstAmount);
        
        return [
          new Date(txn.date).toLocaleDateString('en-IN'),
          (txn.details || '').substring(0, 15),
          isDebit ? (txn.to_vendor_name || '-') : (txn.from_vendor_name || '-'),
          isDebit ? 'DR' : 'CR',
          txn.payment_mode || '',
          txn.bank_name || '-',
          txn.account_number || '-',
          txn.ifsc_code || '-',
          txn.upi_id || '-',
          txn.cheque_number || '-',
          `${Number(baseAmount).toLocaleString('en-IN')}`,
          `${Number(gstAmount).toLocaleString('en-IN')}`,
          `${Number(totalAmount).toLocaleString('en-IN')}`
        ];
      });
      
      autoTable(doc, {
        startY: 28,
        head: [['Date', 'Details', 'Vendor', 'Type', 'Mode', 'Bank', 'A/C', 'IFSC', 'UPI', 'Cheque', 'Base', 'GST', 'Total']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 6, cellPadding: 0.8 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontSize: 6.5 },
        columnStyles: {
          0: { cellWidth: 18 },
          1: { cellWidth: 22 },
          2: { cellWidth: 22 },
          3: { cellWidth: 12 },
          4: { cellWidth: 14 },
          5: { cellWidth: 20 },
          6: { cellWidth: 20 },
          7: { cellWidth: 16 },
          8: { cellWidth: 20 },
          9: { cellWidth: 18 },
          10: { cellWidth: 18 },
          11: { cellWidth: 16 },
          12: { cellWidth: 18 }
        }
      });
      
      doc.save(`transactions_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF export error:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  const downloadReceipt = (txn) => {
    try {
      const doc = new jsPDF();
      const isDebit = txn.debit_amount > 0;
      const amount = isDebit ? txn.debit_amount : txn.credit_amount;
      const vendorGstin = isDebit ? txn.to_vendor_gstin : txn.from_vendor_gstin;
      const gstAmount = txn.gst_applicable ? txn.gst_amount : 0;
      const totalAmount = Number(amount) + Number(gstAmount);
      
      // Professional Header
      doc.setFillColor(41, 128, 185);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont(undefined, 'bold');
      doc.text('GMMC HRMS', 105, 18, { align: 'center' });
      doc.setFontSize(14);
      doc.text('TRANSACTION RECEIPT', 105, 28, { align: 'center' });
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Receipt #${txn.id} | ${new Date().toLocaleDateString('en-IN')}`, 105, 35, { align: 'center' });
      
      doc.setTextColor(0, 0, 0);
      let y = 55;
      doc.setFontSize(11);
      
      // Transaction Info
      doc.setFont(undefined, 'bold');
      doc.text('Transaction Information', 20, y);
      doc.setFont(undefined, 'normal');
      y += 8;
      doc.text(`Date: ${new Date(txn.date).toLocaleDateString('en-IN')}`, 25, y);
      y += 6;
      doc.text(`Time: ${new Date(txn.created_at).toLocaleTimeString('en-IN')}`, 25, y);
      y += 6;
      doc.text(`Type: ${isDebit ? 'Debit (Payment)' : 'Credit (Receipt)'}`, 25, y);
      y += 6;
      doc.text(`Category: ${txn.category_name}`, 25, y);
      y += 10;
      
      // Vendor Info
      const vendor = isDebit ? txn.to_vendor_name : txn.from_vendor_name;
      if (vendor) {
        doc.setFont(undefined, 'bold');
        doc.text('Vendor Information', 20, y);
        doc.setFont(undefined, 'normal');
        y += 8;
        doc.text(`Name: ${vendor}`, 25, y);
        y += 6;
        if (vendorGstin) {
          doc.text(`GSTIN: ${vendorGstin}`, 25, y);
          y += 6;
        }
        y += 4;
      }
      
      // Payment Details
      doc.setFont(undefined, 'bold');
      doc.text('Payment Details', 20, y);
      doc.setFont(undefined, 'normal');
      y += 8;
      doc.text(`Mode: ${txn.payment_mode}`, 25, y);
      y += 6;
      
      if (txn.payment_mode === 'BANK' && txn.bank_name) {
        doc.text(`Bank: ${txn.bank_name}`, 25, y);
        y += 6;
        if (txn.account_number) doc.text(`Account: ${txn.account_number}`, 25, y), y += 6;
        if (txn.ifsc_code) doc.text(`IFSC: ${txn.ifsc_code}`, 25, y), y += 6;
        if (txn.account_holder_name) doc.text(`Holder: ${txn.account_holder_name}`, 25, y), y += 6;
      }
      
      if (txn.payment_mode === 'UPI' && txn.upi_id) {
        doc.text(`UPI ID: ${txn.upi_id}`, 25, y);
        y += 6;
      }
      
      if (txn.payment_mode === 'CHEQUE' && txn.cheque_number) {
        doc.text(`Cheque No: ${txn.cheque_number}`, 25, y);
        y += 6;
        if (txn.bank_name) doc.text(`Bank: ${txn.bank_name}`, 25, y), y += 6;
      }
      y += 4;
      
      // Transaction Details
      doc.setFont(undefined, 'bold');
      doc.text('Description', 20, y);
      doc.setFont(undefined, 'normal');
      y += 8;
      const splitDetails = doc.splitTextToSize(txn.details, 170);
      doc.text(splitDetails, 25, y);
      y += splitDetails.length * 6 + 10;
      
      // Amount Summary Box
      doc.setDrawColor(41, 128, 185);
      doc.setLineWidth(0.5);
      doc.rect(20, y, 170, txn.gst_applicable ? 30 : 20);
      y += 8;
      
      doc.setFontSize(12);
      doc.text('Base Amount:', 25, y);
      doc.text(`₹${Number(amount).toLocaleString('en-IN')}`, 185, y, { align: 'right' });
      y += 8;
      
      if (txn.gst_applicable) {
        doc.text('GST Amount:', 25, y);
        doc.text(`₹${Number(gstAmount).toLocaleString('en-IN')}`, 185, y, { align: 'right' });
        y += 8;
      }
      
      doc.setFont(undefined, 'bold');
      doc.setFontSize(14);
      doc.text('Total Amount:', 25, y);
      doc.text(`₹${totalAmount.toLocaleString('en-IN')}`, 185, y, { align: 'right' });
      
      // Footer
      doc.setFontSize(9);
      doc.setFont(undefined, 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text('This is a computer-generated receipt and does not require a signature.', 105, 280, { align: 'center' });
      
      doc.save(`receipt_${txn.id}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Receipt download error:', error);
      alert('Failed to download receipt');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await deleteTransaction(id);
        alert("Transaction deleted successfully");
        fetchTransactions(); // Refresh the list
      } catch (error) {
        console.error("Error deleting transaction:", error);
        alert("Failed to delete transaction");
      }
    }
  };

  return (
    <div className="transactions-page">
      <div className="page-header">
        <h1>Transactions</h1>
        <div className="header-actions">
          <button className="btn-secondary" onClick={exportToExcel}>📊 Export Excel</button>
          <button className="btn-secondary" onClick={exportToPDF}>📄 Export PDF</button>
          <button className="btn-primary" onClick={() => navigate("/daybook/add-transaction")}>
            + Add Transaction
          </button>
        </div>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search details..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <input
          type="date"
          placeholder="Start Date"
          value={filters.start_date}
          onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
        />
        <input
          type="date"
          placeholder="End Date"
          value={filters.end_date}
          onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
        />
        <select
          value={filters.payment_mode}
          onChange={(e) => setFilters({ ...filters, payment_mode: e.target.value })}
        >
          <option value="">All Payment Modes</option>
          <option value="CASH">Cash</option>
          <option value="BANK">Bank</option>
          <option value="UPI">UPI</option>
          <option value="CHEQUE">Cheque</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Details</th>
              <th>Vendor</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Payment Mode</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => {
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
                      {isDebit ? '💸 Debit' : '💰 Credit'}
                    </span>
                  </td>
                  <td className={isDebit ? 'debit-amount' : 'credit-amount'}>
                    ₹{Number(amount).toLocaleString('en-IN')}
                  </td>
                  <td>{txn.category_name}</td>
                  <td>{txn.payment_mode}</td>
                  <td>
                    <button className="btn-view" onClick={() => handleViewDetails(txn)}>View</button>
                    <button className="btn-edit" onClick={() => navigate(`/daybook/edit-transaction/${txn.id}`)}>Edit</button>
                    <button className="btn-secondary" onClick={() => downloadReceipt(txn)}>📄 Receipt</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {showDetailsModal && selectedTransaction && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content transaction-details" onClick={(e) => e.stopPropagation()}>
            <h2>Transaction Details</h2>
            <div className="details-grid">
              <div className="detail-item">
                <label>Date:</label>
                <span>{new Date(selectedTransaction.date).toLocaleDateString('en-IN')}</span>
              </div>
              <div className="detail-item">
                <label>Type:</label>
                <span className={`badge ${selectedTransaction.debit_amount > 0 ? 'debit' : 'credit'}`}>
                  {selectedTransaction.debit_amount > 0 ? 'Debit' : 'Credit'}
                </span>
              </div>
              <div className="detail-item">
                <label>Base Amount:</label>
                <span className="amount-large">₹{Number(selectedTransaction.debit_amount > 0 ? selectedTransaction.debit_amount : selectedTransaction.credit_amount).toLocaleString('en-IN')}</span>
              </div>
              {selectedTransaction.gst_applicable && (
                <>
                  <div className="detail-item">
                    <label>GST Amount:</label>
                    <span>₹{Number(selectedTransaction.gst_amount).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="detail-item">
                    <label>Total Amount:</label>
                    <span className="amount-large" style={{fontWeight: 'bold', color: '#2c3e50'}}>₹{(Number(selectedTransaction.debit_amount > 0 ? selectedTransaction.debit_amount : selectedTransaction.credit_amount) + Number(selectedTransaction.gst_amount)).toLocaleString('en-IN')}</span>
                  </div>
                </>
              )}
              <div className="detail-item">
                <label>Category:</label>
                <span>{selectedTransaction.category_name}</span>
              </div>
              <div className="detail-item">
                <label>Payment Mode:</label>
                <span>{selectedTransaction.payment_mode}</span>
              </div>
              <div className="detail-item">
                <label>Vendor:</label>
                <span>{selectedTransaction.debit_amount > 0 ? selectedTransaction.to_vendor_name : selectedTransaction.from_vendor_name || '-'}</span>
              </div>
              {(selectedTransaction.to_vendor_gstin || selectedTransaction.from_vendor_gstin) && (
                <div className="detail-item">
                  <label>Vendor GSTIN:</label>
                  <span>{selectedTransaction.debit_amount > 0 ? selectedTransaction.to_vendor_gstin : selectedTransaction.from_vendor_gstin}</span>
                </div>
              )}
              <div className="detail-item full-width">
                <label>Details:</label>
                <span>{selectedTransaction.details}</span>
              </div>
              
              {selectedTransaction.payment_mode === 'BANK' && selectedTransaction.bank_name && (
                <>
                  <div className="detail-item">
                    <label>Bank Name:</label>
                    <span>{selectedTransaction.bank_name}</span>
                  </div>
                  {selectedTransaction.account_number && (
                    <div className="detail-item">
                      <label>Account Number:</label>
                      <span>{selectedTransaction.account_number}</span>
                    </div>
                  )}
                  {selectedTransaction.ifsc_code && (
                    <div className="detail-item">
                      <label>IFSC Code:</label>
                      <span>{selectedTransaction.ifsc_code}</span>
                    </div>
                  )}
                  {selectedTransaction.account_holder_name && (
                    <div className="detail-item">
                      <label>Account Holder:</label>
                      <span>{selectedTransaction.account_holder_name}</span>
                    </div>
                  )}
                </>
              )}
              
              {selectedTransaction.payment_mode === 'UPI' && selectedTransaction.upi_id && (
                <div className="detail-item">
                  <label>UPI ID:</label>
                  <span>{selectedTransaction.upi_id}</span>
                </div>
              )}
              
              {selectedTransaction.payment_mode === 'CHEQUE' && (
                <>
                  {selectedTransaction.cheque_number && (
                    <div className="detail-item">
                      <label>Cheque Number:</label>
                      <span>{selectedTransaction.cheque_number}</span>
                    </div>
                  )}
                  {selectedTransaction.bank_name && (
                    <div className="detail-item">
                      <label>Bank Name:</label>
                      <span>{selectedTransaction.bank_name}</span>
                    </div>
                  )}
                </>
              )}
              
              <div className="detail-item">
                <label>Created By:</label>
                <span>{selectedTransaction.created_by_name || '-'}</span>
              </div>
              <div className="detail-item">
                <label>Created At:</label>
                <span>{new Date(selectedTransaction.created_at).toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-primary" onClick={() => downloadReceipt(selectedTransaction)}>📄 Download Receipt</button>
              <button className="btn-secondary" onClick={() => setShowDetailsModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
