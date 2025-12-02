import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/Api';

interface AuthContextType {
  user: any;
  token: string | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  register: (userData: { firstName: string; lastName: string; email: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
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
  const [token, setToken] = useState(localStorage.getItem(process.env.REACT_APP_TOKEN_KEY || 'wanfam_token'));

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await api.get('/auth/profile');
      setUser(response.data.user);
    } catch (error) {
      logout();
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

const login = async (credentials: { email: string; password: string }) => {
  try {
    const response = await api.post('/auth/login', credentials);
    const { token: newToken, user: userData, role } = response.data;
    
    setToken(newToken);
    setUser({ ...userData, role }); // Store role in user object
    
    return { success: true };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Login failed' 
    };
  }
};

  const register = async (userData: { firstName: string; lastName: string; email: string; password: string }) => {
  try {
    const response = await api.post('/auth/register', userData);
    const { token: newToken, user: registeredUser, role } = response.data;
    
    setToken(newToken);
    setUser({ ...registeredUser, role }); // Store role in user object
    
    return { success: true };
  } catch (error: any) {
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
      await api.post('/auth/forgot-password', { email });
      return { success: true };
    } catch (error:any) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Password reset request failed' 
      };
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      return { success: true };
    } catch (error:any) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Password reset failed' 
      };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      return { success: true };
    } catch (error: any) {
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
    login,
    register,
    logout,
    requestPasswordReset,
    resetPassword,
    changePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};