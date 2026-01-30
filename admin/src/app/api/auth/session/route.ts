import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Admin Auth Proxy: Get Session
 * Returns admin session from httpOnly cookie
 */
export async function GET() {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("admin_session");

        if (!sessionCookie?.value) {
            return NextResponse.json(
                { message: "Not authenticated" },
                { status: 401 }
            );
        }

        const user = JSON.parse(sessionCookie.value);

        return NextResponse.json({
            user,
        });
    } catch (error) {
        console.error("Session check error:", error);
        return NextResponse.json(
            { message: "Session error" },
            { status: 500 }
        );
    }
}
