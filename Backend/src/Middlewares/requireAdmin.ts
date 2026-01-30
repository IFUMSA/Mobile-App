import { Request, Response, NextFunction } from "express";
import { User } from "../Models/User";

// Get admin emails from environment variable
const getAdminEmails = (): string[] => {
    const emails = process.env.ADMIN_EMAILS || "";
    return emails.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
};

export const requireAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const adminEmails = getAdminEmails();
        const userEmail = (req.session as any)?.userEmail?.toLowerCase();
        const userId = (req.session as any)?.userId;
        const isAdmin = (req.session as any)?.isAdmin;

        // Hybrid check: session flag, env variable, OR database role
        if (isAdmin) {
            next();
            return;
        }

        // Check env variable
        if (userEmail && adminEmails.includes(userEmail)) {
            (req.session as any).isAdmin = true;
            next();
            return;
        }

        // Check database role
        if (userId) {
            const user = await User.findById(userId);
            if (user && user.role === "admin") {
                (req.session as any).isAdmin = true;
                next();
                return;
            }
        }

        res.status(403).json({ message: "Admin access required" });
        return;
    } catch (error) {
        console.error("requireAdmin error:", error);
        res.status(403).json({ message: "Admin access required" });
        return;
    }
};
