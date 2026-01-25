import axios from "axios";

/**
 * API Client for Next.js PWA
 * 
 * Hybrid auth approach:
 * - Auth endpoints go through Vercel proxy (same-origin cookie)
 * - Other endpoints go direct to Railway with Bearer token
 */

// Backend URL for direct API calls
const BACKEND_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// Token stored in memory (XSS-safe, cleared on refresh)
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
    authToken = token;
};

export const getAuthToken = () => authToken;

// Create axios instance for backend direct calls
const api = axios.create({
    baseURL: BACKEND_URL,
    timeout: 60000, // 60 seconds for AI calls
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor - add auth token to requests
api.interceptors.request.use(
    (config) => {
        if (authToken) {
            config.headers.Authorization = `Bearer ${authToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Logout callback - will be set by AuthProvider
let onUnauthorized: (() => void) | null = null;

export const setOnUnauthorized = (callback: (() => void) | null) => {
    onUnauthorized = callback;
};

// Response interceptor - handle errors and auto-logout on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response) {
            const { status, data } = error.response;

            if (status === 401) {
                console.log("Unauthorized - triggering auto-logout");
                authToken = null;
                if (onUnauthorized) {
                    onUnauthorized();
                }
            }

            return Promise.reject({
                status,
                message: data.message || "An error occurred",
                errors: data.errors || [],
            });
        } else if (error.request) {
            return Promise.reject({
                status: 0,
                message: "Network error - please check your connection",
            });
        } else {
            return Promise.reject({
                status: 0,
                message: error.message || "An error occurred",
            });
        }
    }
);

// Auth API - goes through Vercel proxy (same-origin for cookies)
export const authApi = {
    async login(email: string, password: string) {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) throw data;
        // Store token in memory for direct backend calls
        if (data.token) {
            authToken = data.token;
        }
        return data;
    },

    async logout() {
        authToken = null;
        const response = await fetch("/api/auth/logout", { method: "POST" });
        return response.json();
    },

    async getMe() {
        const response = await fetch("/api/auth/me");
        const data = await response.json();
        if (!response.ok) throw data;
        // Restore token from server response
        if (data.token) {
            authToken = data.token;
        }
        return data;
    },

    async register(userData: {
        email: string;
        password: string;
        userName: string;
        firstName: string;
        lastName: string;
    }) {
        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
        });
        const data = await response.json();
        if (!response.ok) throw data;
        return data;
    },
};

export default api;
export { BACKEND_URL as API_BASE_URL };
