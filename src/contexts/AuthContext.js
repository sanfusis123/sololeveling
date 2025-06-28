import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';
import toast from '../utils/toast';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await authService.getCurrentUser();
        setUser(response.data);
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      
      // Get user data
      const userResponse = await authService.getCurrentUser();
      const userData = userResponse.data;
      
      // Check if user is active
      if (!userData.is_active) {
        localStorage.removeItem('token');
        toast.error('Your account is pending approval. Please contact an administrator.');
        return { success: false, error: 'Account not activated' };
      }
      
      setUser(userData);
      toast.success('Welcome back!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      await authService.register(userData);
      
      // Don't auto-login since account needs approval
      toast.success('Account created successfully! Please wait for admin approval before logging in.');
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateProfile = async (userData) => {
    try {
      const response = await authService.updateCurrentUser(userData);
      setUser(response.data);
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};