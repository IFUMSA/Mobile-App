import express, { type Router } from "express";
import { check } from "express-validator";
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

//Forgot Password?
authRouter.post("/forgot-password", forgotPassword);

//Verify Reset Code
authRouter.post("/verify-reset-code", verifyResetCode);

//Reset Password with token
authRouter.post("/reset-password", resetPassword);

export = authRouter;
