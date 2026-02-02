import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { SESSION_EXPIRED_EVENT } from '../utils/Api';
import { AxiosError } from 'axios';

interface AuthContextType {
  user: any;
  token: string | null;
  loading: boolean;
  isOnline: boolean;
  serverError: boolean;
  sessionExpired: boolean;
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  register: (userData: { firstName: string; lastName: string; email: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
  retryConnection: () => Promise<void>;
  dismissSessionExpired: () => void;
  handleSessionExpiredRedirect: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [serverError, setServerError] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [token, setToken] = useState(localStorage.getItem(process.env.REACT_APP_TOKEN_KEY || 'wanfam_token'));

  // Monitor session expiration events
  useEffect(() => {
    const handleSessionExpired = (event: any) => {
      setSessionExpired(true);
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);

    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    };
  }, []);

  const dismissSessionExpired = () => {
    setSessionExpired(false);
  };

  const handleSessionExpiredRedirect = () => {
    setSessionExpired(false);
    logout();
  };

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setServerError(false);
      // Retry fetching user profile when back online
      if (token && !user) {
        fetchUserProfile();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [token, user]);

  const fetchUserProfile = useCallback(async () => {
    try {
      setServerError(false);
      const response = await api.get('/auth/profile');
      setUser(response.data.user);
    } catch (error: any) {
      // Differentiate between error types
      const axiosError = error as AxiosError;
      
      // Network errors (no response)
      if (!axiosError.response) {
        if (error.message === 'OFFLINE_MODE') {
          setIsOnline(false);
        } else if (error.message === 'NETWORK_ERROR') {
          setServerError(true);
        }
        // Don't logout on network errors - keep user session
      } 
      // Server errors (5xx)
      else if (axiosError.response.status >= 500) {
        setServerError(true);
        // Don't logout on server errors
      }
      // Authentication errors (401) - only then logout
      else if (axiosError.response.status === 401) {
        logout();
      }
      // Other errors - log but don't logout
      else {
        // Silent error handling
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem(process.env.REACT_APP_TOKEN_KEY || 'wanfam_token', token);
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [token, fetchUserProfile]);

  const retryConnection = async () => {
    setLoading(true);
    setServerError(false);
    await fetchUserProfile();
  };

const login = async (credentials: { email: string; password: string }) => {
  try {
    setServerError(false);
    const response = await api.post('/auth/login', credentials);
    const { token: newToken, user: userData, role } = response.data;
    
    setToken(newToken);
    setUser({ ...userData, role }); // Store role in user object
    
    return { success: true };
  } catch (error: any) {
    // Handle network errors gracefully
    if (!error.response) {
      if (error.message === 'OFFLINE_MODE') {
        setIsOnline(false);
        return { success: false, message: 'You are offline. Please check your internet connection.' };
      } else if (error.message === 'NETWORK_ERROR') {
        setServerError(true);
        return { success: false, message: 'Unable to connect to server. Please try again later.' };
      }
    }
    
    return { 
      success: false, 
      message: error.response?.data?.message || 'Login failed' 
    };
  }
};

  const register = async (userData: { firstName: string; lastName: string; email: string; password: string }) => {
  try {
    setServerError(false);
    const response = await api.post('/auth/register', userData);
    const { token: newToken, user: registeredUser, role } = response.data;
    
    setToken(newToken);
    setUser({ ...registeredUser, role }); // Store role in user object
    
    return { success: true };
  } catch (error: any) {
    // Handle network errors gracefully
    if (!error.response) {
      if (error.message === 'OFFLINE_MODE') {
        setIsOnline(false);
        return { success: false, message: 'You are offline. Please check your internet connection.' };
      } else if (error.message === 'NETWORK_ERROR') {
        setServerError(true);
        return { success: false, message: 'Unable to connect to server. Please try again later.' };
      }
    }
    
    return { 
      success: false, 
      message: error.response?.data?.message || 'Registration failed' 
    };
  }
};

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(process.env.REACT_APP_TOKEN_KEY || 'wanfam_token');
  };

  const requestPasswordReset = async (email: string) => {
    try {
      setServerError(false);
      await api.post('/auth/forgot-password', { email });
      return { success: true };
    } catch (error:any) {
      // Handle network errors gracefully
      if (!error.response) {
        if (error.message === 'OFFLINE_MODE') {
          setIsOnline(false);
          return { success: false, message: 'You are offline. Please check your internet connection.' };
        } else if (error.message === 'NETWORK_ERROR') {
          setServerError(true);
          return { success: false, message: 'Unable to connect to server. Please try again later.' };
        }
      }
      
      return { 
        success: false, 
        message: error.response?.data?.message || 'Password reset request failed' 
      };
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      setServerError(false);
      await api.post('/auth/reset-password', { token, newPassword });
      return { success: true };
    } catch (error:any) {
      // Handle network errors gracefully
      if (!error.response) {
        if (error.message === 'OFFLINE_MODE') {
          setIsOnline(false);
          return { success: false, message: 'You are offline. Please check your internet connection.' };
        } else if (error.message === 'NETWORK_ERROR') {
          setServerError(true);
          return { success: false, message: 'Unable to connect to server. Please try again later.' };
        }
      }
      
      return { 
        success: false, 
        message: error.response?.data?.message || 'Password reset failed' 
      };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setServerError(false);
      await api.post('/auth/change-password', { currentPassword, newPassword });
      return { success: true };
    } catch (error: any) {
      // Handle network errors gracefully
      if (!error.response) {
        if (error.message === 'OFFLINE_MODE') {
          setIsOnline(false);
          return { success: false, message: 'You are offline. Please check your internet connection.' };
        } else if (error.message === 'NETWORK_ERROR') {
          setServerError(true);
          return { success: false, message: 'Unable to connect to server. Please try again later.' };
        }
      }
      
      return { 
        success: false, 
        message: error.response?.data?.message || 'Password change failed' 
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    isOnline,
    serverError,
    sessionExpired,
    login,
    register,
    logout,
    requestPasswordReset,
    resetPassword,
    changePassword,
    retryConnection,
    dismissSessionExpired,
    handleSessionExpiredRedirect,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};