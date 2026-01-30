import express, { type Router, Request, Response } from "express";
import { check } from "express-validator";
import { requireAuth } from "../Middlewares/requireAuth";
import {
  createUser,
  resendVerificationEmail,
  verifyUser,
  signInUser,
  resetPassword,
  forgotPassword,
  verifyResetCode,
  //   signinWithGoogle,
} from "../Controllers/authController";
import { User } from "../Models/User";

const authRouter: Router = express.Router();

// Create New User
authRouter.post(
  "/signup",
  [
    check("email", "Please Enter A Valid email").isEmail(),
    check("password", "A Valid Password Is Required").isStrongPassword(),
  ],
  createUser
);

// Alias for signup
authRouter.post(
  "/register",
  [
    check("email", "Please Enter A Valid email").isEmail(),
    check("password", "A Valid Password Is Required").isStrongPassword(),
  ],
  createUser
);

//Verify User
authRouter.get("/verify-email", verifyUser);

//Request a new Verification mail
authRouter.post(
  "/resend-verification",
  [check("email", "Please Enter A Valid email").isEmail()],
  resendVerificationEmail
);

//Login using email and password
authRouter.post(
  "/signin",
  [
    check("email", "Please Enter A Valid email").isEmail(),
    check("password", "A Valid Password Is Required").isStrongPassword(),
  ],
  signInUser
);

// Alias for signin (PWA uses /login)
authRouter.post(
  "/login",
  [
    check("email", "Please Enter A Valid email").isEmail(),
    check("password", "A Valid Password Is Required").isStrongPassword(),
  ],
  signInUser
);

// Get current user (check auth status)
authRouter.get("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json({
      user: {
        _id: user._id,
        email: user.email,
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePic: user.profilePic,
        bio: user.bio,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
        level: user.level,
        faculty: user.faculty,
      },
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Logout
authRouter.post("/logout", (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      res.status(500).json({ message: "Logout failed" });
      return;
    }
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully" });
  });
});

//Forgot Password?
authRouter.post("/forgot-password", forgotPassword);

//Verify Reset Code
authRouter.post("/verify-reset-code", verifyResetCode);

//Reset Password with token
authRouter.post("/reset-password", resetPassword);

export = authRouter;
