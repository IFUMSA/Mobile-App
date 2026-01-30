import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Public routes that don't require auth
    const publicRoutes = ["/login"];
    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

    // Check for admin session cookie (set by Vercel API route)
    const sessionCookie = request.cookies.get("admin_session");

    // If no session and trying to access protected route, redirect to login
    if (!sessionCookie && !isPublicRoute) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // If has session and on login page, redirect to dashboard
    if (sessionCookie && pathname === "/login") {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public folder)
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)",
    ],
};
