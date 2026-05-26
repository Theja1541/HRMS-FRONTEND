import api from "./axios";

const BASE = "/billing";

/** Pricing plans */
export const getPricingPlans = () => api.get(`${BASE}/plans/`);
export const createPricingPlan = (data) => api.post(`${BASE}/plans/`, data);
export const getPricingPlan = (id) => api.get(`${BASE}/plans/${id}/`);
export const updatePricingPlan = (id, data) => api.patch(`${BASE}/plans/${id}/`, data);
export const deletePricingPlan = (id) => api.delete(`${BASE}/plans/${id}/`);

/** Assign plan to company */
export const assignPlanToCompany = (companyId, data) =>
  api.post(`${BASE}/companies/${companyId}/assign-plan/`, data);

/** Payments */
export const getPayments = (params = {}) => api.get(`${BASE}/payments/`, { params });
export const createPayment = (data) => api.post(`${BASE}/payments/`, data);
export const getPayment = (id) => api.get(`${BASE}/payments/${id}/`);
export const updatePayment = (id, data) => api.patch(`${BASE}/payments/${id}/`, data);

/** Invoices */
export const getInvoices = (params = {}) => api.get(`${BASE}/invoices/`, { params });
export const createInvoice = (data) => api.post(`${BASE}/invoices/`, data);
export const getInvoice = (id) => api.get(`${BASE}/invoices/${id}/`);
export const updateInvoice = (id, data) => api.patch(`${BASE}/invoices/${id}/`, data);

/** Subscription expiry alerts */
export const getSubscriptionAlerts = (params = {}) =>
  api.get(`${BASE}/subscription-alerts/`, { params });
