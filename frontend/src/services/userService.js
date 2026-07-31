import api from './api';

export const getAllUsers = async () => {
    const response = await api.get('/users', {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

export const createStaffUser = async (staffData) => {
    const response = await api.post('/admin/users', staffData);
    return response.data;
};

export default { getAllUsers, createStaffUser };