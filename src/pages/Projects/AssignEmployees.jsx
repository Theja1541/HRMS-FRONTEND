import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectApi } from '../../api/projectApi';
import Select from 'react-select';

const AssignEmployees = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        project: id || '',
        employees: [],
        project_role: 'Backend Developer',
        hours_planned: '',
        remarks: ''
    });
    const [employees, setEmployees] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { getEmployees } = await import('../../api/employees');
            const empRes = await getEmployees({ limit: 1000 });
            setEmployees(empRes.data.results || empRes.data);
            
            if (!id) {
                const projRes = await projectApi.getProjects({ limit: 1000 });
                setProjects(projRes.data.results || projRes.data);
            }
        } catch (error) {
            console.error("Error fetching data", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.project) {
            alert("Please select a project.");
            return;
        }
        if (!formData.employees || formData.employees.length === 0) {
            alert("Please select at least one employee.");
            return;
        }
        setLoading(true);
        try {
            const assignments = formData.employees.map(empId => ({
                project: formData.project,
                employee: empId,
                project_role: formData.project_role,
                hours_planned: formData.hours_planned,
                remarks: formData.remarks
            }));
            
            await Promise.all(assignments.map(payload => projectApi.createAssignment(payload)));
            
            setLoading(false);
            navigate(`/projects/${formData.project}`);
        } catch (error) {
            console.error("Error assigning employee", error);
            setLoading(false);
            alert(error.response?.data?.non_field_errors?.[0] || error.response?.data?.detail || "Failed to assign employees.");
        }
    };

    const employeeOptions = employees.map(emp => ({
        value: emp.id,
        label: `${emp.employee_id} - ${emp.first_name} ${emp.last_name}`
    }));

    const projectOptions = projects.map(proj => ({
        value: proj.id,
        label: `${proj.project_code} - ${proj.project_name}`
    }));

    return (
        <div className="projects-page">
            <div className="page-header">
                <h2 className="page-title">Assign Employee to Project</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="card" style={{ maxWidth: '600px', margin: '0 auto', padding: '32px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {!id && (
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>Project *</label>
                            <Select
                                options={projectOptions}
                                value={projectOptions.find(opt => opt.value === formData.project) || null}
                                onChange={(selectedOption) => setFormData({ ...formData, project: selectedOption ? selectedOption.value : '' })}
                                isSearchable={true}
                                placeholder="Search Project..."
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        padding: '4px',
                                        borderRadius: '8px',
                                        borderColor: '#cbd5e1',
                                    })
                                }}
                                required
                            />
                        </div>
                    )}
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>Employees *</label>
                        <Select
                            isMulti
                            options={employeeOptions}
                            value={employeeOptions.filter(opt => formData.employees.includes(opt.value))}
                            onChange={(selectedOptions) => setFormData({ 
                                ...formData, 
                                employees: selectedOptions ? selectedOptions.map(opt => opt.value) : [] 
                            })}
                            isSearchable={true}
                            placeholder="Search Employee ID or Name..."
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    padding: '4px',
                                    borderRadius: '8px',
                                    borderColor: '#cbd5e1',
                                })
                            }}
                            required={formData.employees.length === 0}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>Project Role *</label>
                        <select required name="project_role" value={formData.project_role} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#fff' }}>
                            <option value="Project Manager">Project Manager</option>
                            <option value="Team Lead">Team Lead</option>
                            <option value="Backend Developer">Backend Developer</option>
                            <option value="Frontend Developer">Frontend Developer</option>
                            <option value="Full Stack Developer">Full Stack Developer</option>
                            <option value="QA Engineer">QA Engineer</option>
                            <option value="DevOps Engineer">DevOps Engineer</option>
                            <option value="UI/UX Designer">UI/UX Designer</option>
                            <option value="Business Analyst">Business Analyst</option>
                            <option value="HR Coordinator">HR Coordinator</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>Planned Hours</label>
                        <input type="number" step="0.5" name="hours_planned" value={formData.hours_planned} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#475569', marginBottom: '8px' }}>Remarks</label>
                        <textarea name="remarks" value={formData.remarks} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', minHeight: '80px', resize: 'vertical' }} rows="3"></textarea>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
                    <button type="button" onClick={() => navigate(`/projects/${id}`)} className="btn" style={{ padding: '10px 24px', fontSize: '14px' }}>Cancel</button>
                    <button type="submit" disabled={loading} className="btn primary" style={{ padding: '10px 24px', fontSize: '14px' }}>
                        {loading ? 'Assigning...' : 'Assign Employees'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AssignEmployees;
