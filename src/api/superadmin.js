import api from "./axios";

export const getSuperAdminAnalytics = () => api.get("/accounts/analytics/");

export const getMonthlyGrowthAnalytics = () =>
  api
    .get("/accounts/analytics/monthly-growth/")
    .catch(() => ({ data: { users: [], employees: [], leaves: [], payslips: [] } }));

export const sendSystemNotification = (data) =>
  api.post("/notifications/superadmin/send/", data);

export const getSystemSettings = () => api.get("/superadmin/settings/");

let effectiveSettingsCache = null;
let effectiveSettingsCacheTime = 0;
const SETTINGS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const getEffectiveSystemSettings = () => {
  const now = Date.now();
  if (effectiveSettingsCache && (now - effectiveSettingsCacheTime < SETTINGS_CACHE_TTL)) {
    return Promise.resolve(effectiveSettingsCache);
  }
  return api.get("/superadmin/settings/effective/").then(res => {
    effectiveSettingsCache = res;
    effectiveSettingsCacheTime = now;
    return res;
  });
};

export const getCachedEffectiveSettings = () => {
  const now = Date.now();
  if (effectiveSettingsCache && (now - effectiveSettingsCacheTime < SETTINGS_CACHE_TTL)) {
    return effectiveSettingsCache;
  }
  return null;
};

export const updateSystemSettings = (data) =>
  api.patch("/superadmin/settings/update/", data);

export const getReportsOverview = (params = { months: 12 }) => {
  const query = new URLSearchParams(params).toString();
  return api.get(`/superadmin/reports/?${query}`);
};

export const testSmtpEmail = (to) =>
  api.post("/superadmin/settings/test-email/", { to });


export const mfaSendOtp = (userId) =>
  api.post("/superadmin/mfa/send/", { user_id: userId });

export const mfaVerifyOtp = (userId, otp) =>
  api.post("/superadmin/mfa/verify/", { user_id: userId, otp });
