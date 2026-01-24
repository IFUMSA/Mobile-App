import { Request, Response, NextFunction } from "express";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session.isAuthenticated) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};
