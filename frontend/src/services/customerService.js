import api from "./api";

// Customer Dashboard

export const getCustomerDashboard = async () => {

    const response = await api.get(
        "/customer/dashboard"
    );

    return response.data;
};


// My Shipments
export const getCustomerShipments = async () => {

    const response = await api.get(
        "/customer/shipments"
    );

    return response.data;
};


// Customer Profile

export const getCustomerProfile = async () => {

    const response = await api.get(
        "/customer/profile"
    );

    return response.data;
};


// Update Customer Phone Number
export const updateCustomerPhone = async (
    phoneNumber
) => {

    const response = await api.put(
        "/customer/profile/phone",
        {
            phoneNumber: phoneNumber
        }
    );

    return response.data;
};


// Shipment Tracking

export const getShipmentTracking = async (
    trackingId
) => {

    const response = await api.get(
        `/customer/tracking/${trackingId}`
    );

    return response.data;
};


// Delivery Bill (same data behind the admin "Generate Bill" PDF,
// scoped to the logged-in customer's own shipment)
export const getCustomerBill = async (
    trackingId
) => {

    const response = await api.get(
        `/customer/pod/${trackingId}`
    );

    return response.data;
};