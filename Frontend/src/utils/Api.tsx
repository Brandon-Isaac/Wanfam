import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api/v1';
const TOKEN_KEY = process.env.REACT_APP_TOKEN_KEY || 'wanfam_token';

// Session expiration event
export const SESSION_EXPIRED_EVENT = 'session-expired';

// Request queue for retry mechanism
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Add a request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Enhanced response interceptor with better error handling
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    // Check if it's a network error (no response from server)
    if (!error.response) {
      // Network error - don't logout, just show error
      if (!navigator.onLine) {
        error.message = 'OFFLINE_MODE';
      } else {
        error.message = 'NETWORK_ERROR';
      }
      return Promise.reject(error);
    }

    const status = error.response.status;

    // Handle 401 Unauthorized
    if (status === 401) {
      // Check if this is a token-related endpoint
      const isAuthEndpoint = originalRequest.url?.includes('/auth/');
      
      if (!isAuthEndpoint && !originalRequest._retry) {
        // Only logout if it's NOT a login/register attempt
        // This prevents logout on invalid credentials during login
        if (originalRequest.url?.includes('/profile') || 
            originalRequest.url?.includes('/logout')) {
          
          // Emit session expired event for graceful handling
          const event = new CustomEvent(SESSION_EXPIRED_EVENT, {
            detail: { message: 'Your session has expired. Please log in again.' }
          });
          window.dispatchEvent(event);
          
          return Promise.reject(error);
        }
        
        // For other 401 errors, try to refresh or queue the request
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => {
              return api(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        // Emit session expired event instead of immediate redirect
        setTimeout(() => {
          const event = new CustomEvent(SESSION_EXPIRED_EVENT, {
            detail: { message: 'Your session has expired. Please log in again.' }
          });
          window.dispatchEvent(event);
          
          processQueue(error);
          isRefreshing = false;
        }, 1000);

        return Promise.reject(error);
      }
    }

    // Handle 403 Forbidden
    if (status === 403) {
      error.message = 'ACCESS_DENIED';
      return Promise.reject(error);
    }

    // Handle 500 Internal Server Error
    if (status === 500) {
      error.message = 'SERVER_ERROR';
      return Promise.reject(error);
    }

    // Handle 503 Service Unavailable
    if (status === 503) {
      error.message = 'SERVICE_UNAVAILABLE';
      return Promise.reject(error);
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

// Helper function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem(TOKEN_KEY);
};

// Helper function to get token
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// Helper function to set token
export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

// Helper function to remove token
export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export default api;