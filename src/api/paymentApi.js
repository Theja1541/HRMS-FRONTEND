import api from "./axios";

/** Get all active subscription plans (Public) */
export const getSubscriptionPlans = () => api.get("/subscriptions/plans/");

/** Create a new Razorpay order for subscription (Admin only) */
export const createPaymentOrder = (planId, billingCycle) =>
  api.post("/payments/create-order/", { plan_id: planId, billing_cycle: billingCycle });

/** Verify the Razorpay payment signature and activate subscription (Admin only) */
export const verifyPaymentSignature = (verificationData) =>
  api.post("/payments/verify/", verificationData);

/** Fetch paginated transactional log history (Admin only) */
export const getPaymentHistory = (page = 1, pageSize = 10) =>
  api.get("/payments/history/", { params: { page, page_size: pageSize } });

/** Get current active subscription details, features, and remaining days */
export const getCurrentSubscription = () => api.get("/subscriptions/current/");

