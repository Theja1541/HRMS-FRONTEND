import api from "./axios";

export const getSuperAdminAnalytics = () => {
  return api.get("/accounts/superadmin/analytics/");
};

export const getMonthlyGrowthAnalytics = () => {
  return api.get("superadmin/analytics/monthly-growth/");
};
