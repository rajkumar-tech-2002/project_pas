import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const notificationService = {
    getNotifications: async (userId, role) => {
        const response = await axios.get(`${API_URL}/notifications`, {
            params: { userId, role }
        });
        return response.data;
    },

    markAsRead: async (id) => {
        const response = await axios.put(`${API_URL}/notifications/${id}/read`);
        return response.data;
    },

    markAllAsRead: async (userId, role) => {
        const response = await axios.put(`${API_URL}/notifications/read-all`, { userId, role });
        return response.data;
    }
};

export default notificationService;
