import api from "./axiosConfig";

const authConfig = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
    }
});

export const postRouteLocation = (payload) =>
    api.post("/routes/location", payload, authConfig());

export const getRouteByShipment = (shipmentId) =>
    api.get(`/routes/${shipmentId}`, authConfig());

export const getRouteByDriver = (driverId) =>
    api.get(`/routes/driver/${driverId}`, authConfig());

export const getRouteSummary = (shipmentId) =>
    api.get(`/routes/${shipmentId}/summary`, authConfig());
