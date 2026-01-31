"use client";

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from "react";
import { authApi, setOnUnauthorized, setAuthToken } from "@/lib/api";

/**
 * Auth Context with Hybrid Auth
 * 
 * How it works:
 * 1. Login/logout go through Vercel proxy (/api/auth/*) - sets httpOnly cookie
 * 2. Token is also stored in memory for direct backend calls
 * 3. On page refresh, /api/auth/me restores token from cookie
 * 
 * Why this approach:
 * - HttpOnly cookie survives refresh (same-origin via Vercel)
 * - Token in memory for direct Railway API calls
 * - Works on mobile Chrome (no third-party cookie issues)
 */

interface User {
    _id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    userName?: string;
    bio?: string;
    hasCompletedOnboarding?: boolean;
    level?: string;
    faculty?: string;
    profilePic?: string;
    studentClass?: string;
    matricNumber?: string;
    phone?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
}

interface RegisterData {
    email: string;
    password: string;
    userName: string;
    firstName: string;
    lastName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const clearAuth = useCallback(() => {
        setUser(null);
        setAuthToken(null);
    }, []);

    const refreshUser = useCallback(async () => {
        try {
            const data = await authApi.getMe();
            setUser(data.user);
        } catch {
            clearAuth();
        }
    }, [clearAuth]);

    const handleUnauthorized = useCallback(() => {
        console.log("Auto-logout triggered by 401 response");
        clearAuth();
    }, [clearAuth]);

    useEffect(() => {
        setOnUnauthorized(handleUnauthorized);

        // Check auth status on mount - uses cookie via Vercel proxy
        const checkAuth = async (retryCount = 0) => {
            try {
                console.log(`[Auth] Checking auth (attempt ${retryCount + 1})...`);
                const data = await authApi.getMe();
                console.log("[Auth] User authenticated:", data.user?.email);
                setUser(data.user);
                // Store token in memory for direct API calls
                if (data.token) {
                    setAuthToken(data.token);
                }
            } catch (error: any) {
                console.log("[Auth] Check failed:", error?.message || "Unknown error");
                // Retry once on failure (handles race conditions on rapid reload)
                if (retryCount < 1 && error?.status !== 401) {
                    console.log("[Auth] Retrying in 500ms...");
                    await new Promise(resolve => setTimeout(resolve, 500));
                    return checkAuth(retryCount + 1);
                }
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();

        return () => setOnUnauthorized(null);
    }, [handleUnauthorized]);

    const login = async (email: string, password: string) => {
        const data = await authApi.login(email, password);
        setUser(data.user);
    };

    const register = async (data: RegisterData) => {
        await authApi.register(data);
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } catch {
            // Ignore logout errors
        } finally {
            clearAuth();
        }
    };

    const updateProfile = async (profileData: Partial<User>) => {
        // Import api here to avoid circular dependency
        const api = (await import("@/lib/api")).default;
        const response = await api.put("/api/user/profile", profileData);
        setUser(response.data.user);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                register,
                logout,
                refreshUser,
                updateProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export { AuthContext };
