import api from "./api";

/*
 * Self-service endpoints for a logged-in DRIVER, scoped to their own
 * account/shipment. Mirrors driverService.js (the operator-side driver
 * management API) but hits /api/driver/** instead of /api/operator/**.
 */

export const getDashboard = async () => {
    const response = await api.get("/driver/dashboard");
    return response.data;
};

export const updateMyStatus = async (status) => {
    const response = await api.put("/driver/status", { status });
    return response.data;
};

// A driver can now hold several active shipments at once (capacity depends
// on their vehicle: BIKE 10, VAN 20, MINI_TRUCK 30, TRUCK 50), so this
// returns a list rather than a single shipment.
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