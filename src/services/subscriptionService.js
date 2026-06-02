import { getCurrentSubscription } from "../api/paymentApi";

/**
 * Checks if the current subscription contains module level permissions.
 * 
 * @param {String} moduleName Name of the HRMS module (e.g., 'payroll', 'daybook')
 * @param {Object} enabledModules Dictionary from active company subscription features
 * @returns {Boolean}
 */
export const hasAccessToModule = (moduleName, enabledModules) => {
  if (!enabledModules) return true; // Default fallback to bypass check if not loaded
  return enabledModules[moduleName] === true;
};

/**
 * Formats a raw number into a clean INR currency format.
 * 
 * @param {Number|String} amount Price
 * @returns {String} formatted price
 */
export const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
};

/**
 * Fetch and return active subscription data details.
 */
export const fetchActiveSubscription = async () => {
  try {
    const res = await getCurrentSubscription();
    return res.data;
  } catch (error) {
    console.error("Failed to load subscription status:", error);
    throw error;
  }
};
