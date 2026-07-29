import api from "./axios";

export const createQuery = (data) => {
    return api.post("/support-queries", data);
};

export const getMyQueries = () => {
    return api.get("/support-queries/my");
};

export const getAllQueries = () => {
    return api.get("/support-queries");
};

export const respondToQuery = (id, data) => {
    return api.patch(`/support-queries/${id}/respond`, data);
};

export const deleteQuery = (id) => {
    return api.delete(`/support-queries/${id}`);
};