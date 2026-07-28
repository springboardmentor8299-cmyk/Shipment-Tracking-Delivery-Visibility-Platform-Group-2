import api from "./api";

export const getOperatorDashboard = async () => {
    const response = await api.get("/operator/dashboard");
    return response.data;
};

// ==============================
// Get All Shipments
// ==============================
export const getAllShipments = async () => {

    const response = await api.get(
        "/operator/shipments",
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
        `/operator/shipments/${id}`,
        shipment,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        }
    );

    return response.data;
};