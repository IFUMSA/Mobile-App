import { Request, Response, NextFunction } from "express";

// Get admin emails from environment variable
const getAdminEmails = (): string[] => {
    const emails = process.env.ADMIN_EMAILS || "";
    return emails.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
};

export const requireAdmin = async (
    req: Request & { session: { isAdmin?: boolean; userEmail?: string } },
    res: Response,
    next: NextFunction
) => {
    const adminEmails = getAdminEmails();
    const userEmail = req.session.userEmail?.toLowerCase();

    if (!userEmail || !adminEmails.includes(userEmail)) {
        res.status(403).json({ message: "Admin access required" });
        return;
    }

    req.session.isAdmin = true;
    next();
};
