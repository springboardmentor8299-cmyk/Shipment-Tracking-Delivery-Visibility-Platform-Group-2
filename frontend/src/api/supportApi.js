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

export const getMessages = (id) => {
    return api.get(`/support-queries/${id}/messages`);
};

export const sendMessage = (id, data) => {
    return api.post(`/support-queries/${id}/messages`, data);
};

export const resolveQuery = (id) => {
    return api.patch(`/support-queries/${id}/resolve`);
};

export const deleteQuery = (id) => {
    return api.delete(`/support-queries/${id}`);
};
