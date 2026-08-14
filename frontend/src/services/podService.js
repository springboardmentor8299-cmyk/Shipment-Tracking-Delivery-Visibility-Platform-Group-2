import { capturePod, getPodByShipment, getAllPods, verifyPod } from "../api/podApi";

export const capture = async (shipmentId, data) => {
    const response = await capturePod(shipmentId, data);
    return response.data;
};

export const fetchPodByShipment = async (shipmentId) => {
    const response = await getPodByShipment(shipmentId);
    return response.data;
};

export const fetchAllPods = async () => {
    const response = await getAllPods();
    return response.data;
};

export const verify = async (id, data) => {
    const response = await verifyPod(id, data);
    return response.data;
};
