import api from "./axiosConfig";
import {
    getRouteByDriver,
    getRouteByShipment,
    getRouteSummary,
    postRouteLocation
} from "./routeApi";

export {
    getRouteByDriver,
    getRouteByShipment,
    getRouteSummary,
    postRouteLocation
};

const authConfig = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
    }
});

export const getDriverOverview = () =>
    api.get("/driver/overview", authConfig());

export const getDriverShipments = (search = "") => {
    const params = search ? { search } : {};
    return api.get("/driver/shipments", { ...authConfig(), params });
};

export const getDeliveredShipments = () =>
    api.get("/driver/shipments/delivered", authConfig());

export const getDriverShipment = (id) =>
    api.get(`/driver/shipments/${id}`, authConfig());

export const updateShipmentStatus = (id, payload) =>
    api.put(`/driver/shipments/${id}/status`, payload, authConfig());

export const getRouteHistory = () =>
    api.get("/driver/route-history", authConfig());

export const getLiveMonitor = (shipmentId) =>
    api.get(`/tracking/monitor/${shipmentId}`, authConfig());

export const updateDriverLocation = (location) =>
    api.put("/tracking/location", location, authConfig());

export const confirmDelivery = (payload) =>
    api.post("/delivery-confirmations", payload, authConfig());

export const saveSignature = (payload) =>
    api.post("/delivery-signatures", payload, authConfig());

export const getNotifications = () =>
    api.get("/notifications", authConfig());

export const sendNotificationToRole = (payload) =>
    api.post("/notifications/send", payload, authConfig());

export const markNotificationRead = (id) =>
    api.put(`/notifications/${id}/read`, {}, authConfig());

export const markAllNotificationsRead = () =>
    api.put("/notifications/read-all", {}, authConfig());

export const deleteNotification = (id) =>
    api.delete(`/notifications/${id}`, authConfig());

export const getProfile = () =>
    api.get("/settings/profile", authConfig());

export const updateProfile = (payload) =>
    api.put("/settings/profile", payload, authConfig());

export const changePassword = (payload) =>
    api.put("/settings/change-password", payload, authConfig());
