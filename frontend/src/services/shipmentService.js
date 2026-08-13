import api from "./api"; // Use custom axios instance with interceptor

//Get All Shipments
export const getAllShipments = async () => {
    const response = await api.get("/shipments");
    return response.data;
};

// Get Shipment By Id
export const getShipmentById = async (id) => {
    const response = await api.get(`/shipments/${id}`);
    return response.data;
};

// Create Shipment
export const addShipment = async (shipment) => {
    const response = await api.post("/shipments", shipment);
    return response.data;
};

// Update Shipment
export const updateShipment = async (id, shipment) => {
    const response = await api.put(`/shipments/${id}`, shipment);
    return response.data;
};

// Update Shipment Status only (does not touch customer/cost/other fields)
export const updateShipmentStatus = async (trackingId, status) => {
    const response = await api.put(`/shipments/${trackingId}/status`, { status });
    return response.data;
};

// Delete Shipment
export const deleteShipment = async (id) => {
    await api.delete(`/shipments/${id}`);
};

// Update Truck GPS Location
export const updateTruckLocation = async (
    trackingId,
    latitude,
    longitude,
    speed,
    locationName
) => {

    const response = await api.post(
        `/shipments/${trackingId}/location`,
        {
            currentLatitude: latitude,
            currentLongitude: longitude,
            truckSpeed: speed,
            currentLocationName: locationName
        }
    );

    return response.data;
};

// Get Live Tracking
export const getTrackingDetails = async (shipmentId) => {
    const response = await api.get(`/shipments/${shipmentId}/tracking`);
    return response.data;
};