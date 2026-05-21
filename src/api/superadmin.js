import api from "./axios";

export const getSuperAdminAnalytics = () => api.get("/accounts/analytics/");

export const getMonthlyGrowthAnalytics = () =>
  api
    .get("/accounts/analytics/monthly-growth/")
    .catch(() => ({ data: { users: [], employees: [], leaves: [], payslips: [] } }));

export const sendSystemNotification = (data) =>
  api.post("/notifications/superadmin/send/", data);

export const getSystemSettings = () => api.get("/superadmin/settings/");

export const getEffectiveSystemSettings = () =>
  api.get("/superadmin/settings/effective/");

export const updateSystemSettings = (data) =>
  api.patch("/superadmin/settings/update/", data);

export const getReportsOverview = () => api.get("/superadmin/reports/");

export const testSmtpEmail = (to) =>
  api.post("/superadmin/settings/test-email/", { to });


export const mfaSendOtp = (userId) =>
  api.post("/superadmin/mfa/send/", { user_id: userId });

export const mfaVerifyOtp = (userId, otp) =>
  api.post("/superadmin/mfa/verify/", { user_id: userId, otp });
