import express, { type Router } from "express";
import { check } from "express-validator";
import {
  createUser,
  resendVerificationEmail,
  verifyUser,
  signInUser
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
  authRouter.get(
    '/verify-email',
    verifyUser
  )

  //Request a new Verification mail
  authRouter.post('/resend-verification', resendVerificationEmail)

  //Login using email and password
  authRouter.post('/signin', signInUser)


  export = authRouter;