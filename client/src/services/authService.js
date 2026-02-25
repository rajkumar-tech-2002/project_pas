import api from './api';

export const loginUser = async (username, password, role) => {
    try {
        const response = await api.post('/auth/login', { username, password, role });
        if (response.data) {
            localStorage.setItem('currentUser', JSON.stringify(response.data));
            return response.data;
        }
        return null;
    } catch (error) {
        console.error('Login error:', error.response?.data?.error || error.message);
        throw error;
    }
};

export const logoutUser = () => {
    localStorage.removeItem('currentUser');
};

export const getCurrentUser = () => {
    const data = localStorage.getItem('currentUser');
    return data ? JSON.parse(data) : null;
};
