import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";
import { getDashboardSummary, getExpenseSummary, getMonthlyReport } from "../services/daybookApi";
import "../../../styles/daybook.css";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        const endOfMonth = today.toISOString().split('T')[0];

        const [summaryRes, expensesRes, monthlyRes] = await Promise.all([
          getDashboardSummary({ start_date: startOfMonth, end_date: endOfMonth }),
          getExpenseSummary({ start_date: startOfMonth, end_date: endOfMonth }),
          getMonthlyReport({ year: today.getFullYear(), month: today.getMonth() + 1 })
        ]);

        setSummary(summaryRes.data);
        
        const formattedExpenses = expensesRes.data.map(item => ({
          name: item.category__name,
          value: parseFloat(item.total)
        }));
        setExpenses(formattedExpenses);

        const trendData = monthlyRes.data.category_wise.map(item => ({
          name: item.category__name,
          debit: parseFloat(item.total_debit || 0),
          credit: parseFloat(item.total_credit || 0)
        }));
        setMonthlyTrend(trendData);

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="daybook-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Day Book Dashboard</h2>
          <p className="page-subtitle">Real-time finance analytics</p>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">Loading dashboard...</div>
      ) : (
        <>
          <div className="employee-stats" style={{ marginBottom: '24px' }}>
            <div className="stat-card" style={{ borderTop: '4px solid #10b981' }}>
              <h4>Total Credit (This Month)</h4>
              <p style={{ color: '#10b981' }}>₹ {summary?.total_credit?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="stat-card" style={{ borderTop: '4px solid #ef4444' }}>
              <h4>Total Debit (This Month)</h4>
              <p style={{ color: '#ef4444' }}>₹ {summary?.total_debit?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="stat-card" style={{ borderTop: '4px solid #3b82f6' }}>
              <h4>Balance</h4>
              <p style={{ color: '#3b82f6' }}>₹ {summary?.balance?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="stat-card" style={{ borderTop: '4px solid #8b5cf6' }}>
              <h4>Recent Transactions</h4>
              <p style={{ color: '#8b5cf6' }}>{summary?.recent_transactions?.length || 0}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
            <div className="table-wrapper" style={{ padding: '24px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '16px', color: '#334155' }}>Expense Breakdown</h3>
              <div style={{ height: '300px' }}>
                {expenses.length === 0 ? <div className="empty-state">No expense data</div> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenses}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {expenses.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => `₹ ${value}`} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="table-wrapper" style={{ padding: '24px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '16px', color: '#334155' }}>Category Trend</h3>
              <div style={{ height: '300px' }}>
                {monthlyTrend.length === 0 ? <div className="empty-state">No trend data</div> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip formatter={(value) => `₹ ${value}`} />
                      <Legend />
                      <Line type="monotone" dataKey="debit" stroke="#ef4444" activeDot={{ r: 8 }} name="Debit" />
                      <Line type="monotone" dataKey="credit" stroke="#10b981" name="Credit" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
