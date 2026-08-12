import api from "./axiosConfig";

const authHeaders = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
    }
});

export const getDrivers = (search = "") => {
    const params = search ? { params: { search } } : {};
    return api.get("/admin/drivers", { ...authHeaders(), ...params });
};

export const getDriverStats = () =>
    api.get("/admin/drivers/stats", authHeaders());

export const addDriver = (data) =>
    api.post("/admin/drivers", data, authHeaders());

export const updateDriver = (id, data) =>
    api.put(`/admin/drivers/${id}`, data, authHeaders());

export const setDriverActive = (id, active) =>
    api.put(`/admin/drivers/${id}/active`, null, {
        ...authHeaders(),
        params: { active }
    });

export const deleteDriver = (id) =>
    api.delete(`/admin/drivers/${id}`, authHeaders());

export const getDriverPerformance = (id) =>
    api.get(`/admin/drivers/${id}/performance`, authHeaders());

export const getDriverShipments = (id) =>
    api.get(`/admin/drivers/${id}/shipments`, authHeaders());

export const getDriverRouteHistory = (id) =>
    api.get(`/admin/drivers/${id}/route-history`, authHeaders());

export const getDriverLocations = () =>
    api.get("/admin/drivers/locations", authHeaders());

export const getLiveShipmentStatus = () =>
    api.get("/admin/drivers/shipments/live-status", authHeaders());

export const getLiveShipmentMonitor = (shipmentId) =>
    api.get(`/tracking/monitor/${shipmentId}`, authHeaders());

export const getDriverNotifications = () =>
    api.get("/admin/drivers/notifications", authHeaders());

export const assignShipmentDriver = (shipmentId, driverId) =>
    api.put(`/shipments/${shipmentId}/driver`, null, {
        ...authHeaders(),
        params: { driverId: driverId || null }
    });
