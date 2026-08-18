import api from "../api/axiosConfig";



export const loginUser = (data) => {

    return api.post(
        "/api/auth/login",
        data
    );

};



export const registerUser = (data) => {
    return api.post(
        "/api/auth/register",
        data
    );
};

export const forgotPassword = (data) => {
    return api.post(
        "/api/auth/forgot-password",
        data
    );
};