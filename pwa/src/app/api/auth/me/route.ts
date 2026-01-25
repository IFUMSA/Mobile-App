import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

/**
 * Auth Proxy: Get Current User
 * Uses token from cookie to fetch user from backend
 */
export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;

        if (!token) {
            return NextResponse.json(
                { message: "Not authenticated" },
                { status: 401 }
            );
        }

        // Fetch user from backend using token
        const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            // Token invalid - clear cookie
            if (response.status === 401) {
                cookieStore.delete("auth_token");
            }
            return NextResponse.json(data, { status: response.status });
        }

        // Also return token for client to store in memory
        return NextResponse.json({
            user: data.user,
            token: token,
        });
    } catch (error) {
        console.error("Get user error:", error);
        return NextResponse.json(
            { message: "Failed to get user" },
            { status: 500 }
        );
    }
}
