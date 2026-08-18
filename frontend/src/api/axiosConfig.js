import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT from AuthContext's storage on every request
api.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem("cargoflow_auth");
    let token = null;

    if (stored) {
      const parsed = JSON.parse(stored);
      token = parsed?.token || null;
    }

    if (!token) {
      token = localStorage.getItem("token");
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // ignore malformed storage, request goes out unauthenticated
  }
  return config;
});

// If the token is rejected/expired, clear it and bounce to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("cargoflow_auth");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;