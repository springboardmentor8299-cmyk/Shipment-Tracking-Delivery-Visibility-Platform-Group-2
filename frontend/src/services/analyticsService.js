import api from "./api";

export const getMonthlyShipmentOverview = async () => {
    const response = await api.get("/admin/dashboard/monthly-overview", {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    });
    return response.data;
};

export const getShipmentStatusCounts = async () => {
    const response = await api.get("/admin/dashboard/status-counts", {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    });
    return response.data;
};
