import api from './api';

export const getAllUsers = async () => {
    const response = await api.get('/users', {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

export default { getAllUsers };
