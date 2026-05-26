import api from "./axios";

/** List all companies (SuperAdmin). Optional: ?is_active=true|false */
export const getCompanies = (params = {}) => {
  return api.get("/accounts/companies/", { params });
};

/** Create company */
export const createCompany = (data) => {
  return api.post("/accounts/companies/create/", data);
};

/** Get one company */
export const getCompany = (id) => {
  return api.get(`/accounts/companies/${id}/`);
};

/** Update company */
export const updateCompany = (id, data) => {
  return api.patch(`/accounts/companies/${id}/update/`, data);
};

/** Suspend company (soft delete / deactivate) */
export const deleteCompany = (id) => {
  return api.delete(`/accounts/companies/${id}/delete/`);
};

/** Activate a suspended company */
export const activateCompany = (id) => {
  return api.post(`/accounts/companies/${id}/activate/`);
};

/** Permanently delete company (hard delete) */
export const hardDeleteCompany = (id) => {
  return api.delete(`/accounts/companies/${id}/hard-delete/`);
};

/** Current tenant branding profile (Admin/HR/SuperAdmin) */
export const getCompanyBranding = () => {
  return api.get("/accounts/company-branding/");
};

/** Upload/replace current tenant logo */
export const uploadCompanyLogo = (formData) => {
  return api.post("/accounts/company-branding/logo/", formData);
};

/** Remove current tenant logo */
export const deleteCompanyLogo = () => {
  return api.delete("/accounts/company-branding/logo/");
};

/** Stop all actions for a company (subscription expired) */
export const stopCompanyActions = (id) => {
  return api.post(`/accounts/companies/${id}/stop-actions/`);
};

/** Mark company subscription as paid and extend subscription period */
export const markCompanyPaid = (id, data = {}) => {
  return api.post(`/accounts/companies/${id}/mark-paid/`, data);
};
