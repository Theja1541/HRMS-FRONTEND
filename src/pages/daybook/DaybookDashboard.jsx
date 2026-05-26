import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardSummary } from "../../api/daybook";
import { getVendors, getCategories, getTransactions } from "../../api/daybook";
import "../../styles/daybook.css";

export default function DaybookDashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [stats, setStats] = useState({ vendors: 0, categories: 0, transactions: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchSummary();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const fetchStats = async () => {
    try {
      const [vendorsRes, categoriesRes, transactionsRes] = await Promise.all([
        getVendors(),
        getCategories(),
        getTransactions({})
      ]);
      setStats({
        vendors: (vendorsRes.data.results || vendorsRes.data).length,
        categories: (categoriesRes.data.results || categoriesRes.data).length,
        transactions: (transactionsRes.data.results || transactionsRes.data).length
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await getDashboardSummary(dateRange);
      setSummary(res.data);
    } catch (error) {
      console.error("Error fetching summary:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (txn) => {
    setSelectedTransaction(txn);
    setShowDetailsModal(true);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="daybook-dashboard">
      <div className="page-header">
        <h1>Daybook Dashboard</h1>
        <div className="date-filter">
          <input
            type="date"
            value={dateRange.start_date}
            onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
          />
          <span>to</span>
          <input
            type="date"
            value={dateRange.end_date}
            onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
          />
        </div>
      </div>

      <div className="stats-cards">
        <div className="stat-card" onClick={() => navigate('/daybook/vendors')}>
          <div className="stat-icon">🏢</div>
          <div className="stat-info">
            <h3>{stats.vendors}</h3>
            <p>Total Vendors</p>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/daybook/categories')}>
          <div className="stat-icon">📁</div>
          <div className="stat-info">
            <h3>{stats.categories}</h3>
            <p>Total Categories</p>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/daybook/transactions')}>
          <div className="stat-icon">💳</div>
          <div className="stat-info">
            <h3>{stats.transactions}</h3>
            <p>Total Transactions</p>
          </div>
        </div>
      </div>

      <div className="summary-cards">
        <div className="summary-card credit">
          <h3>Total Credit</h3>
          <p className="subtitle">Money In</p>
          <p className="amount">₹{Number(summary?.total_credit || 0).toLocaleString('en-IN')}</p>
        </div>
        <div className="summary-card debit">
          <h3>Total Debit</h3>
          <p className="subtitle">Money Out</p>
          <p className="amount">₹{Number(summary?.total_debit || 0).toLocaleString('en-IN')}</p>
        </div>
        <div className="summary-card balance">
          <h3>Balance</h3>
          <p className="amount">₹{Number(summary?.balance || 0).toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="recent-transactions">
        <h2>Recent Transactions</h2>
        {summary?.recent_transactions && summary.recent_transactions.length > 0 ? (
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Details</th>
                <th>Vendor</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {summary.recent_transactions.map((txn) => {
                const isDebit = txn.debit_amount > 0;
                const amount = isDebit ? txn.debit_amount : txn.credit_amount;
                const vendor = isDebit ? txn.to_vendor_name : txn.from_vendor_name;
                
                return (
                  <tr key={txn.id}>
                    <td>{new Date(txn.date).toLocaleDateString('en-IN')}</td>
                    <td>{new Date(txn.created_at).toLocaleTimeString('en-IN', {hour: '2-digit', minute:'2-digit'})}</td>
                    <td>{txn.details}</td>
                    <td>{vendor || '-'}</td>
                    <td>
                      <span className={`badge ${isDebit ? 'debit' : 'credit'}`}>
                        {isDebit ? 'Debit' : 'Credit'}
                      </span>
                    </td>
                    <td className={isDebit ? 'debit-amount' : 'credit-amount'}>
                      ₹{Number(amount).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <button className="btn-view" onClick={() => handleViewDetails(txn)}>View</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>No transactions found for the selected date range.</p>
        )}
      </div>

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
                <label>Time:</label>
                <span>{new Date(selectedTransaction.created_at).toLocaleTimeString('en-IN')}</span>
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
              
              {selectedTransaction.gst_applicable && (
                <div className="detail-item">
                  <label>GST Amount:</label>
                  <span>₹{Number(selectedTransaction.gst_amount).toLocaleString('en-IN')}</span>
                </div>
              )}
              
              {selectedTransaction.gst_applicable && (
                <div className="detail-item">
                  <label>GST Amount:</label>
                  <span>₹{Number(selectedTransaction.gst_amount).toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowDetailsModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
