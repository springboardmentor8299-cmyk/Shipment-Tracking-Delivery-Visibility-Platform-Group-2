import api from "./api";

// ==============================
// Dashboard Statistics
// ==============================

export const getBusinessDashboard = async () => {

    const response = await api.get(
        "/business/dashboard",
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        }
    );

    return response.data;

};

// ==============================
// Get Business Shipments
// ==============================

export const getAllShipments = async () => {

    const response = await api.get(
        "/business/shipments",
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
        `/business/shipments/${id}`,
        shipment,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        }
    );

    return response.data;

};