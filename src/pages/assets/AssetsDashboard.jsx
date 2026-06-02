import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { getAssetsDashboard } from "../../api/assets";
import "../../styles/employees.css";

const COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#0f172a", "#ef4444", "#64748b"];

export default function AssetsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await getAssetsDashboard();
      setData(res.data);
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="employees-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #0f766e', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
  if (error) return <div className="empty-state" style={{ color: '#ef4444' }}>{error}</div>;
  if (!data) return null;

  const statusData = [
    { name: "Available", value: data.available_assets, color: "#10b981" },
    { name: "Assigned", value: data.assigned_assets, color: "#0ea5e9" },
    { name: "Maintenance", value: data.maintenance_assets, color: "#f59e0b" },
    { name: "Damaged", value: data.damaged_assets, color: "#ef4444" },
    { name: "Lost", value: data.lost_assets, color: "#0f172a" },
    { name: "Retired", value: data.retired_assets, color: "#64748b" },
  ].filter((item) => item.value > 0);

  const StatCard = ({ title, value, icon, gradient, delay }) => (
    <div 
      className="dashboard-stat-card"
      style={{ 
        background: '#fff', 
        padding: '25px', 
        borderRadius: '16px', 
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)', 
        border: '1px solid rgba(226, 232, 240, 0.8)',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'default',
        animation: `fadeInUp 0.5s ease-out ${delay}s both`
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)';
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '4px',
        background: gradient
      }} />
      
      <div style={{ 
        width: '60px', 
        height: '60px', 
        borderRadius: '14px', 
        background: `${gradient}20`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '28px',
        color: '#fff',
        backgroundImage: gradient,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        {icon}
      </div>
      
      <div>
        <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px' }}>{title}</div>
        <div style={{ fontSize: '36px', fontWeight: '800', color: '#0f172a', lineHeight: '1' }}>{value}</div>
      </div>
    </div>
  );

  return (
    <div className="employees-page" style={{ padding: '30px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .dashboard-stat-card::after {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 150px;
            height: 150px;
            background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%);
            transform: translate(30%, -30%);
            pointer-events: none;
          }
        `}
      </style>
      
      <div className="page-header" style={{ marginBottom: '40px' }}>
        <div>
          <h2 className="page-title" style={{ fontSize: '28px', fontWeight: '800', color: '#fafafa', letterSpacing: '-0.5px' }}>Assets Overview</h2>
          <p className="page-subtitle" style={{ fontSize: '15px', color: '#64748b', marginTop: '5px' }}>Real-time insights and metrics for your organization's assets.</p>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', marginBottom: '40px' }}>
        <StatCard title="Total Assets" value={data.total_assets} icon="📦" gradient="linear-gradient(135deg, #6366f1, #8b5cf6)" delay={0} />
        <StatCard title="Available" value={data.available_assets} icon="✅" gradient="linear-gradient(135deg, #10b981, #34d399)" delay={0.1} />
        <StatCard title="Assigned" value={data.assigned_assets} icon="🤝" gradient="linear-gradient(135deg, #0ea5e9, #38bdf8)" delay={0.2} />
        <StatCard title="Maintenance" value={data.maintenance_assets} icon="🔧" gradient="linear-gradient(135deg, #f59e0b, #fbbf24)" delay={0.3} />
        <StatCard title="Damaged" value={data.damaged_assets} icon="⚠️" gradient="linear-gradient(135deg, #ef4444, #f87171)" delay={0.4} />
        <StatCard title="Lost / Retired" value={data.lost_assets + data.retired_assets} icon="🚫" gradient="linear-gradient(135deg, #0f172a, #475569)" delay={0.5} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '25px' }}>
        <div style={{ 
          background: '#fff', 
          padding: '30px', 
          borderRadius: '20px', 
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', 
          border: '1px solid rgba(226, 232, 240, 0.8)',
          animation: 'fadeInUp 0.5s ease-out 0.6s both'
        }}>
          <h3 style={{ margin: '0 0 25px 0', fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>Asset Distribution by Status</h3>
          <div style={{ height: 350, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">No Data Available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
