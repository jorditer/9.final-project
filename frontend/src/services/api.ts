// frontend/src/services/api.ts
import axios, { 
  AxiosInstance, 
  InternalAxiosRequestConfig, 
  AxiosError,
  AxiosResponse 
 } from 'axios';
import { authService } from './auth';

// Define the structure of our refresh token response
interface RefreshTokenResponse {
  accessToken: string;
  success: boolean;
}

// Create a fully typed axios instance with our base configuration
const api: AxiosInstance = axios.create({
  baseURL: '/api',
  withCredentials: true, // This is important for cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to automatically add authentication token to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authService.getToken();
    
    // Add token to all requests except login and register
    if (token && !config.url?.includes('login') && !config.url?.includes('register')) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor to handle token refresh and authentication failures
api.interceptors.response.use(
  // Pass through successful responses
  (response: AxiosResponse) => response,
  
  // Handle errors with potential token refresh
  async (error: AxiosError) => {
    // Ensure we have a config object to work with
    if (!error.config) {
      return Promise.reject(error);
    }
 
    // Add type information for our retry flag
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
 
    // Only attempt refresh if:
    // 1. It's a 401 error (unauthorized)
    // 2. We haven't tried to refresh yet for this request
    // 3. We're not already on the login page
    // 4. We're not trying to log out
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      window.location.pathname !== '/login' &&
      !originalRequest.url?.includes('logout')
    ) {
      // Mark this request as retried to prevent infinite loops
      originalRequest._retry = true;
      
      try {
        // Use normal axios for refresh token since it includes cookies
        const response = await axios.post<RefreshTokenResponse>(
          '/api/users/refresh-token',
          {},
          { withCredentials: true }
        );
        
        // Extract the new token
        const newToken = response.data.accessToken;
        
        // Update stored token
        authService.updateToken(newToken);
        
        // Update the authorization header with new token
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        // Retry the original request with new token
        return api(originalRequest);
      } catch (refreshError) {
        // Only clear auth and redirect if we're not already on login page
        if (window.location.pathname !== '/login') {
          // Clear authentication state
          authService.clearAuth();
          
          // Redirect to login page
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
 
    // If error wasn't a 401 or refresh failed, reject with original error
    return Promise.reject(error);
  }
);

export default api;