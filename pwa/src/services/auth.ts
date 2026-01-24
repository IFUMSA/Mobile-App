import api from "@/lib/api";

// Auth service - matches mobile app services/auth.js

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
}

export const authService = {
    login: async (data: LoginData) => {
        const response = await api.post("/api/auth/login", data);
        return response.data;
    },

    register: async (data: RegisterData) => {
        const response = await api.post("/api/auth/register", data);
        return response.data;
    },

    logout: async () => {
        const response = await api.post("/api/auth/logout");
        return response.data;
    },

    getMe: async () => {
        const response = await api.get("/api/auth/me");
        return response.data;
    },

    verifyEmail: async (token: string) => {
        const response = await api.post("/api/auth/verify-email", { token });
        return response.data;
    },

    resendVerification: async (email: string) => {
        const response = await api.post("/api/auth/resend-verification", { email });
        return response.data;
    },

    forgotPassword: async (email: string) => {
        const response = await api.post("/api/auth/forgot-password", { email });
        return response.data;
    },

    verifyOtp: async (email: string, code: string) => {
        const response = await api.post("/api/auth/verify-reset-code", { email, code });
        return response.data;
    },

    resetPassword: async (token: string, password: string) => {
        const response = await api.post("/api/auth/reset-password", {
            resetToken: token,
            newPassword: password,
        });
        return response.data;
    },
};
