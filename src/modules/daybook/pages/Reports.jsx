import React, { useState } from "react";
import { getMonthlyReport, getGstReport, getVendorPayments, getExpenseSummary } from "../services/daybookApi";
import "../../../styles/daybook.css";

export default function Reports() {
  const [tabValue, setTabValue] = useState(0);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      if (tabValue === 0) {
        // Monthly
        const d = new Date(startDate);
        const res = await getMonthlyReport({ year: d.getFullYear(), month: d.getMonth() + 1 });
        setReportData(res.data.category_wise.map((item, id) => ({ id, ...item })));
      } else if (tabValue === 1) {
        // GST
        const res = await getGstReport({ start_date: startDate, end_date: endDate });
        setReportData(res.data);
      } else if (tabValue === 2) {
        // Vendor
        const res = await getVendorPayments({ start_date: startDate, end_date: endDate });
        setReportData(res.data.map((item, id) => ({ id, ...item })));
      } else if (tabValue === 3) {
        // Expense
        const res = await getExpenseSummary({ start_date: startDate, end_date: endDate });
        setReportData(res.data.map((item, id) => ({ id, ...item })));
      }
    } catch (err) {
      console.error("Failed to fetch report", err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    "Monthly Category Summary",
    "GST Transactions",
    "Vendor Payments",
    "Expense Summary"
  ];

  return (
    <div className="daybook-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Reports</h2>
          <p className="page-subtitle">Generate and view daybook financial reports</p>
        </div>
      </div>

      <div className="table-wrapper" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '24px', gap: '20px' }}>
          {tabs.map((tab, idx) => (
            <button
              key={idx}
              onClick={() => { setTabValue(idx); setReportData([]); }}
              style={{
                background: 'none', border: 'none', padding: '10px 16px', fontSize: '15px',
                fontWeight: tabValue === idx ? '600' : '500',
                color: tabValue === idx ? '#2563eb' : '#64748b',
                borderBottom: tabValue === idx ? '2px solid #2563eb' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="filter-bar" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>Start Date</label>
            <input type="date" className="search-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>End Date</label>
            <input type="date" className="search-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <button className="btn primary" onClick={fetchReport} disabled={loading} style={{ marginLeft: '10px' }}>
            {loading ? "Loading..." : "Generate Report"}
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div className="empty-state">Loading report...</div>
          ) : reportData.length === 0 ? (
            <div className="empty-state">No data found for the selected period.</div>
          ) : (
            <table className="daybook-table">
              {tabValue === 0 && (
                <>
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Type</th>
                      <th>Total Debit (₹)</th>
                      <th>Total Credit (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((row) => (
                      <tr key={row.id}>
                        <td>{row.category__name}</td>
                        <td>{row.category__category_type}</td>
                        <td style={{ color: '#ef4444' }}>{row.total_debit || 0}</td>
                        <td style={{ color: '#10b981' }}>{row.total_credit || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}
              {tabValue === 1 && (
                <>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Txn Number</th>
                      <th>GST Amount (₹)</th>
                      <th>Debit (₹)</th>
                      <th>Credit (₹)</th>
                      <th>Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((row) => (
                      <tr key={row.id}>
                        <td>{row.date}</td>
                        <td>{row.transaction_number}</td>
                        <td>{row.gst_amount}</td>
                        <td style={{ color: '#ef4444' }}>{row.debit_amount || 0}</td>
                        <td style={{ color: '#10b981' }}>{row.credit_amount || 0}</td>
                        <td>{row.category_name}</td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}
              {tabValue === 2 && (
                <>
                  <thead>
                    <tr>
                      <th>Vendor Name</th>
                      <th>Total Paid (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((row) => (
                      <tr key={row.id}>
                        <td>{row.to_vendor__name}</td>
                        <td>{row.total_paid}</td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}
              {tabValue === 3 && (
                <>
                  <thead>
                    <tr>
                      <th>Expense Category</th>
                      <th>Total Expense (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((row) => (
                      <tr key={row.id}>
                        <td>{row.category__name}</td>
                        <td>{row.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
