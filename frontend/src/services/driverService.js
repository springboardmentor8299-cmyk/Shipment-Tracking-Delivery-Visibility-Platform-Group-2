import api from "./api";


export const getAllDrivers = async () => {
    const response = await api.get("/operator/drivers");
    return response.data;
};

export const createDriver = async (driver) => {
    const response = await api.post("/operator/drivers", driver);
    return response.data;
};

export const updateDriver = async (id, driver) => {
    const response = await api.put(`/operator/drivers/${id}`, driver);
    return response.data;
};

export const deleteDriver = async (id) => {
    const response = await api.delete(`/operator/drivers/${id}`);
    return response.data;
};

export const getUnassignedShipments = async () => {
    const response = await api.get("/operator/shipments/unassigned");
    return response.data;
};

export const assignShipmentToDriver = async (shipmentId, driverId) => {
    const response = await api.put(
        `/operator/shipments/${shipmentId}/assign-driver`,
        { driverId }
    );
    return response.data;
};

export const unassignShipmentFromDriver = async (shipmentId) => {
    const response = await api.put(
        `/operator/shipments/${shipmentId}/unassign-driver`
    );
    return response.data;
};
