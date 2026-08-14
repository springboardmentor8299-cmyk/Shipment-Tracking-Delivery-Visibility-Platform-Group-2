import api from "./axios";

export const getEmployees = () => {
    return api.get("/users/employees");
};

export const createEmployee = (data) => {
    return api.post("/users/employees", data);
};

export const deleteEmployee = (id) => {
    return api.delete(`/users/employees/${id}`);
};
