import api from "./axios";

/** SuperAdmin: list all users across all tenants */
export const getAllUsers = () => {
  return api.get("/accounts/users/superadmin/");
};

/** SuperAdmin: create user (optionally with company_id) */
export const createUser = (data) => {
  return api.post("/accounts/users/create/", data);
};

/** Company Admin/HR: list same-company Admin and HR users */
export const getCompanyUsers = () => {
  return api.get("/accounts/company-users/");
};

/** Company Admin/HR: create HR user inside current company */
export const createCompanyUser = (data) => {
  return api.post("/accounts/company-users/create/", data);
};

/** Company Admin: update HR user details & permissions */
export const updateCompanyUser = (userId, data) => {
  return api.patch(`/accounts/company-users/${userId}/update/`, data);
};

/** SuperAdmin: update user role */
export const updateUserRole = (userId, role) => {
  return api.patch(`/accounts/users/${userId}/role/`, { role });
};

/** SuperAdmin/Admin: delete user */
export const deleteUser = (userId) => {
  return api.delete(`/accounts/users/${userId}/delete/`);
};

/** SuperAdmin: send password reset email (temporary password) to user */
export const resetUserPassword = (userId) => {
  return api.post(`/accounts/users/${userId}/reset-password/`);
};

/** SuperAdmin: block or unblock user */
export const setUserBlock = (userId, isActive) => {
  return api.patch(`/accounts/users/${userId}/block/`, { is_active: isActive });
};

/** SuperAdmin: unlock user (clear lock from failed login attempts) */
export const unlockUser = (userId) => {
  return api.post(`/accounts/users/${userId}/unlock/`);
};


