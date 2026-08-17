import api from "./api";

export const getAllShipments = async () => {
    return await api.get("/shipments");
};

export const createShipment = async (shipment) => {
    return await api.post("/shipments", shipment);
};

export const deleteShipment = async (id) => {
    return await api.delete(`/shipments/${id}`);
};

export const getShipmentById = async (id) => {
    return await api.get(`/shipments/${id}`);
};

export const updateShipment = async (id, shipment) => {
    return await api.put(`/shipments/${id}`, shipment);
};

export const getDriverShipments = async () => {
    return await api.get("/shipments/driver");
};