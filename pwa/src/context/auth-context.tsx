"use client";

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from "react";
import api, { setOnUnauthorized } from "@/lib/api";

/**
 * Auth Context using HTTP-only cookies (best practice for Next.js)
 * 
 * Why NOT localStorage:
 * - localStorage is vulnerable to XSS attacks
 * - Any JavaScript can read localStorage tokens
 * 
 * Why HTTP-only cookies:
 * - Cannot be accessed by JavaScript (XSS-safe)
 * - Automatically sent with requests via withCredentials
 * - Server sets/clears cookies on login/logout
 * 
 * The backend should:
 * 1. Set HTTP-only, Secure, SameSite=Strict cookie on login
 * 2. Clear cookie on logout
 * 3. Validate cookie on /api/auth/me endpoint
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
    firstName?: string;
    lastName?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const clearAuth = useCallback(() => {
        setUser(null);
    }, []);

    const refreshUser = useCallback(async () => {
        try {
            const response = await api.get("/api/auth/me");
            setUser(response.data.user);
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

        // Check auth status on mount - cookie is sent automatically
        const checkAuth = async () => {
            try {
                const response = await api.get("/api/auth/me");
                setUser(response.data.user);
            } catch {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();

        return () => setOnUnauthorized(null);
    }, [handleUnauthorized]);

    const login = async (email: string, password: string) => {
        // Server sets HTTP-only cookie on successful login
        const response = await api.post("/api/auth/login", { email, password });
        setUser(response.data.user);
    };

    const register = async (data: RegisterData) => {
        // Don't auto-login - user needs to verify email first
        await api.post("/api/auth/register", data);
    };

    const logout = async () => {
        try {
            // Server clears HTTP-only cookie
            await api.post("/api/auth/logout");
        } catch {
            // Ignore logout errors
        } finally {
            clearAuth();
        }
    };

    const updateProfile = async (profileData: Partial<User>) => {
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
