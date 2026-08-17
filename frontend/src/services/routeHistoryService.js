import api from "./api";

export const getRouteHistory = (shipmentId) => {
    return api.get(`/route-history/${shipmentId}`);
};