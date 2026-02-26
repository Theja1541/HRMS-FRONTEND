// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://127.0.0.1:8000/api/",
// });

// /* ================= REQUEST INTERCEPTOR ================= */
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("accessToken");

//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// /* ================= RESPONSE INTERCEPTOR ================= */
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     // If backend is OFF → don't loop infinitely
//     if (!error.response) {
//       console.error("Backend not reachable.");
//       return Promise.reject(error);
//     }

//     // 401 handling
//     if (
//       error.response.status === 401 &&
//       !originalRequest._retry
//     ) {
//       originalRequest._retry = true;

//       try {
//         const refreshToken = localStorage.getItem("refreshToken");

//         if (!refreshToken) {
//           forceLogout();
//           return Promise.reject(error);
//         }

//         const res = await axios.post(
//           "http://127.0.0.1:8000/api/accounts/token/refresh/",
//           { refresh: refreshToken }
//         );

//         localStorage.setItem("accessToken", res.data.access);

//         originalRequest.headers.Authorization =
//           `Bearer ${res.data.access}`;

//         return api(originalRequest);

//       } catch (refreshError) {
//         forceLogout();
//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// /* ================= FORCE LOGOUT ================= */
// function forceLogout() {
//   localStorage.removeItem("authUser");
//   localStorage.removeItem("accessToken");
//   localStorage.removeItem("refreshToken");

//   // 🔥 Prevent infinite redirect loop
//   if (window.location.pathname !== "/login") {
//     window.location.href = "/login";
//   }
// }

// export default api;



import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

/* ================= REQUEST INTERCEPTOR ================= */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ================= RESPONSE INTERCEPTOR ================= */
api.interceptors.response.use(
  (response) => response,
  async (error) => {

    const originalRequest = error.config;

    // 🚨 If backend is OFF
    if (!error.response) {
      console.error("Backend not reachable.");
      return Promise.reject(error);
    }

    // 🔥 DO NOT refresh for login or refresh endpoints
    if (
      originalRequest.url.includes("/accounts/login/") ||
      originalRequest.url.includes("/accounts/token/refresh/")
    ) {
      return Promise.reject(error);
    }

    // 🔐 Handle 401 (Token expired)
    if (
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          forceLogout();
          return Promise.reject(error);
        }

        const res = await axios.post(
          "http://127.0.0.1:8000/api/accounts/token/refresh/",
          { refresh: refreshToken }
        );

        const newAccess = res.data.access;

        localStorage.setItem("accessToken", newAccess);

        originalRequest.headers.Authorization =
          `Bearer ${newAccess}`;

        return api(originalRequest);

      } catch (refreshError) {
        forceLogout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/* ================= FORCE LOGOUT ================= */
function forceLogout() {

  localStorage.removeItem("authUser");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");

  // Prevent infinite redirect loop
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

export default api;
