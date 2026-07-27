import axiosInstance from "./axiosConfig";

export const createShipment = (shipment) => {
    return axiosInstance.post("/shipments", shipment);
};

export const getAllShipments = () => {
    return axiosInstance.get("/shipments");
};

export const getMyShipments = () => {
    return axiosInstance.get("/shipments/my");
};

export const getShipment = (trackingNumber) => {
    return axiosInstance.get(`/shipments/${trackingNumber}`);
};

export const getTrackingHistory = (trackingNumber) => {
    return axiosInstance.get(`/shipments/${trackingNumber}/history`);
};

export const getDeliveryHistory = () => {
    return axiosInstance.get("/shipments/history");
};

export const updateShipmentStatus = (trackingNumber, status) => {
    return axiosInstance.put(
        `/shipments/${trackingNumber}/status`,
        { status }
    );
};

export const getShipmentDetails = (trackingNumber) => {
    return axiosInstance.get(`/shipments/${trackingNumber}`);
};

export const getShipmentHistory = (trackingNumber) => {
    return axiosInstance.get(`/shipments/${trackingNumber}/history`);
};