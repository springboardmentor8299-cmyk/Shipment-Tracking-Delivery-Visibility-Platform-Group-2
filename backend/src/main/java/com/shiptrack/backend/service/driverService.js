import api from "./api";

export const getAllDrivers = () =>
    api.get("/admin/drivers");

export const getDriverById = (id) =>
    api.get(`/admin/drivers/${id}`);

export const createDriver = (driver) =>
    api.post("/admin/drivers", driver);

export const updateDriver = (id, driver) =>
    api.put(`/admin/drivers/${id}`, driver);

export const deleteDriver = (id) =>
    api.delete(`/admin/drivers/${id}`);