import api from "./api";

// ================================
// Dashboard Statistics
// ================================

export const getCustomerDashboard = async () => {

    const response = await api.get("/customer/dashboard");

    return response.data;

};


// ================================
// My Shipments
// ================================

export const getCustomerShipments = async () => {

    const response = await api.get("/customer/shipments");

    return response.data;

};


// ================================
// My Profile
// ================================

export const getCustomerProfile = async () => {

    const response = await api.get("/customer/profile");

    return response.data;

};


// ================================
// Shipment Tracking
// ================================

export const getShipmentTracking = async (trackingId) => {

    const response = await api.get(`/customer/tracking/${trackingId}`);

    return response.data;

};