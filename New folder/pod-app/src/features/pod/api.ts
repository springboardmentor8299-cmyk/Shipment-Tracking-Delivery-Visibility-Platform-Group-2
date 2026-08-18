import axios from 'axios';

const API_BASE_URL = 'https://api.example.com/pod'; // Replace with your actual API base URL

export const submitProofOfDelivery = async (deliveryData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/submit`, deliveryData);
        return response.data;
    } catch (error) {
        throw new Error('Error submitting proof of delivery: ' + error.message);
    }
};

export const fetchDeliveryStatus = async (deliveryId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/status/${deliveryId}`);
        return response.data;
    } catch (error) {
        throw new Error('Error fetching delivery status: ' + error.message);
    }
};

export const uploadDeliveryPhoto = async (deliveryId, photo) => {
    const formData = new FormData();
    formData.append('photo', photo);

    try {
        const response = await axios.post(`${API_BASE_URL}/upload/${deliveryId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw new Error('Error uploading delivery photo: ' + error.message);
    }
};