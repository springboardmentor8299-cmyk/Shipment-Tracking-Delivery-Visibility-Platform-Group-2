import api from "./api";

// Admin-only manual notification push — talks to /api/admin/notifications/**.
// Backend restricts these routes to ADMIN via SecurityConfig, same as every
// other /api/admin/** endpoint.

// Feeds the recipient pickers: per-customer tracking IDs, plus named
// business clients / logistics operators / support agents.
export const getNotificationRecipientOptions = async () => {
    const response = await api.get("/admin/notifications/recipients");
    return response.data; // { customers, businessClients, logisticsOperators, supportAgents }
};

export const broadcastNotification = async ({
    roles,
    userIds,
    title,
    message,
    type,
    trackingId,
}) => {
    const response = await api.post("/admin/notifications/broadcast", {
        roles: roles || [],
        userIds: userIds || [],
        title,
        message,
        type: type || "SYSTEM",
        trackingId: trackingId || null,
    });
    return response.data; // { targetedRoles, matchedUserCount, notifiedUserCount }
};
