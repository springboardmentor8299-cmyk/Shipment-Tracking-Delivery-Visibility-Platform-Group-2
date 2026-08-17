import api from "./api";

export const getReport = () =>
    api.get("/admin/reports");