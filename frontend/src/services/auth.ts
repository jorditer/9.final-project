const AUTH_TOKEN_KEY = 'accessToken';
const USER_KEY = 'user';

export const authService = {
  // Store authentication information
  setAuth(accessToken, username) {
    localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
    localStorage.setItem(USER_KEY, username);
  },

  // Remove authentication information (for logout)
  clearAuth() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // Get the current authentication token
  getToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  // Get the current user
  getUser() {
    return localStorage.getItem(USER_KEY);
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  },

  // Refresh the authentication token
  updateToken(newToken) {
    localStorage.setItem(AUTH_TOKEN_KEY, newToken);
  }
};