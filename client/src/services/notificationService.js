import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const notificationService = {
    getNotifications: async (userId, role) => {
        const response = await axios.get(`${API_URL}/notifications`, {
            params: { userId, role }
        });

        // Format dates in the response data if they exist
        if (response.data && Array.isArray(response.data)) {
            return response.data.map(notif => {
                if (notif.created_at) {
                    const date = new Date(notif.created_at);
                    const day = String(date.getDate()).padStart(2, '0');
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const year = date.getFullYear();
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');
                    notif.formatted_date = `${day}-${month}-${year} ${hours}:${minutes}`;
                }
                return notif;
            });
        }

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
