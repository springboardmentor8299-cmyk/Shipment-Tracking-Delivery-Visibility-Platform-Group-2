import api from "./api";

/*
 * Expected backend endpoints (to be implemented alongside a DRIVER role /
 * Driver entity). Kept RESTful and consistent with operatorService.js so the
 * backend team has a clear contract to build against:
 *
 *   GET    /operator/drivers                     -> Driver[]
 *   POST   /operator/drivers                      -> Driver
 *   PUT    /operator/drivers/{id}                 -> Driver
 *   DELETE /operator/drivers/{id}                 -> void
 *   PUT    /operator/drivers/{id}/status           -> Driver   (body: { status })
 *   PUT    /operator/shipments/{shipmentId}/assign-driver
 *                                                   -> Shipment (body: { driverId })
 *   PUT    /operator/shipments/{shipmentId}/unassign-driver -> Shipment
 */

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

// Get shipments that are created/picked up but have no driver assigned yet
export const getUnassignedShipments = async () => {
    const response = await api.get("/operator/shipments/unassigned");
    return response.data;
};

// Assign a shipment to a driver -> triggers a notification to that driver
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
