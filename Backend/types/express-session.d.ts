import "express-session";

declare module "express-session" {
    interface SessionData {
        userId: unknown;
        userEmail: string;
        isAdmin: boolean;
        isAuthenticated: boolean;
    }
}
