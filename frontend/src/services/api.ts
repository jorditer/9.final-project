import axios, { 
  AxiosInstance, 
  InternalAxiosRequestConfig, 
  AxiosError,
  AxiosResponse 
} from 'axios';
import { authService } from './auth';

interface RefreshTokenResponse {
  accessToken: string;
  success: boolean;
}

const api: AxiosInstance = axios.create({
  baseURL: '/api',
  withCredentials: true // Enables sending cookies in cross-origin requests
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authService.getToken();
    
    if (token) {
      // Ensure headers object exists before setting Authorization
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor to handle token refresh and authentication failures
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  
  // Handle errors with potential token refresh
  async (error: AxiosError) => {
    if (!error.config) {
      return Promise.reject(error);
    }

    // Add type information for our retry flag
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // attempt refresh if:
    // 1. It's a 401 error (unauthorized)
    // 2. We haven't tried to refresh yet for this request
    // 3. We're not already on the login page
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      window.location.pathname !== '/login'
    ) {
      // Mark this request as retried to prevent infinite loops
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh the token
        const response = await axios.post<RefreshTokenResponse>(
          '/api/users/refresh-token'
        );
        const newToken = response.data.accessToken;
        authService.updateToken(newToken);
        // Update the authorization header with new token
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        if (window.location.pathname !== '/login') {
          authService.clearAuth();
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;