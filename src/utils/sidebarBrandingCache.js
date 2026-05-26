import { getCompanyBranding } from "../api/companies";

/** Module cache — clear on login/logout so SPA sessions never reuse stale branding. */
let sidebarBrandingCache = { key: null, data: null, promise: null };

export function sidebarBrandingCacheKey(u) {
  if (!u) return null;
  return `${u.companyId ?? ""}:${u.id ?? ""}`;
}

export function clearSidebarBrandingCache() {
  sidebarBrandingCache = { key: null, data: null, promise: null };
}

export async function fetchSidebarBranding(user) {
  const key = sidebarBrandingCacheKey(user);
  if (!key) return null;
  if (sidebarBrandingCache.key === key && sidebarBrandingCache.promise === null) {
    return sidebarBrandingCache.data;
  }
  if (sidebarBrandingCache.promise && sidebarBrandingCache.key === key) {
    return sidebarBrandingCache.promise;
  }
  if (sidebarBrandingCache.key !== key) {
    sidebarBrandingCache.data = null;
  }
  sidebarBrandingCache.key = key;
  const p = getCompanyBranding()
    .then((res) => {
      if (sidebarBrandingCache.promise !== p) return sidebarBrandingCache.data;
      sidebarBrandingCache.data = res.data ?? null;
      sidebarBrandingCache.promise = null;
      return sidebarBrandingCache.data;
    })
    .catch(() => {
      if (sidebarBrandingCache.promise !== p) return sidebarBrandingCache.data;
      sidebarBrandingCache.promise = null;
      if (sidebarBrandingCache.key === key) {
        sidebarBrandingCache.data = null;
        sidebarBrandingCache.key = null;
      }
      return null;
    });
  sidebarBrandingCache.promise = p;
  return p;
}
