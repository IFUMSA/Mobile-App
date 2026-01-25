import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config";

/**
 * Hybrid Auth Middleware
 * Supports multiple auth methods for different clients:
 * 1. Authorization: Bearer <token> - JWT token (mobile app, PWA)
 * 2. Session cookie - Express session (legacy, same-origin only)
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Method 1: Check Authorization header (JWT token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);

      try {
        const decoded = jwt.verify(
          token,
          config.ACCESS_TOKEN_SECRET || "fallback-secret"
        ) as { userId: string };

        // Set userId on session for compatibility with existing code
        req.session.userId = decoded.userId;
        req.session.isAuthenticated = true;
        console.log("Auth: JWT token validated, userId:", decoded.userId);
        return next();
      } catch (jwtError) {
        console.log("Auth: Invalid JWT token");
        return res.status(401).json({ message: "Invalid or expired token" });
      }
    }

    // Method 2: Check session (cookie-based auth)
    if (req.session.isAuthenticated && req.session.userId) {
      console.log("Auth: Session validated, userId:", req.session.userId);
      return next();
    }

    // No valid auth found
    console.log("Auth: No valid authentication found");
    return res.status(401).json({ message: "Unauthorized" });
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ message: "Authentication error" });
  }
};
