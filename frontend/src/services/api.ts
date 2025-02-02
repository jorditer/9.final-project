// frontend/src/services/api.js
import axios from 'axios';
import { authService } from './auth';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true // Important for cookies to work
});

// Add the token to every request
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token refresh when requests fail
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const res = await axios.post('/api/users/refresh-token');
        const newToken = res.data.accessToken;
        
        authService.updateToken(newToken);
        
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        authService.clearAuth();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;