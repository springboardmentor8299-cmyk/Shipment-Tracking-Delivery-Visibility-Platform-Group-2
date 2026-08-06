import api from "./api";

//  List / Get
export const getAllRoutes = async (status) => {
    const response = await api.get("/admin/routes", {
        params: status ? { status } : {},
    });
    return response.data;
};

export const getRouteById = async (id) => {
    const response = await api.get(`/admin/routes/${id}`);
    return response.data;
};

//  (i) Route Planning
export const planRoute = async (payload) => {
    const response = await api.post("/admin/routes/plan", payload);
    return response.data;
};

// (ii) Route Optimization
export const optimizeRoute = async (id, strategy) => {
    const response = await api.post(`/admin/routes/${id}/optimize`, { strategy });
    return response.data;
};

//(iii) Route History
export const getRouteHistory = async () => {
    const response = await api.get("/admin/routes/history");
    return response.data;
};

//  (iv) Distance Calculations
export const calculateDistance = async (origin, destination) => {
    const response = await api.get("/admin/routes/distance", {
        params: { origin, destination },
    });
    return response.data;
};

//  (v) Traffic-Aware Routing
export const refreshRouteTraffic = async (id) => {
    const response = await api.post(`/admin/routes/${id}/refresh-traffic`);
    return response.data;
};

// (vi) Route Analytics
export const getRouteAnalytics = async () => {
    const response = await api.get("/admin/routes/analytics");
    return response.data;
};

// Lifecycle
export const updateRouteStatus = async (id, status) => {
    const response = await api.put(`/admin/routes/${id}/status`, { status });
    return response.data;
};

export const deleteRoute = async (id) => {
    await api.delete(`/admin/routes/${id}`);
};
