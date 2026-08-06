    import api from "./api";

/* ======================================================
   SUPPORT DASHBOARD
====================================================== */

// Dashboard Statistics
export const getSupportDashboard = async () => {
    const response = await api.get("/support/dashboard");
    return response.data;
};

// Get All Shipments
export const getAllShipments = async () => {
    const response = await api.get("/support/shipments","/admin/support/requests");
    return response.data;
};



// Get All Users
export const getAllUsers = async () => {
    const response = await api.get("/users");
    return response.data;
};

// Update Shipment
export const updateShipment = async (id, shipment) => {
    const response = await api.put(
        `/support/shipments/${id}`,
        shipment
    );

    return response.data;
};

/* ======================================================
   CUSTOMER SUPPORT
====================================================== */

// Submit Shipment Request
export const submitShipmentRequest = async (request) => {

    const response = await api.post(
        "/customer/support/shipment",
        request
    );

    return response.data;
};

// Raise Issue
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

// Customer My Requests
export const getMyRequests = async () => {

    const response = await api.get(
        "/customer/support/my-requests"
    );

    return response.data;
};

/* ======================================================
   SUPPORT AGENT
====================================================== */

// All Requests
export const getAllSupportRequests = async () => {

    const response = await api.get(
        "/support/requests"
    );

    return response.data;
};

// Single Request
export const getSupportRequest = async (id) => {

    const response = await api.get(
        `/support/requests/${id}`
    );

    return response.data;
};

// Assign Request
export const assignSupportRequest = async (id) => {

    const response = await api.put(
        `/support/requests/${id}/assign`
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
                status,
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