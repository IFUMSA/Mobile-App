import { NextFunction, Request, Response } from "express";
import config from "../config";
import { User } from "../Models/User";

const requireVerified = async (
  req: Request & { session: { userId: string } },
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!user.isVerified) {
      res.status(403).json({
        message:
          "Email Not verified. Please verify your email to access this resource",
        needsVerification: true,
      });
      return;
    }
    next();
  } catch (error) {
    console.error("Verification middleware error: ", error);
    res.status(500).json({ message: "server error" });
    return;
  }
};

export default requireVerified;
