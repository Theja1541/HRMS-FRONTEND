import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectApi } from '../../api/projectApi';
import './projects.css';

const ProjectList = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        project_status: '',
        priority: ''
    });

    useEffect(() => {
        fetchProjects();
    }, [filters]);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await projectApi.getProjects(filters);
            // Assuming pagination returns data.results
            setProjects(response.data.results || response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching projects", error);
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="projects-page">
            <div className="page-header">
                <h2 className="page-title">Projects</h2>
                <button 
                    onClick={() => navigate('/projects/create')}
                    className="btn primary"
                >
                    ➕ Create Project
                </button>
            </div>

            <div className="card" style={{ marginBottom: 24, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', padding: '16px' }}>
                <input 
                    type="text" 
                    name="search" 
                    placeholder="Search by Code, Name, Client..." 
                    value={filters.search}
                    onChange={handleFilterChange}
                    className="form-control"
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                />
                <select name="project_status" value={filters.project_status} onChange={handleFilterChange} className="form-control" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                    <option value="">All Statuses</option>
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                </select>
                <select name="priority" value={filters.priority} onChange={handleFilterChange} className="form-control" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                    <option value="">All Priorities</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                </select>
            </div>

            <div className="card responsive-table-container" style={{ padding: 0, overflowX: 'auto' }}>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading projects...</div>
                ) : (
                    <table className="table" style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase' }}>Project Code</th>
                                <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase' }}>Project Name</th>
                                <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase' }}>Client</th>
                                <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase' }}>PM</th>
                                <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase' }}>Status</th>
                                <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase' }}>Due Date</th>
                                <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase' }}>Progress</th>
                                <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map(project => (
                                <tr key={project.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: '#2563eb' }}>
                                        {project.project_code}
                                    </td>
                                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                                        {project.project_name}
                                    </td>
                                    <td style={{ padding: '16px', fontSize: '14px', color: '#64748b' }}>
                                        {project.client_name || '-'}
                                    </td>
                                    <td style={{ padding: '16px', fontSize: '14px', color: '#64748b' }}>
                                        {project.project_manager_name || '-'}
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{
                                            padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 600,
                                            background: project.project_status === 'Completed' ? '#dcfce7' : 
                                                        project.project_status === 'In Progress' ? '#dbeafe' : '#fef3c7',
                                            color: project.project_status === 'Completed' ? '#16a34a' : 
                                                   project.project_status === 'In Progress' ? '#2563eb' : '#d97706'
                                        }}>
                                            {project.project_status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', fontSize: '14px', color: '#64748b' }}>
                                        {project.due_date || '-'}
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ width: '100%', background: '#e2e8f0', borderRadius: '4px', height: '8px', marginBottom: '4px' }}>
                                            <div style={{ background: '#2563eb', height: '8px', borderRadius: '4px', width: `${project.progress_percentage}%` }}></div>
                                        </div>
                                        <span style={{ fontSize: '12px', color: '#64748b' }}>{project.progress_percentage}%</span>
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button 
                                                onClick={() => navigate(`/projects/${project.id}`)}
                                                className="btn"
                                                style={{ fontSize: '13px', padding: '6px 12px' }}
                                            >
                                                View
                                            </button>
                                            <button 
                                                onClick={() => navigate(`/projects/edit/${project.id}`)}
                                                className="btn"
                                                style={{ fontSize: '13px', padding: '6px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155' }}
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {projects.length === 0 && (
                                <tr>
                                    <td colSpan="8" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                                        No projects found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ProjectList;
