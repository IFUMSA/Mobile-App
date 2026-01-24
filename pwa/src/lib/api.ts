import axios from "axios";

/**
 * API Client for Next.js PWA
 * 
 * Uses HTTP-only cookies for authentication (best practice):
 * - withCredentials: true sends cookies automatically
 * - No tokens in localStorage (XSS-safe)
 * - Server manages session via HTTP-only cookies
 */

// Base URL for API
const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000, // 60 seconds for AI calls
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // CRITICAL: sends HTTP-only cookies automatically
});

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

export default api;
export { API_BASE_URL };
