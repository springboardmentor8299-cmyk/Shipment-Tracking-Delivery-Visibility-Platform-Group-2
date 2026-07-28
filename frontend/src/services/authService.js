import api from "./api";

export const register = async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
};

export const login = async (loginData) => {
    const response = await api.post("/auth/login", loginData);
    return response.data;
};