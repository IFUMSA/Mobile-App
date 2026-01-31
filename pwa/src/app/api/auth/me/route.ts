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

        console.log("[/api/auth/me] Token exists:", !!token);

        if (!token) {
            return NextResponse.json(
                { message: "Not authenticated" },
                {
                    status: 401,
                    headers: {
                        "Cache-Control": "no-store, no-cache, must-revalidate",
                    }
                }
            );
        }

        // Fetch user from backend using token
        const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store", // Don't cache backend response
        });

        const data = await response.json();

        console.log("[/api/auth/me] Backend response status:", response.status);

        if (!response.ok) {
            // Only delete cookie on explicit auth failure, not on network errors
            if (response.status === 401) {
                console.log("[/api/auth/me] Token invalid, clearing cookie");
                cookieStore.delete("auth_token");
            }
            return NextResponse.json(data, {
                status: response.status,
                headers: {
                    "Cache-Control": "no-store, no-cache, must-revalidate",
                }
            });
        }

        // Also return token for client to store in memory
        return NextResponse.json({
            user: data.user,
            token: token,
        }, {
            headers: {
                "Cache-Control": "no-store, no-cache, must-revalidate",
            }
        });
    } catch (error) {
        console.error("[/api/auth/me] Error:", error);
        // Don't delete cookie on network errors - might be temporary
        return NextResponse.json(
            { message: "Failed to get user" },
            {
                status: 500,
                headers: {
                    "Cache-Control": "no-store, no-cache, must-revalidate",
                }
            }
        );
    }
}

