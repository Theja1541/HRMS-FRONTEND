import api from "./axios";

// Vendors
export const getVendors = () => api.get("/daybook/vendors/");
export const createVendor = (data) => api.post("/daybook/vendors/", data);
export const updateVendor = (id, data) => api.put(`/daybook/vendors/${id}/`, data);
export const deleteVendor = (id) => api.delete(`/daybook/vendors/${id}/`);

// Categories
export const getCategories = () => api.get("/daybook/categories/");
export const createCategory = (data) => api.post("/daybook/categories/", data);
export const updateCategory = (id, data) => api.put(`/daybook/categories/${id}/`, data);
export const deleteCategory = (id) => api.delete(`/daybook/categories/${id}/`);

// Transactions
export const getTransactions = (params) => api.get("/daybook/transactions/", { params });
export const createTransaction = (data) => api.post("/daybook/transactions/", data);
export const getTransactionById = (id) => api.get(`/daybook/transactions/${id}/`);
export const updateTransaction = (id, data) => api.put(`/daybook/transactions/${id}/`, data);
export const deleteTransaction = (id) => api.delete(`/daybook/transactions/${id}/`);

// Dashboard
export const getDashboardSummary = (params) => api.get("/daybook/dashboard/", { params });

// Reports
export const getVendorPaymentsReport = (params) => api.get("/daybook/reports/vendor-payments/", { params });
export const getExpenseSummaryReport = (params) => api.get("/daybook/reports/expense-summary/", { params });
export const getGSTTransactionsReport = (params) => api.get("/daybook/reports/gst-transactions/", { params });
export const getMonthlyReport = (params) => api.get("/daybook/reports/monthly/", { params });
