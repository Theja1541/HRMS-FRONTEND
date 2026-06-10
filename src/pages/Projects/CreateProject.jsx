import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectApi } from '../../api/projectApi';

const CreateProject = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        project_code: '',
        project_name: '',
        project_description: '',
        department_id: '',
        client_name: '',
        client_contact_person: '',
        client_email: '',
        client_phone: '',
        project_value: '',
        billing_type: 'Fixed Price',
        payment_terms: 'Monthly',
        start_date: '',
        planned_end_date: '',
        due_date: '',
        project_status: 'Not Started',
        priority: 'Medium',
        progress_percentage: 0,
        active_status: true,
        remarks: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const finalValue = type === 'checkbox' ? checked : value;
        
        // Auto-update status to 'In Progress' if start date is today or earlier and status is 'Not Started'
        if (name === 'start_date') {
            const selectedDate = new Date(finalValue);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate <= today && formData.project_status === 'Not Started') {
                setFormData(prev => ({
                    ...prev,
                    [name]: finalValue,
                    project_status: 'In Progress'
                }));
                return;
            }
        }
        
        setFormData({
            ...formData,
            [name]: finalValue
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        // Clean empty values to prevent backend errors (like empty date strings or department_id)
        const payload = { ...formData };
        if (payload.department_id === '') payload.department_id = null;
        if (payload.start_date === '') payload.start_date = null;
        if (payload.planned_end_date === '') payload.planned_end_date = null;
        if (payload.due_date === '') payload.due_date = null;
        
        try {
            await projectApi.createProject(payload);
            setLoading(false);
            navigate('/projects');
        } catch (error) {
            console.error("Error creating project", error);
            setLoading(false);
            alert("Failed to create project");
        }
    };

    return (
        <div className="projects-page">
            <div className="page-header">
                <h2 className="page-title">Create New Project</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="card" style={{ maxWidth: '900px', margin: '0 auto', padding: '32px' }}>
                
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>1. Project Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>Project Code *</label>
                        <input required type="text" name="project_code" value={formData.project_code} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>Project Name *</label>
                        <input required type="text" name="project_name" value={formData.project_name} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>Description</label>
                        <textarea name="project_description" value={formData.project_description} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', minHeight: '100px', resize: 'vertical' }}></textarea>
                    </div>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>2. Client Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>Client Name</label>
                        <input type="text" name="client_name" value={formData.client_name} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>Contact Person</label>
                        <input type="text" name="client_contact_person" value={formData.client_contact_person} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>Client Email</label>
                        <input type="email" name="client_email" value={formData.client_email} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>Client Phone</label>
                        <input type="text" name="client_phone" value={formData.client_phone} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                    </div>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>3. Financial & Timeline</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>Project Value</label>
                        <input type="number" step="0.01" name="project_value" value={formData.project_value} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>Billing Type</label>
                        <select name="billing_type" value={formData.billing_type} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#fff' }}>
                            <option value="Fixed Price">Fixed Price</option>
                            <option value="Monthly Price">Monthly Price</option>
                            <option value="Quarterly Price">Quarterly Price</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>Payment Terms</label>
                        <select name="payment_terms" value={formData.payment_terms} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#fff' }}>
                            <option value="Monthly">Monthly</option>
                            <option value="Quarterly">Quarterly</option>
                            <option value="Milestone Based">Milestone Based</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>Start Date</label>
                        <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>End Date</label>
                        <input type="date" name="planned_end_date" value={formData.planned_end_date} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>Due Date</label>
                        <input type="date" name="due_date" value={formData.due_date} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                    </div>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>4. Status & Progress</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>Project Status</label>
                        <select name="project_status" value={formData.project_status} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#fff' }}>
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>Progress (%)</label>
                        <input type="number" step="0.01" min="0" max="100" name="progress_percentage" value={formData.progress_percentage || 0} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
                    <button type="button" onClick={() => navigate('/projects')} className="btn" style={{ padding: '10px 24px', fontSize: '14px' }}>Cancel</button>
                    <button type="submit" disabled={loading} className="btn primary" style={{ padding: '10px 24px', fontSize: '14px' }}>
                        {loading ? 'Creating...' : 'Create Project'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateProject;
