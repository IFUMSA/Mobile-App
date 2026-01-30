import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Admin Auth Proxy: Logout
 * Clears admin session cookie
 */
export async function POST() {
    try {
        const cookieStore = await cookies();
        cookieStore.delete("admin_session");

        return NextResponse.json({
            message: "Logged out successfully",
        });
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json(
            { message: "Logout failed" },
            { status: 500 }
        );
    }
}
