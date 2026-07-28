import api from "./api";

// ==========================================
// CREATE TICKET
// ==========================================

export const createTicket = async (ticket) => {

    const response = await api.post(

        "/support/tickets",

        ticket,

        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        }

    );

    return response.data;

};

// ==========================================
// GET ALL TICKETS
// ==========================================

export const getAllTickets = async () => {

    const response = await api.get(

        "/support/tickets",

        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        }

    );

    return response.data;

};

// ==========================================
// GET TICKET BY ID
// ==========================================

export const getTicketById = async (id) => {

    const response = await api.get(

        `/support/tickets/${id}`,

        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        }

    );

    return response.data;

};

// ==========================================
// UPDATE TICKET
// ==========================================

export const updateTicket = async (id, ticket) => {

    const response = await api.put(

        `/support/tickets/${id}`,

        ticket,

        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        }

    );

    return response.data;

};

// ==========================================
// DELETE TICKET
// ==========================================

export const deleteTicket = async (id) => {

    const response = await api.delete(

        `/support/tickets/${id}`,

        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        }

    );

    return response.data;

};