import {
    getAnalyticsOverview,
    getTrends,
    getStatusDistribution,
    getDeliveryReport,
    getDeliveryReportCsv,
} from "../api/analyticsApi";

export const fetchAnalyticsOverview = async () => {
    const response = await getAnalyticsOverview();
    return response.data;
};

export const fetchTrends = async (days = 30) => {
    const response = await getTrends(days);
    return response.data;
};

export const fetchStatusDistribution = async (days = 30) => {
    const response = await getStatusDistribution(days);
    return response.data;
};

export const fetchDeliveryReport = async (days = 30) => {
    const response = await getDeliveryReport(days);
    return response.data;
};

export const downloadDeliveryReportCsv = async (days = 30) => {
    const response = await getDeliveryReportCsv(days);
    const blob = new Blob([response.data], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "delivery-performance-report.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};
