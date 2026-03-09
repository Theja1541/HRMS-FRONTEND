import api from './axios';

export const assetReturnAPI = {
  // Employee APIs
  createReturnRequest: (data) => api.post('/assets/return-requests/', data),
  getMyRequests: () => api.get('/assets/return-requests/my_requests/', { params: { _t: Date.now() } }),
  
  // Admin/HR APIs
  getAllRequests: () => api.get('/assets/return-requests/', { params: { _t: Date.now() } }),
  getPendingRequests: () => api.get('/assets/return-requests/pending/', { params: { _t: Date.now() } }),
  approveRequest: (id, remarks) => api.post(`/assets/return-requests/${id}/approve/`, { admin_remarks: remarks }),
  rejectRequest: (id, remarks) => api.post(`/assets/return-requests/${id}/reject/`, { admin_remarks: remarks }),
  
  // Asset Management
  getCompanyAssets: () => api.get('/assets/company-assets/', { params: { _t: Date.now() } }),
  createCompanyAsset: (data) => api.post('/assets/company-assets/', data),
  deleteCompanyAsset: (id) => api.delete(`/assets/company-assets/${id}/`),
  getAssetAssignments: () => api.get('/assets/assignments/', { params: { _t: Date.now() } }),
  getMyAssets: () => api.get('/assets/assignments/my_assets/', { params: { _t: Date.now() } }),
  getEmployeeAssets: (employeeId) => api.get(`/assets/assignments/employee_assets/?employee_id=${employeeId}`),
};

export default assetReturnAPI;
