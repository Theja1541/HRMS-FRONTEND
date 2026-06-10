import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectApi } from '../../api/projectApi';

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProject();
    }, [id]);

    const fetchProject = async () => {
        try {
            const response = await projectApi.getProject(id);
            setProject(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching project details", error);
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading project details...</div>;
    if (!project) return <div className="p-8 text-center text-red-500">Project not found.</div>;

    const remainingDays = project.due_date ? 
        Math.ceil((new Date(project.due_date) - new Date()) / (1000 * 60 * 60 * 24)) : '-';

    return (
        <div className="projects-page">
            <div className="page-header" style={{ marginBottom: '24px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <h2 className="page-title" style={{ margin: 0 }}>{project.project_name}</h2>
                        <span style={{
                            padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 600,
                            background: project.project_status === 'Completed' ? '#dcfce7' : 
                                        project.project_status === 'In Progress' ? '#dbeafe' : '#fef3c7',
                            color: project.project_status === 'Completed' ? '#16a34a' : 
                                   project.project_status === 'In Progress' ? '#2563eb' : '#d97706'
                        }}>
                            {project.project_status}
                        </span>
                    </div>
                    <p style={{ color: '#64748b', fontWeight: 500, fontSize: '14px', margin: 0 }}>[{project.project_code}] - {project.client_name || 'Internal'}</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => navigate(`/projects/${id}/assign`)} className="btn primary" style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                        Assign Team
                    </button>
                    <button onClick={() => navigate(`/projects/edit/${id}`)} className="btn" style={{ background: '#f1f5f9', color: '#334155' }}>
                        Edit Project
                    </button>
                </div>
            </div>

            {/* TABS */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
                {['overview', 'team', 'timeline', 'summary'].map(tab => (
                    <button
                        key={tab}
                        style={{
                            padding: '12px 24px', fontWeight: 500, fontSize: '14px', textTransform: 'capitalize',
                            borderBottom: activeTab === tab ? '2px solid #2563eb' : 'none',
                            color: activeTab === tab ? '#2563eb' : '#64748b',
                            background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer'
                        }}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* TAB CONTENT */}
            <div className="card" style={{ padding: '24px' }}>
                
                {activeTab === 'overview' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                        <div>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>Details</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <p style={{ margin: 0 }}><span style={{ color: '#64748b', width: '120px', display: 'inline-block' }}>Description:</span> {project.project_description || '-'}</p>
                                <p style={{ margin: 0 }}><span style={{ color: '#64748b', width: '120px', display: 'inline-block' }}>PM:</span> {project.project_manager_name || '-'}</p>
                                <p style={{ margin: 0 }}><span style={{ color: '#64748b', width: '120px', display: 'inline-block' }}>Priority:</span> {project.priority}</p>
                                <p style={{ margin: 0 }}><span style={{ color: '#64748b', width: '120px', display: 'inline-block' }}>Active:</span> {project.active_status ? 'Yes' : 'No'}</p>
                            </div>
                        </div>
                        <div>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>Financials</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <p style={{ margin: 0 }}><span style={{ color: '#64748b', width: '120px', display: 'inline-block' }}>Value:</span> ${parseFloat(project.project_value).toLocaleString()}</p>
                                <p style={{ margin: 0 }}><span style={{ color: '#64748b', width: '120px', display: 'inline-block' }}>Billing Type:</span> {project.billing_type}</p>
                                <p style={{ margin: 0 }}><span style={{ color: '#64748b', width: '120px', display: 'inline-block' }}>Terms:</span> {project.payment_terms}</p>
                                <p style={{ margin: 0 }}><span style={{ color: '#64748b', width: '120px', display: 'inline-block' }}>Progress:</span> {project.progress_percentage}%</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'team' && (
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>Assigned Team Members</h3>
                        <div className="responsive-table-container">
                            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ background: '#f8fafc' }}>
                                    <tr>
                                        <th style={{ padding: '12px 16px', color: '#475569', fontSize: '13px', textTransform: 'uppercase' }}>Employee</th>
                                        <th style={{ padding: '12px 16px', color: '#475569', fontSize: '13px', textTransform: 'uppercase' }}>Role</th>
                                        <th style={{ padding: '12px 16px', color: '#475569', fontSize: '13px', textTransform: 'uppercase' }}>Assigned</th>
                                        <th style={{ padding: '12px 16px', color: '#475569', fontSize: '13px', textTransform: 'uppercase' }}>Hours (Plan/Spent)</th>
                                        <th style={{ padding: '12px 16px', color: '#475569', fontSize: '13px', textTransform: 'uppercase' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {project.assignments?.map(a => (
                                        <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{a.employee_name}</div>
                                                <div style={{ fontSize: '12px', color: '#64748b' }}>{a.employee_designation}</div>
                                            </td>
                                            <td style={{ padding: '16px', fontSize: '14px', color: '#64748b' }}>{a.project_role}</td>
                                            <td style={{ padding: '16px', fontSize: '14px', color: '#64748b' }}>{a.assigned_date}</td>
                                            <td style={{ padding: '16px', fontSize: '14px' }}>
                                                <span style={{ color: a.hours_spent > a.hours_planned ? '#dc2626' : '#334155', fontWeight: a.hours_spent > a.hours_planned ? 700 : 400 }}>
                                                    {a.hours_spent}
                                                </span> / {a.hours_planned}
                                            </td>
                                            <td style={{ padding: '16px', fontSize: '14px', color: '#64748b' }}>{a.assignment_status}</td>
                                        </tr>
                                    ))}
                                    {!project.assignments?.length && <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No team members assigned.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'timeline' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                        <div>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>Dates</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                                    <span style={{ color: '#475569', fontWeight: 500 }}>Start Date</span>
                                    <span style={{ fontWeight: 700, color: '#1e293b' }}>{project.start_date || '-'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                                    <span style={{ color: '#475569', fontWeight: 500 }}>Planned End</span>
                                    <span style={{ fontWeight: 700, color: '#1e293b' }}>{project.planned_end_date || '-'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '12px', borderRadius: '8px' }}>
                                    <span style={{ color: '#1e40af', fontWeight: 700 }}>Due Date</span>
                                    <span style={{ fontWeight: 700, color: '#1e3a8a' }}>{project.due_date || '-'}</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', padding: '24px', borderRadius: '12px', textAlign: 'center' }}>
                                <h4 style={{ color: '#9a3412', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', fontSize: '14px', letterSpacing: '0.05em' }}>Remaining Days</h4>
                                <div style={{ fontSize: '48px', fontWeight: 800, color: '#ea580c', marginBottom: '8px' }}>
                                    {remainingDays < 0 ? 'Overdue' : remainingDays}
                                </div>
                                {remainingDays > 0 && <p style={{ color: '#c2410c', fontSize: '14px', margin: 0 }}>Days left until deadline</p>}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'summary' && (
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '24px' }}>Project Summary Overview</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                                <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>Assigned Employees</div>
                                <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b' }}>{project.assigned_employees_count}</div>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                                <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>Total Planned Hours</div>
                                <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b' }}>
                                    {project.assignments?.reduce((sum, a) => sum + parseFloat(a.hours_planned || 0), 0) || 0}
                                </div>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                                <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>Total Hours Spent</div>
                                <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b' }}>
                                    {project.assignments?.reduce((sum, a) => sum + parseFloat(a.hours_spent || 0), 0) || 0}
                                </div>
                            </div>
                            <div style={{ background: '#eff6ff', padding: '16px', borderRadius: '12px', border: '1px solid #bfdbfe', textAlign: 'center' }}>
                                <div style={{ color: '#2563eb', fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>Progress</div>
                                <div style={{ fontSize: '24px', fontWeight: 700, color: '#1d4ed8' }}>{project.progress_percentage}%</div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ProjectDetails;
