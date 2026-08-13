import api from "./api";

export const getDashboard = async () => {
    const response = await api.get("/driver/dashboard");
    return response.data;
};

export const updateMyStatus = async (status) => {
    const response = await api.put("/driver/status", { status });
    return response.data;
};

export const getActiveShipments = async () => {
    const response = await api.get("/driver/shipments");
    return response.data;
};

export const updateShipmentStatus = async (trackingId, status) => {
    const response = await api.put(
        `/driver/shipments/${trackingId}/status`,
        { status }
    );
    return response.data;
};

export const getHistory = async () => {
    const response = await api.get("/driver/history");
    return response.data;
};

export const getProfile = async () => {
    const response = await api.get("/driver/profile");
    return response.data;
};

export const changePassword = async (currentPassword, newPassword) => {
    const response = await api.put("/driver/profile/password", {
        currentPassword,
        newPassword,
    });
    return response.data;
};