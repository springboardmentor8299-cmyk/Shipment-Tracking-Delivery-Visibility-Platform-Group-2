import api from "./axios";

export const getAnalyticsOverview = () => {
    return api.get("/analytics/overview");
};

export const getTrends = (days) => {
    return api.get("/analytics/trends", { params: { days } });
};

export const getStatusDistribution = (days) => {
    return api.get("/analytics/status-distribution", { params: { days } });
};

export const getDeliveryReport = (days) => {
    return api.get("/analytics/report/delivery-performance", { params: { days, format: "json" } });
};

export const getDeliveryReportCsv = (days) => {
    return api.get("/analytics/report/delivery-performance", {
        params: { days, format: "csv" },
        responseType: "blob",
    });
};
