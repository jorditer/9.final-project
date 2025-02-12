import axios from 'axios';
import { authService } from './auth';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token && !config.url?.includes('login') && !config.url?.includes('register')) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);

// Handle expired tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Only try refresh if it's an auth error and we're not already on login page
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      try {
        // Try to get a new token
        const response = await axios.post('/api/users/refresh-token', {}, { withCredentials: true });
        const newToken = response.data.accessToken;
        
        // If we got a new token, update it and retry the original request
        if (newToken) {
          authService.updateToken(newToken);
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return api(error.config);
        }
      } catch (refreshError) {
        // Only redirect to login if refresh actually failed
        authService.clearAuth();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;