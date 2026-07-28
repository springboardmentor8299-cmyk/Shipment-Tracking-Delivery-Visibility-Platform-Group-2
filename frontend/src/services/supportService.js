import api from "./api";

// ==============================
// Dashboard Statistics
// ==============================

export const getSupportDashboard = async () => {

    const response = await api.get(
        "/support/dashboard",
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        }
    );

    return response.data;

};

// ==============================
// Get All Shipments
// ==============================

export const getAllShipments = async () => {

    const response = await api.get(
        "/support/shipments",
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        }
    );

    return response.data;

};

// ==============================
// Get All Users
// ==============================

export const getAllUsers = async () => {

    const response = await api.get(
        "/users",
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        }
    );

    return response.data;

};

// ==============================
// Update Shipment
// ==============================

export const updateShipment = async (id, shipment) => {

    const response = await api.put(
        `/support/shipments/${id}`,
        shipment,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        }
    );

    return response.data;

};