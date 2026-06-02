import api from "./axios";

/* ===============================
   APPLY LEAVE (Employee)
=============================== */

export const applyLeave = async (data) => {
  return await api.post("/leaves/apply/", data);
};


/* ===============================
   MY LEAVE BALANCE
=============================== */

export const getMyLeaveBalance = async () => {
  return await api.get("/leaves/my-balance/");
};


/* ===============================
   LEAVE REQUESTS (with optional filters)
   Used by Dashboard, LeaveDashboard, etc.
   Supports both res.data and res.data.results response shapes.
=============================== */

export const getLeaveRequests = (filters = {}) =>
  api.get("/leaves/requests/", { params: filters });

/* ===============================
   HR – GET ALL LEAVE REQUESTS
=============================== */

export const getAllLeaveRequests = async () => {
  return await api.get("/leaves/all/");
};


/* ===============================
   HR – APPROVE
=============================== */

export const approveLeave = async (leaveId) => {
  return await api.post(`/leaves/approve/${leaveId}/`);
};


/* ===============================
   HR – REJECT
=============================== */

export const rejectLeave = async (leaveId) => {
  return await api.post(`/leaves/reject/${leaveId}/`);
};


/* ===============================
   LEAVE ANALYTICS (Optimized count)
=============================== */

export const getLeaveAnalytics = async () => {
  return await api.get("/leaves/analytics/");
};