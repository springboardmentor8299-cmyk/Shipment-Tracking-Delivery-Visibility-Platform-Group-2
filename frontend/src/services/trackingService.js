import api from "./api";

export const updateLocation = async (id, latitude, longitude) => {
    console.log(localStorage.getItem("token"));
    return await api.put(`/shipments/${id}/location`, {
        latitude,
        longitude
    });
};