import api from "./axios";

/** SuperAdmin: paginated audit logs. Params: company_id, action, user_id, page, page_size */
export const getSuperAdminAuditLogs = (params = {}) => {
  return api.get("/audit/logs/superadmin/", { params });
};
