import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as authService from '../services/auth';
import * as userService from '../services/user';
import { setOnUnauthorized } from '../services/api';

// Storage helper that works on both web and native
const storage = {
  async getItem(key) {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  },
  async setItem(key, value) {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  async removeItem(key) {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Handle auto-logout when API returns 401
  const handleUnauthorized = useCallback(() => {
    console.log('Auto-logout triggered by 401 response');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // Register the unauthorized callback with the API service
  useEffect(() => {
    setOnUnauthorized(handleUnauthorized);
    return () => setOnUnauthorized(null);
  }, [handleUnauthorized]);

  // Load stored auth data on app start
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await storage.getItem('authToken');
      const storedUser = await storage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.log('Error loading stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in
  const signin = useCallback(async ({ email, password }) => {
    const response = await authService.signin({ email, password });

    // Store token and user data
    await storage.setItem('authToken', response.token);
    await storage.setItem('user', JSON.stringify(response.user));

    setToken(response.token);
    setUser(response.user);
    setIsAuthenticated(true);

    return response;
  }, []);

  // Sign up
  const signup = useCallback(async ({ email, password, userName, firstName, lastName }) => {
    const response = await authService.signup({
      email,
      password,
      userName,
      firstName,
      lastName,
    });
    return response;
  }, []);

  // Store auth data (called after successful login via React Query)
  const setAuthData = useCallback(async ({ token: newToken, user: newUser }) => {
    await storage.setItem('authToken', newToken);
    await storage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    setIsAuthenticated(true);
  }, []);

  // Sign out
  const signout = useCallback(async () => {
    try {
      await storage.removeItem('authToken');
      await storage.removeItem('user');
    } catch (error) {
      console.log('Error clearing auth data:', error);
    }

    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // Forgot password
  const forgotPassword = useCallback(async (email) => {
    return await authService.forgotPassword(email);
  }, []);

  // Verify reset code
  const verifyResetCode = useCallback(async ({ email, code }) => {
    return await authService.verifyResetCode({ email, code });
  }, []);

  // Reset password
  const resetPassword = useCallback(async ({ resetToken, newPassword }) => {
    return await authService.resetPassword({ resetToken, newPassword });
  }, []);

  // Resend verification email
  const resendVerification = useCallback(async (email) => {
    return await authService.resendVerification(email);
  }, []);

  // Update user profile
  const updateProfile = useCallback(async (profileData) => {
    const response = await userService.updateProfile(profileData);

    // Update stored user data
    const updatedUser = response.user;
    await storage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);

    return response;
  }, []);

  // Refresh user profile from server
  const refreshProfile = useCallback(async () => {
    const response = await userService.getProfile();
    const updatedUser = response.user;
    await storage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    return response;
  }, []);

  const contextValue = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated,
      setAuthData,
      signin,
      signup,
      signout,
      forgotPassword,
      verifyResetCode,
      resetPassword,
      resendVerification,
      updateProfile,
      refreshProfile,
    }),
    [user, token, isLoading, isAuthenticated, setAuthData, signin, signup, signout, forgotPassword, verifyResetCode, resetPassword, resendVerification, updateProfile, refreshProfile]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
