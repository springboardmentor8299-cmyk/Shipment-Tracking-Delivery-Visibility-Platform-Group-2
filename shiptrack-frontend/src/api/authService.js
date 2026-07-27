import axiosInstance from "./axiosConfig";

export const register = async (userData) => {

    const response = await axiosInstance.post(
        "/auth/register",
        userData
    );

    return response.data;
};

export const login = async (loginData) => {

    const response = await axiosInstance.post(
        "/auth/login",
        loginData
    );

    return response.data;
};