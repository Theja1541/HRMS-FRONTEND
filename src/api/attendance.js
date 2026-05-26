import axiosInstance from "./axios";

export const getAttendanceDashboardSummary = async () => {
  return await axiosInstance.get("/attendance/dashboard-summary/");
};

export const getDepartmentDistribution = async () => {
  return await axiosInstance.get("/employees/department-distribution/");
};
