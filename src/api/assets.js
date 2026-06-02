import api from "./axios";

// Dashboard
export const getAssetsDashboard = () => api.get("/assets/dashboard/");

// Categories
export const getAssetCategories = (params) => api.get("/assets/categories/", { params });
export const createAssetCategory = (data) => api.post("/assets/categories/", data);
export const updateAssetCategory = (id, data) => api.put(`/assets/categories/${id}/`, data);
export const deleteAssetCategory = (id) => api.delete(`/assets/categories/${id}/`);

// Assets
export const getAssets = (params) => api.get("/assets/", { params });
export const getAsset = (id) => api.get(`/assets/${id}/`);
export const createAsset = (data) => api.post("/assets/", data);
export const updateAsset = (id, data) => api.put(`/assets/${id}/`, data);
export const deleteAsset = (id) => api.delete(`/assets/${id}/`);

// Assignments
export const getAssetAssignments = (params) => api.get("/assets/assignments/", { params });
export const assignAsset = (data) => api.post("/assets/assignments/", data);
export const updateAssetAssignment = (id, data) => api.put(`/assets/assignments/${id}/`, data);

// Returns
export const returnAsset = (data) => api.post("/assets/returns/", data);

// Maintenance
export const getAssetMaintenances = (params) => api.get("/assets/maintenance/", { params });
export const createAssetMaintenance = (data) => api.post("/assets/maintenance/", data);
export const updateAssetMaintenance = (id, data) => api.put(`/assets/maintenance/${id}/`, data);

// History
export const getAssetHistory = (params) => api.get("/assets/history/", { params });

// Requests
export const getAssetRequests = (params) => api.get("/assets/requests/", { params });
export const createAssetRequest = (data) => api.post("/assets/requests/", data);
export const approveAssetRequest = (id, data) => api.post(`/assets/requests/${id}/approve/`, data);
export const rejectAssetRequest = (id, data) => api.post(`/assets/requests/${id}/reject/`, data);
