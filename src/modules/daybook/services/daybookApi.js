import api from "../../../api/axios";

// Vendors
export const getVendors = (params) => api.get("/daybook/vendors/", { params });
export const getVendor = (id) => api.get(`/daybook/vendors/${id}/`);
export const createVendor = (data) => api.post("/daybook/vendors/", data);
export const updateVendor = (id, data) => api.put(`/daybook/vendors/${id}/`, data);
export const deleteVendor = (id) => api.delete(`/daybook/vendors/${id}/`);

// Categories
export const getCategories = (params) => api.get("/daybook/categories/", { params });
export const getCategory = (id) => api.get(`/daybook/categories/${id}/`);
export const createCategory = (data) => api.post("/daybook/categories/", data);
export const updateCategory = (id, data) => api.put(`/daybook/categories/${id}/`, data);
export const deleteCategory = (id) => api.delete(`/daybook/categories/${id}/`);

// Transactions
export const getTransactions = (params) => api.get("/daybook/transactions/", { params });
export const getTransaction = (id) => api.get(`/daybook/transactions/${id}/`);
export const createTransaction = (data) => api.post("/daybook/transactions/", data);
export const updateTransaction = (id, data) => api.put(`/daybook/transactions/${id}/`, data);
export const deleteTransaction = (id) => api.delete(`/daybook/transactions/${id}/`);

// Reports
export const getDashboardSummary = (params) => api.get("/daybook/dashboard/", { params });
export const getMonthlyReport = (params) => api.get("/daybook/reports/monthly/", { params });
export const getGstReport = (params) => api.get("/daybook/reports/gst-transactions/", { params });
export const getVendorPayments = (params) => api.get("/daybook/reports/vendor-payments/", { params });
export const getExpenseSummary = (params) => api.get("/daybook/reports/expense-summary/", { params });
