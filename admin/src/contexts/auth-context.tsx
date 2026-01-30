"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

interface AdminUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
}

interface AuthContextType {
    user: AdminUser | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AdminUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    // Validate session via local API proxy (same-origin cookies)
    const checkSession = useCallback(async () => {
        try {
            const res = await fetch("/api/auth/session");

            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Check session on mount
    useEffect(() => {
        checkSession();
    }, [checkSession]);

    // Revalidate session periodically (every 5 minutes)
    useEffect(() => {
        const interval = setInterval(checkSession, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [checkSession]);

    // Handle redirects
    useEffect(() => {
        if (!isLoading) {
            if (!user && pathname !== "/login") {
                router.push("/login");
            } else if (user && pathname === "/login") {
                router.push("/");
            }
        }
    }, [user, isLoading, pathname, router]);

    const login = async (email: string, password: string) => {
        // Use local API proxy for same-origin cookies (avoids cross-origin issues)
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Login failed");
        }

        setUser(data.user);
        // Use hard redirect to ensure middleware picks up new cookie
        window.location.href = "/";
    };

    const logout = async () => {
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
            });
        } catch {
            // Ignore logout errors
        }
        setUser(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, checkSession }}>
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
