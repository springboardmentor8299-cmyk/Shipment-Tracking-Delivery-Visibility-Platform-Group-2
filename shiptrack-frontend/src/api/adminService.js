import axiosInstance from "./axiosConfig";

export const createStaff = (staffData) => {
    return axiosInstance.post("/admin/users", staffData);
};

export const getAllUsers = () => {
    return axiosInstance.get("/admin/users");
};

export const getAllShipments = () => {
    return axiosInstance.get("/shipments");
};
export const getDashboardStats = () => {
    return axiosInstance.get("/admin/dashboard");
};