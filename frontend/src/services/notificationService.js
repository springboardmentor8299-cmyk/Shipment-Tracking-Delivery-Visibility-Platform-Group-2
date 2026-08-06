import api from "./api";

// =====================================================================
// Notification service
//
// Talks to /api/notifications/**. Endpoints are role-scoped server-side —
// an admin sees system-wide notifications, a customer only sees their own,
// based on the JWT, same as every other endpoint in this app.
// =====================================================================

// (i)(ii)(iii)(iv) Shipment updates / ETA / delivery alerts / delay
// warnings all come back as one unified list, distinguished by `type`.
export const getNotifications = async () => {
    const response = await api.get("/notifications");
    return response.data;
};

export const markAsRead = async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
};

export const markAllAsRead = async () => {
    const response = await api.patch("/notifications/read-all");
    return response.data;
};

export const deleteNotification = async (id) => {
    await api.delete(`/notifications/${id}`);
};

// (v)(vi)(vii) Email / SMS / push channel + category preferences
export const getNotificationPreferences = async () => {
    const response = await api.get("/notifications/preferences");
    return response.data;
};

export const updateNotificationPreferences = async (preferences) => {
    const response = await api.put("/notifications/preferences", preferences);
    return response.data;
};
