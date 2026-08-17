import api from "./api";

export const saveProof = (proof) => {
    return api.post("/proof-of-delivery", proof);
};

export const getProof = (shipmentId) => {
    return api.get(`/proof-of-delivery/${shipmentId}`);
};