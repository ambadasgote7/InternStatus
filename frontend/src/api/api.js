import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:7777/api",
  withCredentials: true, // ✅ REQUIRED FOR COOKIES
});

// ❌ REMOVE request interceptor (no need for token header)

API.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      const path = window.location.pathname;

      const isPublic =
        path.startsWith("/login") ||
        path.startsWith("/admin/login") ||
        path.startsWith("/setup-account") ||
        path.startsWith("/reset-password");

      // ✅ avoid infinite redirect loop
      if (!isPublic) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default API;