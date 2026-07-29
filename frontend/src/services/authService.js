import { loginUser, registerUser } from "../api/authApi";

export const register = async (userData) => {

    const response = await registerUser(userData);

    return response.data;

};

export const login = async (credentials) => {

    const response = await loginUser(credentials);

    return response.data;

};