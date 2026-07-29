import {
    createShipment,
    getMyShipments,
    getAllShipments,
    getShipmentStats,
    trackShipment,
    getShipmentById,
    updateShipmentStatus,
    addTrackingEvent,
    getTrackingEvents,
    deleteShipment,
    updateShipment,
    getLiveTracking,
    updateLocation,
    getEta,
    getForecast,
    getShipmentDetail,
} from "../api/shipmentApi";

export const create = async (data) => {
    const response = await createShipment(data);
    return response.data;
};

export const fetchMyShipments = async () => {
    const response = await getMyShipments();
    return response.data;
};

export const fetchAllShipments = async () => {
    const response = await getAllShipments();
    return response.data;
};

export const fetchStats = async () => {
    const response = await getShipmentStats();
    return response.data;
};

export const track = async (trackingNumber) => {
    const response = await trackShipment(trackingNumber);
    return response.data;
};

export const fetchShipmentById = async (id) => {
    const response = await getShipmentById(id);
    return response.data;
};

export const updateStatus = async (id, data) => {
    const response = await updateShipmentStatus(id, data);
    return response.data;
};

export const addEvent = async (id, data) => {
    const response = await addTrackingEvent(id, data);
    return response.data;
};

export const fetchTrackingEvents = async (id) => {
    const response = await getTrackingEvents(id);
    return response.data;
};

export const removeShipment = async (id) => {
    await deleteShipment(id);
};

export const updateShipmentDetails = async (id, data) => {
    const response = await updateShipment(id, data);
    return response.data;
};

export const fetchLiveTracking = async (id) => {
    const response = await getLiveTracking(id);
    return response.data;
};

export const pushLocation = async (id, data) => {
    const response = await updateLocation(id, data);
    return response.data;
};

export const fetchEta = async (id) => {
    const response = await getEta(id);
    return response.data;
};

export const fetchForecast = async (id) => {
    const response = await getForecast(id);
    return response.data;
};

export const fetchDelayStatus = async (id) => {
    const response = await getDelayStatus(id);
    return response.data;
};

export const fetchShipmentDetail = async (id) => {
    const response = await getShipmentDetail(id);
    return response.data;
};
