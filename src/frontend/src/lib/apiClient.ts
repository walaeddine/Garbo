import axios from 'axios';

const apiClient = axios.create({
    baseURL: '/api', // Relative path for same-origin deployment (Docker/Production)
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Send cookies
});

// Request interceptor: No need to attach token manually (Cookie handles it)
// We keep it empty or remove it. Removing it completely is cleaner.

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Call refresh endpoint (cookies sent/received automatically)
                await axios.post('/api/token/refresh', {}, { withCredentials: true });

                // Retry original request (new cookies will be sent)
                return apiClient(originalRequest);
            } catch (refreshError) {
                // Refresh failed - user is not logged in / session expired
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
