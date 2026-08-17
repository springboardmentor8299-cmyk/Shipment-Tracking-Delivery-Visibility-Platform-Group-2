import api from "./api";

export const getAllCustomers = () =>
    api.get("/admin/customers");

export const getCustomerById = (id) =>
    api.get(`/admin/customers/${id}`);

export const createCustomer = (customer) =>
    api.post("/admin/customers", customer);

export const updateCustomer = (id, customer) =>
    api.put(`/admin/customers/${id}`, customer);

export const deleteCustomer = (id) =>
    api.delete(`/admin/customers/${id}`);