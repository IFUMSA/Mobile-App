import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Universal API proxy - forwards ALL /api/* requests to backend with session cookies
 * Handles authentication by forwarding admin_session and backend_session cookies
 */
async function handleRequest(request: NextRequest, params: { path: string[] }) {
    try {
        const cookieStore = await cookies();
        const backendSession = cookieStore.get("backend_session");

        const path = params.path.join("/");
        const url = `${BACKEND_URL}/api/${path}`;

        // Get search params from original request
        const searchParams = request.nextUrl.searchParams.toString();
        const fullUrl = searchParams ? `${url}?${searchParams}` : url;

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

        const res = await fetch(fullUrl, {
            method: request.method,
            headers,
            body,
        });

        const data = await res.json().catch(() => ({}));

        return NextResponse.json(data, {
            status: res.status,
            headers: {
                "Set-Cookie": res.headers.get("set-cookie") || "",
            },
        });
    } catch (error) {
        console.error("API proxy error:", error);
        return NextResponse.json(
            { message: "Request failed", error: String(error) },
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

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    const params = await context.params;
    return handleRequest(request, params);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    const params = await context.params;
    return handleRequest(request, params);
}
