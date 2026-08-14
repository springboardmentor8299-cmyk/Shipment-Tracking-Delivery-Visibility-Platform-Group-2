import {
    createQuery,
    getMyQueries,
    getAllQueries,
    getMessages,
    sendMessage,
    resolveQuery,
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

export const fetchMessages = async (id) => {
    const response = await getMessages(id);
    return response.data;
};

export const postMessage = async (id, content) => {
    const response = await sendMessage(id, { content });
    return response.data;
};

export const resolveChat = async (id) => {
    const response = await resolveQuery(id);
    return response.data;
};

export const removeQuery = async (id) => {
    await deleteQuery(id);
};
