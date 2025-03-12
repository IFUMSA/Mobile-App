import 'express-session';

declare module 'express-session' {
   export interface SessionData {
        userId: string | unknown;
        isAuthenticated: boolean
    }
}