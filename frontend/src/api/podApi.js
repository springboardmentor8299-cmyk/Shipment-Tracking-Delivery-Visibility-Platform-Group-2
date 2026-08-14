import api from "./axios";

export const capturePod = (shipmentId, data) => {
    return api.post(`/shipments/${shipmentId}/proof-of-delivery`, data);
};

export const getPodByShipment = (shipmentId) => {
    return api.get(`/shipments/${shipmentId}/proof-of-delivery`);
};

export const getAllPods = () => {
    return api.get("/proof-of-delivery");
};

export const verifyPod = (id, data) => {
    return api.patch(`/proof-of-delivery/${id}/verify`, data);
};
