import api from "./axios";

export const createShipment = (data) => {
    return api.post("/shipments", data);
};

export const getMyShipments = () => {
    return api.get("/shipments/my");
};

export const getAllShipments = () => {
    return api.get("/shipments");
};

export const getShipmentStats = () => {
    return api.get("/shipments/stats");
};

export const trackShipment = (trackingNumber) => {
    return api.get(`/shipments/track/${trackingNumber}`);
};

export const getShipmentById = (id) => {
    return api.get(`/shipments/${id}`);
};

export const updateShipmentStatus = (id, data) => {
    return api.patch(`/shipments/${id}/status`, data);
};

export const addTrackingEvent = (id, data) => {
    return api.post(`/shipments/${id}/events`, data);
};

export const getTrackingEvents = (id) => {
    return api.get(`/shipments/${id}/events`);
};

export const deleteShipment = (id) => {
    return api.delete(`/shipments/${id}`);
};

export const updateShipment = (id, data) => {
    return api.patch(`/shipments/${id}`, data);
};

export const getLiveTracking = (id) => {
    return api.get(`/shipments/${id}/live`);
};

export const updateLocation = (id, data) => {
    return api.post(`/shipments/${id}/location`, data);
};

export const getEta = (id) => {
    return api.get(`/shipments/${id}/eta`);
};

export const getForecast = (id) => {
    return api.get(`/shipments/${id}/forecast`);
};

export const getDelayStatus = (id) => {
    return api.get(`/shipments/${id}/delay-status`);
};

export const getShipmentDetail = (id) => {
    return api.get(`/shipments/${id}/detail`);
};
