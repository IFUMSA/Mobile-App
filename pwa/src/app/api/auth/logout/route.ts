import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Auth Proxy: Logout
 * Clears the auth cookie
 */
export async function POST() {
    try {
        const cookieStore = await cookies();
        cookieStore.delete("auth_token");

        return NextResponse.json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json(
            { message: "Logout failed" },
            { status: 500 }
        );
    }
}
