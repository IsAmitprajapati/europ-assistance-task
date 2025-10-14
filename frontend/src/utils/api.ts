import api from './Axios';
import { endpoints } from './endpoint';

export const handleLogout = async () => {
    try {
        const response = await api.get(endpoints.logout);

        if (response?.data?.success) {
            localStorage.removeItem('token');
            window.location.href = '/auth/login'; // Redirect to login page
        }
    } catch (error) {
        console.error("Logout failed", error);
    }
};
