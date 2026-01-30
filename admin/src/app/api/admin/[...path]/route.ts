import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Catch-all proxy for admin API routes
 * Forwards requests to backend with session cookie
 */
async function handleRequest(request: NextRequest, params: { path: string[] }) {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("admin_session");
        const backendSession = cookieStore.get("backend_session");

        if (!sessionCookie?.value) {
            return NextResponse.json(
                { message: "Not authenticated" },
                { status: 401 }
            );
        }

        const path = params.path.join("/");
        const url = `${BACKEND_URL}/api/admin/${path}`;

        const body = request.method !== "GET" && request.method !== "HEAD"
            ? await request.text()
            : undefined;

        // Forward the backend session cookie
        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };

        if (backendSession?.value) {
            headers["Cookie"] = `connect.sid=${backendSession.value}`;
        }

        const res = await fetch(url, {
            method: request.method,
            headers,
            body,
        });

        const data = await res.json().catch(() => ({}));
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error("Admin proxy error:", error);
        return NextResponse.json(
            { message: "Request failed" },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    const params = await context.params;
    return handleRequest(request, params);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    const params = await context.params;
    return handleRequest(request, params);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    const params = await context.params;
    return handleRequest(request, params);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    const params = await context.params;
    return handleRequest(request, params);
}

