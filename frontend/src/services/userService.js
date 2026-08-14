import { getEmployees, createEmployee, deleteEmployee } from "../api/userApi";

export const fetchEmployees = async () => {
    const response = await getEmployees();
    return response.data;
};

export const addEmployee = async (data) => {
    const response = await createEmployee(data);
    return response.data;
};

export const removeEmployee = async (id) => {
    const response = await deleteEmployee(id);
    return response.data;
};
