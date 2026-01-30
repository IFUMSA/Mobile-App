import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const res = await fetch(`${BACKEND_URL}/api/admin/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json(data, { status: res.status });
        }

        // Get backend session cookie
        const setCookieHeader = res.headers.get("set-cookie");

        const cookieStore = await cookies();

        // Store user info for session validation
        cookieStore.set("admin_session", JSON.stringify(data.user), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });

        // Store backend session cookie for proxying
        if (setCookieHeader) {
            // Extract the session cookie value (connect.sid=xxx)
            const match = setCookieHeader.match(/connect\.sid=([^;]+)/);
            if (match) {
                cookieStore.set("backend_session", match[1], {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    path: "/",
                    maxAge: 60 * 60 * 24 * 7,
                });
            }
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { message: "Login failed" },
            { status: 500 }
        );
    }
}

