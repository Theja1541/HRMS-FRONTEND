import { useEffect, useState } from "react";
import { getEffectiveSystemSettings } from "../api/superadmin";
import { useAuth } from "../auth/AuthContext";

/**
 * Custom hook to verify dynamic company-wide RBAC features and granular permissions.
 */
export function useCompanyPermissions() {
  const { user } = useAuth();
  const [companyFeatures, setCompanyFeatures] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let isMounted = true;
    getEffectiveSystemSettings()
      .then((res) => {
        if (isMounted) {
          setCompanyFeatures(res.data?.company_enabled_modules || {});
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [user]);

  /**
   * Check if a specific module action is permitted for the company.
   * @param {string} moduleName - The key representing the module (e.g., 'attendance', 'leave', 'payroll')
   * @param {string} actionName - The specific access right (e.g., 'view', 'create', 'edit', 'delete', 'export', 'approve')
   * @param {string} [pageName] - Optional key representing the subpage (e.g., 'monthly', 'approvals')
   */
  const hasPermission = (moduleName, actionName, pageName = null) => {
    if (!user) return false;
    // Super Admins bypass tenant company permissions
    if (user.role === "SUPER_ADMIN") return true;

    // Standardize module key (e.g., leaves -> leave)
    const compKey = moduleName === "leaves" ? "leave" : moduleName;
    const companyModObj = companyFeatures[compKey];

    if (companyModObj === undefined) {
      return true; // Default to true if not defined to preserve default behaviors
    }

    if (typeof companyModObj === "boolean") {
      return companyModObj;
    }

    if (typeof companyModObj === "object" && companyModObj !== null) {
      if (companyModObj.enabled === false) return false;

      // Check page-level actions if pageName is provided
      if (pageName) {
        // If the page itself is disabled, return false
        if (companyModObj.pages && companyModObj.pages[pageName] === false) {
          return false;
        }

        // Check granular page actions
        if (companyModObj.page_actions && companyModObj.page_actions[pageName]) {
          const pageActions = companyModObj.page_actions[pageName];
          if (pageActions[actionName] !== undefined) {
            return pageActions[actionName] === true;
          }
        }
      }

      // Check module-level actions fallback
      if (companyModObj.actions && companyModObj.actions[actionName] !== undefined) {
        return companyModObj.actions[actionName] === true;
      }
    }

    return true;
  };

  return { hasPermission, companyFeatures, loading };
}
