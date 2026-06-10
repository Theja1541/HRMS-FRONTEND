import React, { useState, useEffect } from 'react';
import { projectApi } from '../../api/projectApi';
import './projects.css';

const ProjectDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await projectApi.getDashboard();
            setDashboardData(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching dashboard data", error);
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Dashboard...</div>;
    if (!dashboardData) return <div className="p-8 text-center">Failed to load dashboard</div>;

    const { kpi, charts } = dashboardData;

    return (
        <div className="projects-page">
            <div className="page-header">
                <h2 className="page-title">Projects Dashboard</h2>
            </div>
            
            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-title">Total Projects</div>
                    <div className="kpi-value">{kpi.total_projects}</div>
                </div>
                <div className="kpi-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                    <div className="kpi-title">Active Projects</div>
                    <div className="kpi-value">{kpi.active_projects}</div>
                </div>
                <div className="kpi-card" style={{ borderLeft: '4px solid #10b981' }}>
                    <div className="kpi-title">Completed Projects</div>
                    <div className="kpi-value">{kpi.completed_projects}</div>
                </div>
                <div className="kpi-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <div className="kpi-title">On Hold Projects</div>
                    <div className="kpi-value">{kpi.on_hold_projects}</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-title">Total Project Value</div>
                    <div className="kpi-value">${parseFloat(kpi.total_value).toLocaleString()}</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-title">Assigned Employees</div>
                    <div className="kpi-value">{kpi.total_assigned_employees}</div>
                </div>
                <div className="kpi-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
                    <div className="kpi-title">Due This Month</div>
                    <div className="kpi-value">{kpi.due_this_month}</div>
                </div>
                <div className="kpi-card" style={{ borderLeft: '4px solid #ef4444' }}>
                    <div className="kpi-title">Overdue Projects</div>
                    <div className="kpi-value">{kpi.overdue_projects}</div>
                </div>
            </div>

            <div className="charts-grid">
                <div className="card">
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>Project Status Distribution</h3>
                    <div style={{ padding: '16px 0' }}>
                        {charts.status_distribution.map((status, index) => (
                            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <span style={{ color: '#64748b', fontWeight: 500 }}>{status.project_status}</span>
                                <span style={{ background: '#dbeafe', color: '#1e40af', padding: '4px 12px', borderRadius: '12px', fontSize: '13px', fontWeight: 700 }}>
                                    {status.count}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>Project Value Summary</h3>
                    <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                            <span style={{ color: '#64748b' }}>Total Value</span>
                            <span style={{ fontWeight: 700, fontSize: '18px', color: '#1e293b' }}>${parseFloat(kpi.total_value).toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                            <span style={{ color: '#64748b' }}>Active Value</span>
                            <span style={{ fontWeight: 700, fontSize: '18px', color: '#2563eb' }}>${parseFloat(kpi.active_value).toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                            <span style={{ color: '#64748b' }}>Completed Value</span>
                            <span style={{ fontWeight: 700, fontSize: '18px', color: '#16a34a' }}>${parseFloat(kpi.completed_value).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDashboard;
