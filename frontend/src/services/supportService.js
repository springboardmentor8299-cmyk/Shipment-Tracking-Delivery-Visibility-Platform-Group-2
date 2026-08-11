import api from "./api";

// Support Dashboard
export const getSupportDashboard = async () => {
    const response = await api.get("/support/dashboard");
    return response.data;
};

// Shipments
export const getAllShipments = async () => {
    const response = await api.get("/support/shipments");
    return response.data;
};

export const updateShipment = async (id, shipment) => {
    const response = await api.put(
        `/support/shipments/${id}`,
        shipment
    );
    return response.data;
};

// Users
export const getAllUsers = async () => {
    const response = await api.get("/users");
    return response.data;
};

// Customer Support
export const submitShipmentRequest = async (request) => {
    const response = await api.post(
        "/customer/support/shipment",
        request
    );
    return response.data;
};

export const raiseIssue = async (request, attachment) => {
    const formData = new FormData();

    formData.append(
        "request",
        new Blob(
            [JSON.stringify(request)],
            {
                type: "application/json",
            }
        )
    );

    if (attachment) {
        formData.append("attachment", attachment);
    }

    const response = await api.post(
        "/customer/support/issue",
        formData
    );

    return response.data;
};

export const getMyRequests = async () => {
    const response = await api.get(
        "/customer/support/my-requests"
    );
    return response.data;
};

// Support Requests
export const getAllSupportRequests = async () => {
    const response = await api.get(
        "/support/requests"
    );
    return response.data;
};

export const getSupportRequestById = async (id) => {
    const response = await api.get(
        `/support/requests/${id}`
    );
    return response.data;
};

export const getMySupportRequests = async () => {
    const response = await api.get("/support/requests/my-requests");
    return response.data;
};

// Assign Support Request
export const assignSupportRequest = async (id, agentId) => {
    const response = await api.put(
        `/support/requests/${id}/assign/${agentId}`
    );
    return response.data;
};

// Update Status
export const updateSupportRequestStatus = async (
    id,
    status
) => {
    const response = await api.put(
        `/support/requests/${id}/status`,
        null,
        {
            params: {
                status: status,
            },
        }
    );
    return response.data;
};

// Resolve Request
export const resolveSupportRequest = async (id) => {
    const response = await api.put(
        `/support/requests/${id}/resolve`
    );
    return response.data;
};

export const getSupportAgents = async () => {
    const response = await api.get("/support/requests/agents");
    return response.data;
};