import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardSummary, getVendors, getCategories, getTransactions } from "../../../api/daybook";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import "../../../styles/daybook.css";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

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

  const chartData = useMemo(() => {
    if (!summary?.recent_transactions) return [];
    const grouped = summary.recent_transactions.reduce((acc, txn) => {
      const date = new Date(txn.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      if (!acc[date]) acc[date] = { date, Income: 0, Expense: 0 };
      
      const amount = Number(txn.debit_amount > 0 ? txn.debit_amount : txn.credit_amount) + Number(txn.gst_amount || 0);
      if (txn.debit_amount > 0) acc[date].Expense += amount;
      else acc[date].Income += amount;
      
      return acc;
    }, {});
    
    return Object.values(grouped);
  }, [summary]);

  const pieData = useMemo(() => {
    if (!summary?.recent_transactions) return [];
    const grouped = summary.recent_transactions.reduce((acc, txn) => {
      if (txn.debit_amount > 0) {
        const cat = txn.category_name || 'Uncategorized';
        if (!acc[cat]) acc[cat] = 0;
        acc[cat] += Number(txn.debit_amount) + Number(txn.gst_amount || 0);
      }
      return acc;
    }, {});
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [summary]);

  if (loading) return (
    <div className="daybook-dashboard" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ fontSize: '18px', fontWeight: '600', color: '#64748b' }}>Loading Dashboard...</div>
    </div>
  );

  return (
    <div className="daybook-dashboard" style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>Daybook Overview</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>Monitor your company's financial health in real-time</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'white', padding: '12px 20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>From Date</span>
            <input
              type="date"
              value={dateRange.start_date}
              onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
              style={{ border: 'none', outline: 'none', fontSize: '14px', fontWeight: '500', color: '#334155', cursor: 'pointer', background: 'transparent' }}
            />
          </div>
          <div style={{ width: '1px', height: '30px', background: '#e2e8f0' }}></div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>To Date</span>
            <input
              type="date"
              value={dateRange.end_date}
              onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
              style={{ border: 'none', outline: 'none', fontSize: '14px', fontWeight: '500', color: '#334155', cursor: 'pointer', background: 'transparent' }}
            />
          </div>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '16px', padding: '24px', color: 'white', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', opacity: 0.9 }}>Total Income (Credit)</p>
              <h2 style={{ margin: 0, fontSize: '32px', fontWeight: '800' }}>₹{Number(summary?.total_credit || 0).toLocaleString('en-IN')}</h2>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px', fontSize: '20px' }}>💰</div>
          </div>
          <p style={{ margin: 0, fontSize: '13px', opacity: 0.8 }}>Money received during this period</p>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', borderRadius: '16px', padding: '24px', color: 'white', boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', opacity: 0.9 }}>Total Expense (Debit)</p>
              <h2 style={{ margin: 0, fontSize: '32px', fontWeight: '800' }}>₹{Number(summary?.total_debit || 0).toLocaleString('en-IN')}</h2>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px', fontSize: '20px' }}>💸</div>
          </div>
          <p style={{ margin: 0, fontSize: '13px', opacity: 0.8 }}>Money spent during this period</p>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Quick Stats</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div onClick={() => navigate('/daybook/transactions')} style={{ cursor: 'pointer', padding: '12px', background: '#f8fafc', borderRadius: '12px', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='#f1f5f9'} onMouseOut={e=>e.currentTarget.style.background='#f8fafc'}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>{stats.transactions}</h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Transactions</p>
            </div>
            <div onClick={() => navigate('/daybook/vendors')} style={{ cursor: 'pointer', padding: '12px', background: '#f8fafc', borderRadius: '12px', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='#f1f5f9'} onMouseOut={e=>e.currentTarget.style.background='#f8fafc'}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>{stats.vendors}</h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Vendors</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {/* Line Chart */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Cash Flow Trend</h3>
          <div style={{ width: '100%', height: '300px' }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, undefined]}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Line type="monotone" dataKey="Income" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Expense" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>No data available for trend</div>
            )}
          </div>
        </div>

        {/* Pie Chart */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Expenses by Category</h3>
          <div style={{ width: '100%', height: '300px' }}>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, undefined]}
                  />
                  <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>No expense data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>Recent Transactions</h2>
          <button 
            onClick={() => navigate('/daybook/transactions')}
            style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
          >
            View All →
          </button>
        </div>
        
        {summary?.recent_transactions && summary.recent_transactions.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                  <th style={{ padding: '16px 12px', color: '#64748b', fontWeight: '600', fontSize: '13px' }}>Date</th>
                  <th style={{ padding: '16px 12px', color: '#64748b', fontWeight: '600', fontSize: '13px' }}>Details</th>
                  <th style={{ padding: '16px 12px', color: '#64748b', fontWeight: '600', fontSize: '13px' }}>Vendor</th>
                  <th style={{ padding: '16px 12px', color: '#64748b', fontWeight: '600', fontSize: '13px' }}>Category</th>
                  <th style={{ padding: '16px 12px', color: '#64748b', fontWeight: '600', fontSize: '13px' }}>Type</th>
                  <th style={{ padding: '16px 12px', color: '#64748b', fontWeight: '600', fontSize: '13px', textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {summary.recent_transactions.map((txn, index) => {
                  const isDebit = txn.debit_amount > 0;
                  const amount = Number(isDebit ? txn.debit_amount : txn.credit_amount) + Number(txn.gst_amount || 0);
                  const vendor = isDebit ? txn.to_vendor_name : txn.from_vendor_name;
                  
                  return (
                    <tr 
                      key={txn.id} 
                      onClick={() => handleViewDetails(txn)}
                      style={{ 
                        borderBottom: index === summary.recent_transactions.length - 1 ? 'none' : '1px solid #f1f5f9',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '16px 12px', fontSize: '14px', color: '#334155', fontWeight: '500' }}>
                        {new Date(txn.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                          {new Date(txn.created_at).toLocaleTimeString('en-IN', {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </td>
                      <td style={{ padding: '16px 12px', fontSize: '14px', color: '#0f172a', fontWeight: '500', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {txn.details}
                      </td>
                      <td style={{ padding: '16px 12px', fontSize: '14px', color: '#475569' }}>{vendor || '-'}</td>
                      <td style={{ padding: '16px 12px', fontSize: '14px', color: '#475569' }}>
                        <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontSize: '12px' }}>{txn.category_name || 'General'}</span>
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <span style={{ 
                          padding: '4px 10px', 
                          borderRadius: '20px', 
                          fontSize: '12px', 
                          fontWeight: '600',
                          background: isDebit ? '#fef2f2' : '#ecfdf5',
                          color: isDebit ? '#ef4444' : '#10b981'
                        }}>
                          {isDebit ? 'Debit' : 'Credit'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 12px', fontSize: '15px', fontWeight: '700', textAlign: 'right', color: isDebit ? '#ef4444' : '#10b981' }}>
                        {isDebit ? '-' : '+'}₹{amount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', color: '#64748b' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
            <p style={{ margin: 0, fontWeight: '500' }}>No recent transactions found.</p>
          </div>
        )}
      </div>

      {/* Detail Modal (Retained from original) */}
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
              <div className="detail-item full-width">
                <label>Details:</label>
                <span>{selectedTransaction.details}</span>
              </div>
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
