import { Request, Response, NextFunction } from "express";

export const requireAuth = async (
  req: Request & {
    session: {
      isAuthenticated: boolean;
    };
  },
  res: Response,
  next: NextFunction
) => {
  if (!req.session.isAuthenticated) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};
