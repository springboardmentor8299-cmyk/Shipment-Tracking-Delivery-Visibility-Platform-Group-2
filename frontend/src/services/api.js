import axios from "axios";

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

api.interceptors.request.use((config) => {

    const token = localStorage.getItem("token");

    const isAuthRequest =
        config.url === "/auth/login" ||
        config.url === "/auth/register" ||
        config.url === "/auth/google" ||
        config.url === "/auth/forgot-password" ||
        config.url === "/auth/reset-password";

    if (token && !isAuthRequest) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;