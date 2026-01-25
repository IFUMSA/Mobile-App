import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

/**
 * Auth Proxy: Login
 * Proxies login to Railway backend and stores token in httpOnly cookie
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Forward login request to backend
        const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        // Store token in httpOnly cookie (same-origin, secure)
        const cookieStore = await cookies();
        cookieStore.set("auth_token", data.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });

        // Return user data (token also returned for memory storage)
        return NextResponse.json({
            message: data.message,
            token: data.token,
            user: data.user,
        });
    } catch (error) {
        console.error("Login proxy error:", error);
        return NextResponse.json(
            { message: "Authentication failed" },
            { status: 500 }
        );
    }
}
