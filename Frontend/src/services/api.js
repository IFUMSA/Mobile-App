import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Base URL for API - change this to your backend URL
// For local development with Expo, use your computer's IP address
// e.g., 'http://192.168.1.100:5000' (not localhost)
const API_BASE_URL = 'http://172.20.10.2:5000';

// Storage helper for cross-platform support
const getToken = async () => {
  if (Platform.OS === 'web') {
    return localStorage.getItem('authToken');
  }
  return await SecureStore.getItemAsync('authToken');
};

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token to requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getToken();
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

// Response interceptor - handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      if (status === 401) {
        // Token expired or invalid - could trigger logout here
        console.log('Unauthorized - token may be expired');
      }
      
      // Return a consistent error format
      return Promise.reject({
        status,
        message: data.message || 'An error occurred',
        errors: data.errors || [],
      });
    } else if (error.request) {
      // Request made but no response received
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
