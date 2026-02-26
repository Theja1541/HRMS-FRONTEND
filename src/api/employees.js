import api from "./axios";

export const checkEmployeeId = async (employeeId, employeePk = null) => {
  return await api.get("/employees/check-id/", {
    params: {
      employee_id: employeeId,
      employee_pk: employeePk,
    },
  });
};