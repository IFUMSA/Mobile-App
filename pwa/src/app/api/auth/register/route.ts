import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

/**
 * Auth Proxy: Register
 * Proxies registration to Railway backend
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Forward registration request to backend
        const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Register proxy error:", error);
        return NextResponse.json(
            { message: "Registration failed" },
            { status: 500 }
        );
    }
}
