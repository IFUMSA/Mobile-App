import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

/**
 * Admin Auth Proxy: Login
 * Proxies login to Railway backend and stores admin token in httpOnly cookie
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Forward login request to backend
        const response = await fetch(`${BACKEND_URL}/api/admin/login`, {
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

        // Store admin session token in httpOnly cookie
        const cookieStore = await cookies();
        cookieStore.set("admin_session", JSON.stringify({
            id: data.user.id,
            email: data.user.email,
            firstName: data.user.firstName,
            lastName: data.user.lastName,
        }), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });

        // Return user data
        return NextResponse.json({
            message: data.message,
            user: data.user,
        });
    } catch (error) {
        console.error("Admin login proxy error:", error);
        return NextResponse.json(
            { message: "Authentication failed" },
            { status: 500 }
        );
    }
}
