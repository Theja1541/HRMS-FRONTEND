import api from './axios';

export const projectApi = {
    getProjects: (params) => api.get('/projects/projects/', { params }),
    getProject: (id) => api.get(`/projects/projects/${id}/`),
    createProject: (data) => api.post('/projects/projects/', data),
    updateProject: (id, data) => api.put(`/projects/projects/${id}/`, data),
    deleteProject: (id) => api.delete(`/projects/projects/${id}/`),
    
    getDashboard: () => api.get('/projects/projects/dashboard/'),
    
    getAssignments: (params) => api.get('/projects/assignments/', { params }),
    createAssignment: (data) => api.post('/projects/assignments/', data),
    updateAssignment: (id, data) => api.put(`/projects/assignments/${id}/`, data),
    releaseAssignment: (id) => api.post(`/projects/assignments/${id}/release/`),
};
