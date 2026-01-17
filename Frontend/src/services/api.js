import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Base URL for API - uses environment variable for flexibility
// Set EXPO_PUBLIC_API_BASE_URL in .env (local) or EAS secrets (production)
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5000';

// Storage helper for cross-platform support
const storage = {
  async getItem(key) {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  },
  async removeItem(key) {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

// Logout callback - will be set by AuthProvider
let onUnauthorized = null;

export const setOnUnauthorized = (callback) => {
  onUnauthorized = callback;
};

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Increased to 60 seconds for AI calls
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token to requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await storage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle common errors and auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        // Token expired or invalid - trigger auto-logout
        console.log('Unauthorized - triggering auto-logout');

        // Clear stored credentials
        try {
          await storage.removeItem('authToken');
          await storage.removeItem('user');
        } catch (e) {
          console.log('Error clearing auth data:', e);
        }

        // Notify auth context to update state
        if (onUnauthorized) {
          onUnauthorized();
        }
      }

      return Promise.reject({
        status,
        message: data.message || 'An error occurred',
        errors: data.errors || [],
      });
    } else if (error.request) {
      return Promise.reject({
        status: 0,
        message: 'Network error - please check your connection',
      });
    } else {
      return Promise.reject({
        status: 0,
        message: error.message || 'An error occurred',
      });
    }
  }
);

export default api;
export { API_BASE_URL };
