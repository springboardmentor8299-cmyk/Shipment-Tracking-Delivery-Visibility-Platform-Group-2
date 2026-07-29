import {
    createQuery,
    getMyQueries,
    getAllQueries,
    respondToQuery,
    deleteQuery,
} from "../api/supportApi";

export const submitQuery = async (data) => {
    const response = await createQuery(data);
    return response.data;
};

export const fetchMyQueries = async () => {
    const response = await getMyQueries();
    return response.data;
};

export const fetchAllQueries = async () => {
    const response = await getAllQueries();
    return response.data;
};

export const respond = async (id, data) => {
    const response = await respondToQuery(id, data);
    return response.data;
};

export const removeQuery = async (id) => {
    await deleteQuery(id);
};