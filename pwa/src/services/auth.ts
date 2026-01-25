import api, { authApi } from "@/lib/api";

// Auth service - matches mobile app services/auth.js
// Uses authApi (Vercel proxy) for login/logout/me/register
// Uses api (direct) for other auth endpoints

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    userName: string;
    firstName: string;
    lastName: string;
}

export const authService = {
    // These use Vercel proxy (authApi) for same-origin cookies
    login: async (data: LoginData) => {
        return authApi.login(data.email, data.password);
    },

    register: async (data: RegisterData) => {
        return authApi.register(data);
    },

    logout: async () => {
        return authApi.logout();
    },

    getMe: async () => {
        return authApi.getMe();
    },

    // These go direct to backend (don't need cookies)
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
