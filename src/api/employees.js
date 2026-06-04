import api from "./axios";

export const checkEmployeeId = async (employeeId, employeePk = null) => {
  return await api.get("/employees/check-id/", {
    params: {
      employee_id: employeeId,
      employee_pk: employeePk,
    },
  });
};

export const getEmployees = (params = {}) => api.get("/employees/", { params });

export const getEmployeeById = (id) => api.get(`/employees/${id}/`);

export const createEmployee = (formData) => api.post("/employees/", formData);

export const updateEmployeeById = (id, formData) => api.put(`/employees/${id}/`, formData);

export const patchEmployeeById = (id, payload, config = {}) =>
  api.patch(`/employees/${id}/`, payload, config);

export const deactivateEmployeeById = (id) => api.delete(`/employees/${id}/`);

export const activateEmployeeById = (id) => api.post(`/employees/${id}/activate/`);

export const getEmployeeRoles = (params = {}) => api.get("/employees/roles/", { params });

export const addEmployeeRole = (payload) => api.post("/employees/roles/", payload);

export const editEmployeeRole = (id, payload) =>
  api.patch(`/employees/roles/${id}/`, payload);

export const deleteEmployeeRole = (id) =>
  api.delete(`/employees/roles/${id}/`);

export const getEmployeeDepartments = (params = {}) => api.get("/employees/departments/", { params });

export const addEmployeeDepartment = (payload) =>
  api.post("/employees/departments/", payload);

export const editEmployeeDepartment = (id, payload) =>
  api.patch(`/employees/departments/${id}/`, payload);

export const deleteEmployeeDepartment = (id) =>
  api.delete(`/employees/departments/${id}/`);